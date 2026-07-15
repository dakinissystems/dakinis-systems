# Smoke Hub timeline writer (Internal API POST /events -> hub.timeline -> dashboard)
#
# Uso:
#   $env:DAKINIS_INTERNAL_SERVICE_KEY = "..."
#   $env:DAKINIS_PLATFORM_USER_ID = "uuid-real-de-dakinis-auth"
#   .\scripts\smoke-hub-timeline.ps1

param(
    [string]$GatewayUrl = $(if ($env:DAKINIS_GATEWAY_URL) { $env:DAKINIS_GATEWAY_URL } else { "https://api.dakinissystems.com" }),
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } elseif ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { "" }),
    [string]$PlatformUserId = $env:DAKINIS_PLATFORM_USER_ID
)

$ErrorActionPreference = "Stop"
$GatewayUrl = $GatewayUrl.TrimEnd("/")
$InternalBase = "$GatewayUrl/internal"

if (-not $InternalKey) { throw "Set DAKINIS_INTERNAL_SERVICE_KEY" }
if (-not $PlatformUserId) { throw "Set DAKINIS_PLATFORM_USER_ID (UUID dakinis_auth)" }

function Invoke-SmokeJson {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [string]$Body = $null)
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    if ($Body) {
        $tmp = New-TemporaryFile
        [System.IO.File]::WriteAllText($tmp, $Body, [System.Text.UTF8Encoding]::new($false))
        $raw = curl.exe -s -X $Method -H "Authorization: Bearer $InternalKey" -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method -H "Authorization: Bearer $InternalKey" -H "Content-Type: application/json" --data-binary "@$tmp" $Url)
        Remove-Item $tmp -Force
    } else {
        $raw = curl.exe -s -H "Authorization: Bearer $InternalKey" $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $InternalKey" $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if ($code -notin 200, 201, 202) { throw "FAIL $Name HTTP $code" }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Hub timeline smoke" -ForegroundColor Green
Write-Host "User: $PlatformUserId" -ForegroundColor DarkGray

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$eventBody = (@{
    event = "stream.automation.changed"
    userId = $PlatformUserId
    payload = @{
        name = "smoke-hub-timeline-$stamp"
        source = "smoke-hub-timeline.ps1"
    }
} | ConvertTo-Json -Compress)

Invoke-SmokeJson -Name "POST platform event" -Url "$InternalBase/events" -Method "POST" -Body $eventBody | Out-Null

Start-Sleep -Seconds 2

$dash = Invoke-SmokeJson -Name "Hub dashboard (fresh)" -Url "$InternalBase/hub/dashboard/aggregated/${PlatformUserId}?fresh=1"
$json = $dash.Raw | ConvertFrom-Json
$timelineCount = $json.summary.timelineCount
$automationEnabled = $json.db.stream_automation_enabled

Write-Host ""
Write-Host "  timelineCount=$timelineCount" -ForegroundColor $(if ($timelineCount -gt 0) { "Green" } else { "Yellow" })
if ($null -ne $automationEnabled) {
    Write-Host "  stream_automation_enabled=$automationEnabled (048 OK)" -ForegroundColor Green
} else {
    Write-Host "  stream_automation_enabled missing — aplicar 048_hub_dashboard_automation.sql" -ForegroundColor Yellow
}

if ($timelineCount -eq 0) {
    Write-Host ""
    Write-Host "WARN: timeline vacio — verifica deploy internal-api 9d6df29+ y tabla hub.timeline" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OK - smoke hub timeline completado." -ForegroundColor Green

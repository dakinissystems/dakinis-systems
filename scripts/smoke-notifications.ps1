# Smoke Notifications — enqueue + inbox (v1 persist hub.notifications).
param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$UserId = $env:DAKINIS_USER_ID,
    [int]$WaitSec = 4
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

$PlaceholderUser = $false
if (-not $UserId) {
    $UserId = "00000000-0000-4000-8000-000000000001"
    $PlaceholderUser = $true
    Write-Host "Tip: define DAKINIS_USER_ID (uuid en dakinis_auth.users) para probar persist inbox" -ForegroundColor DarkYellow
}

function Invoke-Smoke {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [string]$Body = $null, [switch]$AllowNon2xx)
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    if ($Body) {
        $tmp = New-TemporaryFile
        [System.IO.File]::WriteAllText($tmp, $Body, [System.Text.UTF8Encoding]::new($false))
        $raw = curl.exe -s -X $Method -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" -X $Method -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        Remove-Item $tmp -Force
    } else {
        $raw = curl.exe -s $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" $Url
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if (-not $AllowNon2xx -and $code -notmatch "^2") { throw "FAIL $Name (HTTP $code)" }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Notifications smoke - $BaseUrl" -ForegroundColor Green

$health = Invoke-Smoke -Name "notifications health" -Url "$BaseUrl/notifications/health"
$healthJson = $health.Raw | ConvertFrom-Json
if ($healthJson.postgres) {
    Write-Host "Postgres: enabled=$($healthJson.postgres.enabled) ok=$($healthJson.postgres.ok)" -ForegroundColor DarkGray
}

$slug = "smoke-$(Get-Date -Format 'HHmmss')"
$sendBody = (@{
    userId  = $UserId
    channel = "in-app"
    type    = "smoke.test"
    payload = @{
        message = "hello inbox $slug"
        product = "hub"
        title   = "Smoke notification"
    }
} | ConvertTo-Json -Compress)

Invoke-Smoke -Name "notifications send (in-app)" -Url "$BaseUrl/notifications/v1/send" -Method "POST" -Body $sendBody | Out-Null

if ($WaitSec -gt 0) {
    Write-Host "Esperando ${WaitSec}s worker..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $WaitSec
}

if ($PlaceholderUser) {
    Write-Host ""
    Write-Host "Omitido inbox persist - requiere DAKINIS_USER_ID real (FK dakinis_auth.users)" -ForegroundColor DarkYellow
} else {
    $inbox = Invoke-Smoke -Name "notifications inbox" -Url "$BaseUrl/notifications/v1/inbox/$UserId"
    $inboxJson = $inbox.Raw | ConvertFrom-Json
    if ($inboxJson.stub -eq $true) {
        Write-Host "Inbox stub (DATABASE_URL no configurada en worker/API)" -ForegroundColor Yellow
    } elseif (@($inboxJson.items).Count -lt 1) {
        Write-Host "Inbox vacio - verifica worker DATABASE_URL y que el send haya persistido" -ForegroundColor Yellow
    } else {
        Write-Host "Inbox hits: $(@($inboxJson.items).Count) unread=$($inboxJson.unread)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "OK - Notifications smoke complete" -ForegroundColor Green

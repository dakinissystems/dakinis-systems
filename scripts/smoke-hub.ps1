# Smoke Hub dashboard (Internal API + Hub SPA).
# Usage:
#   .\scripts\smoke-hub.ps1
#   .\scripts\smoke-hub.ps1 -UserId "uuid" -ServiceKey "key"
#   .\scripts\smoke-hub.ps1 -HubUrl "https://hub.dakinissystems.com" -UserId "uuid"

param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$HubUrl = "",
    [string]$UserId = $(if ($env:DAKINIS_PLATFORM_USER_ID) { $env:DAKINIS_PLATFORM_USER_ID } else { "00000000-0000-0000-0000-000000000001" }),
    [string]$ServiceKey = $env:DAKINIS_INTERNAL_SERVICE_KEY
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

Write-Host "Hub smoke - $BaseUrl" -ForegroundColor Green

Write-Host ""
Write-Host "== internal health ==" -ForegroundColor Cyan
$health = curl.exe -s "$BaseUrl/internal/health"
Write-Host $health

Write-Host ""
Write-Host "== hub dashboard ==" -ForegroundColor Cyan
if ($ServiceKey) {
    $raw = curl.exe -s -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/$UserId"
    $code = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/$UserId"
} else {
    Write-Host "WARN: DAKINIS_INTERNAL_SERVICE_KEY not set - may get 401" -ForegroundColor Yellow
    $raw = curl.exe -s "$BaseUrl/internal/hub/dashboard/$UserId"
    $code = curl.exe -s -o NUL -w "%{http_code}" "$BaseUrl/internal/hub/dashboard/$UserId"
}

Write-Host "HTTP $code"
$stub = $null
$miDia = $null
if ($raw) {
    try {
        $dashJson = $raw | ConvertFrom-Json
        $dashJson | ConvertTo-Json -Depth 8
        $stub = $dashJson.summary.stub
        $miDia = $dashJson.miDiaEnabled
        if ($null -ne $stub) {
            $color = if ($stub) { "Yellow" } else { "Green" }
            Write-Host "  miDiaEnabled=$miDia summary.stub=$stub" -ForegroundColor $color
            if ($dashJson.db.stream_automation_enabled -ne $null) {
                Write-Host "  stream_automation_enabled=$($dashJson.db.stream_automation_enabled)" -ForegroundColor DarkGray
            }
        }
    } catch { Write-Host $raw }
}

if ($code -notmatch "^2") { throw "FAIL hub dashboard (HTTP $code)" }

if ($ServiceKey) {
    Write-Host ""
    Write-Host "== hub dashboard aggregated (BFF) ==" -ForegroundColor Cyan
    $aggRaw = curl.exe -s -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/aggregated/$UserId"
    $aggCode = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/aggregated/$UserId"
    Write-Host "HTTP $aggCode"
    if ($aggRaw) {
        try {
            $aggJson = $aggRaw | ConvertFrom-Json
            $aggJson | ConvertTo-Json -Depth 6
            Write-Host "  aggregated=$($aggJson.aggregated) cached=$($aggJson.cached)" -ForegroundColor Yellow
            if ($aggJson.summary) {
                Write-Host "  miDiaEnabled=$($aggJson.miDiaEnabled) stub=$($aggJson.summary.stub)" -ForegroundColor $(if ($aggJson.summary.stub) { "Yellow" } else { "Green" })
            }
        } catch { Write-Host $aggRaw }
    }
    if ($aggCode -notmatch "^2") { throw "FAIL hub dashboard aggregated (HTTP $aggCode)" }

    Write-Host ""
    Write-Host "== workspace summary (BFF) ==" -ForegroundColor Cyan
    $wsRaw = curl.exe -s -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/workspace/summary/$UserId"
    $wsCode = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/workspace/summary/$UserId"
    Write-Host "HTTP $wsCode"
    if ($wsRaw) {
        try { $wsRaw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $wsRaw }
    }
    if ($wsCode -notmatch "^2") { throw "FAIL workspace summary (HTTP $wsCode)" }
}

if ($HubUrl) {
    Write-Host ""
    Write-Host "== hub SPA config ==" -ForegroundColor Cyan
    $hubBase = $HubUrl.TrimEnd("/")
    $cfgCode = curl.exe -s -o NUL -w "%{http_code}" "$hubBase/hub-config.json"
    Write-Host "GET $hubBase/hub-config.json HTTP $cfgCode"
    if ($cfgCode -notmatch "^2") { throw "FAIL hub-config (HTTP $cfgCode)" }
    $dashCode = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $ServiceKey" "$hubBase/api/hub/dashboard/$UserId"
    Write-Host "GET $hubBase/api/hub/dashboard/$UserId HTTP $dashCode (legacy path + service key)"
}

Write-Host ""
Write-Host "OK - Hub dashboard reachable." -ForegroundColor Green

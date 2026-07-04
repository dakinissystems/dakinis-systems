# Smoke Hub dashboard (Internal API + Hub SPA).
# Usage:
#   .\scripts\smoke-hub.ps1
#   .\scripts\smoke-hub.ps1 -UserId "uuid" -ServiceKey "key"
#   .\scripts\smoke-hub.ps1 -HubUrl "https://hub.dakinissystems.com" -UserId "uuid"

param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$HubUrl = "",
    [string]$UserId = "00000000-0000-0000-0000-000000000001",
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
$headers = @()
if ($ServiceKey) {
    $raw = curl.exe -s -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/$UserId"
    $code = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $ServiceKey" "$BaseUrl/internal/hub/dashboard/$UserId"
} else {
    Write-Host "WARN: DAKINIS_INTERNAL_SERVICE_KEY not set — may get 401" -ForegroundColor Yellow
    $raw = curl.exe -s "$BaseUrl/internal/hub/dashboard/$UserId"
    $code = curl.exe -s -o NUL -w "%{http_code}" "$BaseUrl/internal/hub/dashboard/$UserId"
}

Write-Host "HTTP $code"
if ($raw) {
    try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
}

if ($code -notmatch "^2") { throw "FAIL hub dashboard (HTTP $code)" }

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

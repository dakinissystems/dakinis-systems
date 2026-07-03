# Smoke test Knowledge (prod or local via gateway).
# Usage:
#   .\scripts\smoke-knowledge.ps1
#   .\scripts\smoke-knowledge.ps1 -BaseUrl http://localhost

param(
    [string]$BaseUrl = "https://api.dakinissystems.com"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

function Invoke-Smoke {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [string]$Body = $null)
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    if ($Body) {
        $raw = curl.exe -s -X $Method -H "Content-Type: application/json" -d $Body $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" -X $Method -H "Content-Type: application/json" -d $Body $Url
    } else {
        $raw = curl.exe -s $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" $Url
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if ($code -notmatch "^2") { throw "FAIL $Name (HTTP $code)" }
}

Write-Host "Knowledge smoke - $BaseUrl" -ForegroundColor Green

Invoke-Smoke -Name "knowledge health (gateway)" -Url "$BaseUrl/knowledge/health"
Invoke-Smoke -Name "knowledge sources" -Url "$BaseUrl/knowledge/v1/sources"
Invoke-Smoke -Name "knowledge query stub" -Url "$BaseUrl/knowledge/v1/query" -Method "POST" -Body '{"query":"test"}'

Write-Host ""
Write-Host "OK - Knowledge API reachable via gateway." -ForegroundColor Green

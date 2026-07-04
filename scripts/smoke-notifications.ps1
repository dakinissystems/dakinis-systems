# Smoke test Notifications (prod or local via gateway).
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
        $tmp = New-TemporaryFile
        Set-Content -Path $tmp -Value $Body -Encoding utf8NoBOM -NoNewline
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
    if ($code -notmatch "^2") { throw "FAIL $Name (HTTP $code)" }
}

Write-Host "Notifications smoke - $BaseUrl" -ForegroundColor Green

Invoke-Smoke -Name "notifications health" -Url "$BaseUrl/notifications/health"
Invoke-Smoke -Name "notifications send" -Url "$BaseUrl/notifications/v1/send" -Method "POST" -Body '{"userId":"00000000-0000-0000-0000-000000000001","channel":"in-app","type":"smoke.test","payload":{"message":"hello worker"}}'

Write-Host ""
Write-Host "OK - Notifications API reachable. Check worker logs for [worker] dispatch" -ForegroundColor Green

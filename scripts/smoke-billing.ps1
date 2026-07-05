# Smoke test billing stack (prod or local via gateway).
# Usage:
#   .\scripts\smoke-billing.ps1
#   .\scripts\smoke-billing.ps1 -BaseUrl http://localhost

param(
    [string]$BaseUrl = "https://api.dakinissystems.com"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

function Invoke-Smoke {
    param(
        [string]$Name,
        [string]$Url
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host $Url
    $body = curl.exe -s $Url
    $code = curl.exe -s -o NUL -w "%{http_code}" $Url
    Write-Host "HTTP $code"
    if ($body) {
        try {
            $body | ConvertFrom-Json | ConvertTo-Json -Depth 6
        } catch {
            Write-Host $body
        }
    }
    if ($code -notmatch "^2") {
        throw "FAIL $Name (HTTP $code)"
    }
}

Write-Host "Billing smoke - $BaseUrl" -ForegroundColor Green

Invoke-Smoke -Name "billing health" -Url "$BaseUrl/billing/health"
Invoke-Smoke -Name "billing plans" -Url "$BaseUrl/billing/v1/plans"
Invoke-Smoke -Name "core stripe plans proxy" -Url "$BaseUrl/core/api/public/stripe/plans"

Write-Host ""
Write-Host "OK - billing reachable via gateway and Core proxy." -ForegroundColor Green
Write-Host "E2E probes: .\scripts\smoke-billing-e2e.ps1" -ForegroundColor Yellow
Write-Host "Degraded sync: .\scripts\smoke-billing-degraded.ps1 (INTERNAL_API_KEY + DAKINIS_BUSINESS_ID)" -ForegroundColor Yellow
Write-Host "Manual: /precios checkout · Stripe Dashboard webhook → /billing/v1/webhooks/stripe" -ForegroundColor Yellow

# Prod smoke suite — probes sin secretos; E2E si hay DAKINIS_TEST_EMAIL/PASSWORD.
param(
    [switch]$SkipBilling,
    [switch]$SkipSearch,
    [switch]$SkipNotifications,
    [switch]$SkipAi,
    [switch]$SkipHubSso,
    [switch]$E2E
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "Dakinis prod smoke suite" -ForegroundColor Green
Write-Host ""

if (-not $SkipHubSso) {
    if ($E2E -and $env:DAKINIS_TEST_EMAIL -and $env:DAKINIS_TEST_PASSWORD) {
        & "$Root/smoke-hub-sso-products.ps1"
    } else {
        Remove-Item Env:DAKINIS_TEST_EMAIL -ErrorAction SilentlyContinue
        Remove-Item Env:DAKINIS_TEST_PASSWORD -ErrorAction SilentlyContinue
        & "$Root/smoke-hub-sso-products.ps1"
    }
    Write-Host ""
}

if (-not $SkipBilling) {
    & "$Root/smoke-billing-e2e.ps1"
    Write-Host ""
}

if (-not $SkipSearch) {
    & "$Root/smoke-hub-search-query.ps1"
    Write-Host ""
}

if (-not $SkipNotifications) {
    & "$Root/smoke-notifications.ps1"
    Write-Host ""
}

if (-not $SkipAi) {
    & "$Root/smoke-ai.ps1"
    Write-Host ""
}

Write-Host "OK - prod smoke suite complete" -ForegroundColor Green

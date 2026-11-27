# Smoke live/ready + X-Request-Id for the commercial circuit.
# Usage:
#   .\scripts\smoke-circuit-health.ps1
#   .\scripts\smoke-circuit-health.ps1 -ApiBase https://api.dakinissystems.com -HubBase https://hub.dakinissystems.com

param(
    [string]$ApiBase = "https://api.dakinissystems.com",
    [string]$HubBase = "https://hub.dakinissystems.com"
)

$ErrorActionPreference = "Stop"
$ApiBase = $ApiBase.TrimEnd("/")
$HubBase = $HubBase.TrimEnd("/")

$checks = @(
    @{ Name = "core live"; Url = "$ApiBase/core/api/health/live" },
    @{ Name = "core ready"; Url = "$ApiBase/core/api/health/ready" },
    @{ Name = "billing live"; Url = "$ApiBase/billing/health/live" },
    @{ Name = "billing ready"; Url = "$ApiBase/billing/health/ready" },
    @{ Name = "internal live"; Url = "$ApiBase/internal/health/live" },
    @{ Name = "internal ready"; Url = "$ApiBase/internal/health/ready" },
    @{ Name = "auth live"; Url = "$ApiBase/auth/health/live" },
    @{ Name = "auth ready"; Url = "$ApiBase/auth/health/ready" },
    @{ Name = "hub live"; Url = "$HubBase/health/live" },
    @{ Name = "hub ready"; Url = "$HubBase/health/ready" }
)

Write-Host "Circuit health smoke — API $ApiBase · Hub $HubBase" -ForegroundColor Green
$failed = 0

foreach ($check in $checks) {
    Write-Host ""
    Write-Host "== $($check.Name) ==" -ForegroundColor Cyan
    Write-Host $check.Url
    try {
        $response = Invoke-WebRequest -Uri $check.Url -UseBasicParsing -TimeoutSec 20
        $rid = $response.Headers["X-Request-Id"]
        if (-not $rid) { $rid = $response.Headers["x-request-id"] }
        $code = [int]$response.StatusCode
        Write-Host "HTTP $code"
        Write-Host ("X-Request-Id: {0}" -f $(if ($rid) { $rid } else { "MISSING" }))
        if ($response.Content) {
            $snippet = $response.Content.Substring(0, [Math]::Min(160, $response.Content.Length))
            Write-Host $snippet
        }
        if ($code -lt 200 -or $code -ge 300 -or -not $rid) {
            Write-Host "FAIL $($check.Name)" -ForegroundColor Red
            $failed += 1
        }
    } catch {
        Write-Host "FAIL $($check.Name): $($_.Exception.Message)" -ForegroundColor Red
        $failed += 1
    }
}

Write-Host ""
if ($failed -gt 0) {
    throw "Circuit health smoke failed ($failed checks)"
}
Write-Host "OK - circuit live/ready + X-Request-Id" -ForegroundColor Green

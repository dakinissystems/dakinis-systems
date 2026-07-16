# Billing dry-run — health + plans + auth paths without creating Stripe checkout.
# Use before piloto / weekly staging check. Does NOT create a Checkout Session.
param(
    [string]$BaseUrl = $(if ($env:DAKINIS_STAGING_API_URL) { $env:DAKINIS_STAGING_API_URL } else { "https://api.dakinissystems.com" }),
    [string]$InternalKey = $(if ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { $env:DAKINIS_INTERNAL_SERVICE_KEY }),
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
$BillingBase = "$BaseUrl/billing"
$InternalBase = "$BaseUrl/internal"
$fail = 0

function Invoke-Probe {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers = @{},
        [int[]]$ExpectCodes = @(200)
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "GET $Url"
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "${k}: $($Headers[$k])"
    }
    $raw = curl.exe -s @headerArgs $Url
    $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    Write-Host "HTTP $code"
    if ($raw) {
        try { ($raw | ConvertFrom-Json | ConvertTo-Json -Depth 4 -Compress) } catch { Write-Host $raw.Substring(0, [Math]::Min(200, $raw.Length)) }
    }
    if ($ExpectCodes -notcontains $code) {
        Write-Host "FAIL $Name (HTTP $code)" -ForegroundColor Red
        $script:fail++
        if ($Strict) { throw "FAIL $Name" }
        return $null
    }
    Write-Host "OK $Name" -ForegroundColor Green
    return $raw
}

Write-Host "Billing dry-run against $BaseUrl (no Stripe session)" -ForegroundColor Yellow

Invoke-Probe -Name "billing/health" -Url "$BillingBase/health" -ExpectCodes @(200)
Invoke-Probe -Name "billing/v1/plans" -Url "$BillingBase/v1/plans" -ExpectCodes @(200, 401, 403)

if ($InternalKey) {
    $h = @{ Authorization = "Bearer $InternalKey" }
    Invoke-Probe -Name "internal/health" -Url "$InternalBase/health" -Headers $h -ExpectCodes @(200)
    Invoke-Probe -Name "internal/platform/health" -Url "$InternalBase/platform/health" -Headers $h -ExpectCodes @(200)
    # Feature flag path used by unified checkout gate
    Invoke-Probe -Name "feature-flags billing.unified" `
        -Url "$InternalBase/feature-flags/evaluate?keys=billing.unified" `
        -Headers $h `
        -ExpectCodes @(200)
} else {
    Write-Host ""
    Write-Host "SKIP internal probes — set INTERNAL_API_KEY or DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
}

Write-Host ""
if ($fail -gt 0) {
    Write-Host "Dry-run finished with $fail failure(s). No checkout was created." -ForegroundColor Red
    exit 1
}
Write-Host "Dry-run OK — paths healthy; run smoke-billing-e2e.ps1 or smoke-billing-unified-sa.ps1 -LiveCheckout for a real session." -ForegroundColor Green
exit 0

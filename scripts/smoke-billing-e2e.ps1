# Billing E2E smoke — checkout session + webhook probe.
param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$Plan = "growth",
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
    [string]$UserId = $env:DAKINIS_USER_ID,
    [string]$Email = $env:DAKINIS_CHECKOUT_EMAIL,
    [string]$InternalKey = $env:INTERNAL_API_KEY,
    [string]$CoreJwt = $env:DAKINIS_CORE_JWT
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
$CoreBase = "$BaseUrl/core/api"
$BillingBase = "$BaseUrl/billing"

function Invoke-SmokeJson {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int[]]$ExpectCodes = @(200, 201, 202)
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "${k}: $($Headers[$k])"
    }
    if ($Body) {
        $tmp = New-TemporaryFile
        [System.IO.File]::WriteAllText($tmp, $Body, [System.Text.UTF8Encoding]::new($false))
        $raw = curl.exe -s -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url)
        Remove-Item $tmp -Force
    } else {
        $raw = curl.exe -s @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
    }
    if ($ExpectCodes -notcontains $code) {
        throw "FAIL $Name (HTTP $code)"
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Billing E2E smoke - $BaseUrl" -ForegroundColor Green

$health = Invoke-SmokeJson -Name "Billing health" -Url "$BillingBase/health"
$healthJson = $health.Raw | ConvertFrom-Json
Write-Host "Stripe: $($healthJson.stripe) · Webhook: $($healthJson.webhook) · Event bus: $($healthJson.eventBus)" -ForegroundColor Yellow

Invoke-SmokeJson -Name "Webhook probe (sin firma -> 400/501)" -Url "$BillingBase/v1/webhooks/stripe" -Method "POST" -Body "{}" -ExpectCodes @(400, 501)

if ($InternalKey) {
    $checkoutBody = @{ plan = $Plan; planId = $Plan } | ConvertTo-Json -Compress
    if ($BusinessId) { $checkoutBody = (@{ plan = $Plan; planId = $Plan; businessId = $BusinessId; tenantId = $BusinessId; userId = $UserId; email = $Email } | ConvertTo-Json -Compress) }
    Invoke-SmokeJson -Name "Billing checkout (internal)" -Url "$BillingBase/v1/checkout" -Method "POST" `
        -Headers @{ Authorization = "Bearer $InternalKey" } -Body $checkoutBody
} elseif ($CoreJwt) {
    $checkoutBody = @{ plan = $Plan } | ConvertTo-Json -Compress
    Invoke-SmokeJson -Name "Core checkout proxy (JWT)" -Url "$CoreBase/public/stripe/checkout-session" -Method "POST" `
        -Headers @{ Authorization = "Bearer $CoreJwt" } -Body $checkoutBody
} else {
    Write-Host "Omitido checkout - define INTERNAL_API_KEY o DAKINIS_CORE_JWT" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - billing E2E probes." -ForegroundColor Green
Write-Host "Post-pago: Stripe webhook -> billing -> BullMQ/list -> Core sync business.plan" -ForegroundColor Yellow
Write-Host "Degraded loop: .\scripts\smoke-billing-degraded.ps1" -ForegroundColor Yellow

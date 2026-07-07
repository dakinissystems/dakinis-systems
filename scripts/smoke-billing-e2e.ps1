# Billing E2E smoke — checkout session + webhook probe + Core sync chain.
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
$WebhookUrl = "$BillingBase/v1/webhooks/stripe"

. "$PSScriptRoot/lib/core-smoke-auth.ps1"

$authBootstrap = Get-CoreSmokeAuth -CoreBase $CoreBase -CoreJwt $CoreJwt -BusinessId $BusinessId
if ($authBootstrap) {
    if (-not $CoreJwt) { $CoreJwt = $authBootstrap.Jwt }
    if (-not $BusinessId -and $authBootstrap.BusinessId) { $BusinessId = $authBootstrap.BusinessId }
}

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
Write-Host "Stripe webhook URL (Dashboard): $WebhookUrl" -ForegroundColor DarkGray

$health = Invoke-SmokeJson -Name "Billing health" -Url "$BillingBase/health"
$healthJson = $health.Raw | ConvertFrom-Json
Write-Host "Stripe: $($healthJson.stripe) · Webhook: $($healthJson.webhook) · Event bus: $($healthJson.eventBus)" -ForegroundColor Yellow

Invoke-SmokeJson -Name "Core billing sync route (sin key -> 401)" -Url "$CoreBase/internal/billing/sync" -Method "POST" -Body "{}" -ExpectCodes @(401)

Invoke-SmokeJson -Name "Core search proxy route (sin tenant -> 400)" -Url "$CoreBase/search/query?q=dakinis&scope=knowledge" -ExpectCodes @(400)

Invoke-SmokeJson -Name "Webhook probe (sin firma -> 400/501)" -Url $WebhookUrl -Method "POST" -Body "{}" -ExpectCodes @(400, 501)

Invoke-SmokeJson -Name "Webhook GET (browser -> 405)" -Url $WebhookUrl -Method "GET" -ExpectCodes @(405)

if ($InternalKey -and $BusinessId) {
    $checkoutBody = (@{
        plan       = $Plan
        planId     = $Plan
        businessId = $BusinessId
        tenantId   = $BusinessId
        userId     = $UserId
        email      = $Email
    } | ConvertTo-Json -Compress)
    $checkout = Invoke-SmokeJson -Name "Billing checkout (internal + tenant)" -Url "$BillingBase/v1/checkout" -Method "POST" `
        -Headers @{ Authorization = "Bearer $InternalKey" } -Body $checkoutBody
    $checkoutJson = $checkout.Raw | ConvertFrom-Json
    if ($checkoutJson.url) {
        Write-Host "Checkout URL ready (abrir en browser para E2E Live)" -ForegroundColor Green
    }
} elseif ($CoreJwt) {
    $headers = @{ Authorization = "Bearer $CoreJwt" }
    if ($BusinessId) { $headers["x-business-id"] = $BusinessId }
    $checkoutBody = @{ plan = $Plan } | ConvertTo-Json -Compress
    $checkout = Invoke-SmokeJson -Name "Core checkout proxy (JWT)" -Url "$CoreBase/public/stripe/checkout-session" -Method "POST" `
        -Headers $headers -Body $checkoutBody
    $checkoutJson = $checkout.Raw | ConvertFrom-Json
    $url = $checkoutJson.data.url
    if ($url) {
        Write-Host "Checkout URL ready (abrir en browser para E2E Live)" -ForegroundColor Green
    }
} else {
    $auth = Get-CoreSmokeAuth -CoreBase $CoreBase
    if ($auth -and $auth.Jwt -and $auth.BusinessId) {
        $checkoutBody = @{ plan = $Plan } | ConvertTo-Json -Compress
        $checkout = Invoke-SmokeJson -Name "Core checkout (login smoke)" -Url "$CoreBase/public/stripe/checkout-session" -Method "POST" `
            -Headers @{
                Authorization = "Bearer $($auth.Jwt)"
                "x-business-id" = $auth.BusinessId
            } -Body $checkoutBody
        $checkoutJson = $checkout.Raw | ConvertFrom-Json
        if ($checkoutJson.data.url) {
            Write-Host "Checkout URL ready (abrir en browser para E2E Live)" -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "Omitido checkout live:" -ForegroundColor DarkYellow
        Write-Host "  INTERNAL_API_KEY + DAKINIS_BUSINESS_ID  -> billing /v1/checkout" -ForegroundColor DarkYellow
        Write-Host "  DAKINIS_CORE_JWT (+ DAKINIS_BUSINESS_ID) -> Core checkout" -ForegroundColor DarkYellow
        Write-Host "  DAKINIS_TEST_EMAIL + DAKINIS_TEST_PASSWORD -> Core login + checkout" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "OK - billing E2E probes." -ForegroundColor Green
Write-Host "Post-pago: Stripe webhook -> billing -> BullMQ + Core /internal/billing/sync -> business.plan" -ForegroundColor Yellow
Write-Host "Degraded loop: .\scripts\smoke-billing-degraded.ps1" -ForegroundColor Yellow

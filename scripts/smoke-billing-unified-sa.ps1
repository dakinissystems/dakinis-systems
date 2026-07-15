# Smoke - Billing unificado StreamAutomator (Fase 1.2)
# Verifica flags 044/045, proxies Internal API, adapter sync y endpoints SA.
#
# Uso basico:
#   .\scripts\smoke-billing-unified-sa.ps1
#
# Con sync live:
#   $env:DAKINIS_INTERNAL_SERVICE_KEY = "..."
#   $env:DAKINIS_PLATFORM_USER_ID = "uuid-dakinis-auth"
#   $env:DAKINIS_SA_TENANT_ID = "tenant-id"
#   .\scripts\smoke-billing-unified-sa.ps1 -LiveSync
#
# Checkout unificado:
#   .\scripts\smoke-billing-unified-sa.ps1 -LiveCheckout -SaJwt "..."

param(
    [string]$GatewayUrl = $(if ($env:DAKINIS_GATEWAY_URL) { $env:DAKINIS_GATEWAY_URL } else { "https://api.dakinissystems.com" }),
    [string]$StreamApiUrl = $(if ($env:STREAMAUTOMATOR_API_URL) { $env:STREAMAUTOMATOR_API_URL } else { "https://api.streamautomator.com" }),
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } elseif ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { "" }),
    [string]$PlatformUserId = $env:DAKINIS_PLATFORM_USER_ID,
    [string]$SaTenantId = $env:DAKINIS_SA_TENANT_ID,
    [string]$SaJwt = $env:STREAMAUTOMATOR_JWT,
    [switch]$LiveSync,
    [switch]$LiveCheckout
)

$ErrorActionPreference = "Stop"
$GatewayUrl = $GatewayUrl.TrimEnd("/")
$StreamApiUrl = $StreamApiUrl.TrimEnd("/")
$InternalBase = "$GatewayUrl/internal"
$BillingBase = "$GatewayUrl/billing"
$SaPlans = @("sa-creator-monthly", "sa-pro-monthly", "sa-lifetime")

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
    } elseif ($Method -eq "GET") {
        $raw = curl.exe -s @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    } else {
        $raw = curl.exe -s -X $Method @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
    }
    if ($ExpectCodes -notcontains $code) {
        if ($raw) {
            try {
                $errJson = $raw | ConvertFrom-Json
                if ($errJson.details) { Write-Host "  details: $($errJson.details)" -ForegroundColor Yellow }
                if ($errJson.error) { Write-Host "  error: $($errJson.error)" -ForegroundColor Yellow }
            } catch { /* raw already printed */ }
        }
        throw "FAIL $Name HTTP $code"
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Billing unified SA smoke" -ForegroundColor Green
Write-Host "Gateway: $GatewayUrl | SA API: $StreamApiUrl" -ForegroundColor DarkGray
Write-Host "Supabase aplicado: 037-047" -ForegroundColor DarkGray

$health = Invoke-SmokeJson -Name "Billing health" -Url "$BillingBase/health"
$healthJson = $health.Raw | ConvertFrom-Json
Write-Host "Stripe: $($healthJson.stripe) | Webhook: $($healthJson.webhook)" -ForegroundColor Yellow

$plans = Invoke-SmokeJson -Name "Billing plans catalog" -Url "$BillingBase/v1/plans"
$plansJson = $plans.Raw | ConvertFrom-Json
$catalogIds = @($plansJson.catalog | ForEach-Object { $_.id })
foreach ($saPlan in $SaPlans) {
    if ($catalogIds -contains $saPlan) {
        Write-Host "  OK plan en catalog API: $saPlan" -ForegroundColor Green
    } else {
        Write-Host "  WARN plan missing in catalog API: $saPlan" -ForegroundColor Yellow
    }
}

Invoke-SmokeJson -Name "Internal billing plans no auth" -Url "$InternalBase/billing/plans" -ExpectCodes @(401)

if ($InternalKey) {
    $authHeaders = @{ Authorization = "Bearer $InternalKey" }
    Invoke-SmokeJson -Name "Internal billing plans auth" -Url "$InternalBase/billing/plans" -Headers $authHeaders | Out-Null

    if ($PlatformUserId) {
        $flagUrl = "$InternalBase/feature-flags/evaluate?keys=billing.unified&userId=$([uri]::EscapeDataString($PlatformUserId))"
        $flags = Invoke-SmokeJson -Name "Feature flag billing.unified" -Url $flagUrl -Headers $authHeaders
        $flagsJson = $flags.Raw | ConvertFrom-Json
        $unified = $flagsJson.flags.'billing.unified'
        $flagColor = if ($unified) { "Green" } else { "Yellow" }
        Write-Host "  billing.unified = $unified" -ForegroundColor $flagColor
    } else {
        Write-Host "Omitido billing.unified evaluate - set DAKINIS_PLATFORM_USER_ID" -ForegroundColor DarkYellow
    }

    Invoke-SmokeJson -Name "Internal subscriptions sync empty" -Url "$InternalBase/billing/subscriptions/sync" `
        -Method "POST" -Headers $authHeaders -Body "{}" -ExpectCodes @(400)

    if ($LiveSync -and $PlatformUserId -and $SaTenantId) {
        # No enviar stripeCustomerId ficticio: billing.checkout reutiliza ese valor y rompe Stripe.
        $syncBody = (@{
            productKey           = "streamautomator"
            tenantId             = $SaTenantId
            userId               = $PlatformUserId
            planCode             = "sa-creator-monthly"
            saLicenseType        = "monthly"
            stripeSubscriptionId = "smoke_sub_test_$([guid]::NewGuid())"
            status               = "active"
        } | ConvertTo-Json -Compress)
        Invoke-SmokeJson -Name "Internal subscriptions sync live" -Url "$InternalBase/billing/subscriptions/sync" `
            -Method "POST" -Headers $authHeaders -Body $syncBody | Out-Null

        $checkoutProbeBody = (@{
            tenantId      = $SaTenantId
            userId        = $PlatformUserId
            planId        = "sa-creator-monthly"
            email         = "billing-smoke@test.dakinis.local"
            productKey    = "streamautomator"
            saLicenseType = "monthly"
        } | ConvertTo-Json -Compress)
        $internalCheckout = Invoke-SmokeJson -Name "Internal billing checkout SA probe" `
            -Url "$InternalBase/billing/checkout" -Method "POST" -Headers $authHeaders -Body $checkoutProbeBody
        $internalCheckoutJson = $internalCheckout.Raw | ConvertFrom-Json
        if ($internalCheckoutJson.url) {
            Write-Host "  OK checkout unificado billing (session creada)" -ForegroundColor Green
        }
    } elseif ($LiveSync) {
        Write-Host "LiveSync omitido - set DAKINIS_PLATFORM_USER_ID and DAKINIS_SA_TENANT_ID" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "Omitidos probes Internal autenticados - set DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
}

$config = Invoke-SmokeJson -Name "SA payments config-status" -Url "$StreamApiUrl/api/payments/config-status"
$configJson = $config.Raw | ConvertFrom-Json
Write-Host "  SA Stripe: $($configJson.stripeConfigured) | unified available: $($configJson.billingUnifiedAvailable)" -ForegroundColor Yellow

Invoke-SmokeJson -Name "SA internal license-sync no auth" -Url "$StreamApiUrl/api/internal/billing/license-sync" `
    -Method "POST" -Body "{}" -ExpectCodes @(401, 404, 503)
Write-Host "  Nota: 404 = ruta aun no desplegada en SA API prod" -ForegroundColor DarkYellow

if ($InternalKey) {
    $syncSaBody = (@{
        platformUserId       = $PlatformUserId
        planCode             = "sa-creator-monthly"
        saLicenseType        = "monthly"
        stripeSubscriptionId = "smoke_internal_sync"
        status               = "active"
    } | ConvertTo-Json -Compress)
    Invoke-SmokeJson -Name "SA internal license-sync auth" -Url "$StreamApiUrl/api/internal/billing/license-sync" `
        -Method "POST" -Headers @{ Authorization = "Bearer $InternalKey" } -Body $syncSaBody -ExpectCodes @(200, 404)
}

if ($LiveCheckout -and $SaJwt) {
    $jwtTrim = $SaJwt.Trim()
    Write-Host "JWT length: $($jwtTrim.Length)" -ForegroundColor DarkGray
    $preflight = Invoke-SmokeJson -Name "SA auth preflight (subscription)" `
        -Url "$StreamApiUrl/api/payments/subscription" `
        -Headers @{ Authorization = "Bearer $jwtTrim" } `
        -ExpectCodes @(200, 401, 404)
    if ($preflight.Code -eq 401) {
        Write-Host "  Token rechazado - vuelve a copiar auth_token:v1 sin espacios ni comas" -ForegroundColor Yellow
        Write-Host "  Cierra sesion en streamautomator.com y login de nuevo si sigue fallando" -ForegroundColor Yellow
        throw "FAIL JWT invalid for SA API (preflight 401)"
    }

    $checkoutBody = (@{ licenseType = "creator" } | ConvertTo-Json -Compress)
    $checkout = Invoke-SmokeJson -Name "SA checkout probe" -Url "$StreamApiUrl/api/payments/checkout" `
        -Method "POST" -Headers @{ Authorization = "Bearer $jwtTrim" } -Body $checkoutBody
    $checkoutJson = $checkout.Raw | ConvertFrom-Json
    if ($checkoutJson.unified -and $checkoutJson.url) {
        Write-Host "Checkout UNIFICADO:" -ForegroundColor Green
        Write-Host $checkoutJson.url
    } elseif ($checkoutJson.url) {
        Write-Host "Checkout LEGACY SA Stripe" -ForegroundColor Yellow
        Write-Host $checkoutJson.url
    } else {
        Write-Host "  Sin URL - usuario sin platformAuthSub no puede usar checkout unificado" -ForegroundColor Yellow
        Write-Host "  Vincula SA con IdP (Hub SSO) o asigna platformAuthSub en DB" -ForegroundColor Yellow
    }
} elseif ($LiveCheckout) {
    Write-Host "LiveCheckout omitido - set STREAMAUTOMATOR_JWT or -SaJwt" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - smoke billing unificado SA completado." -ForegroundColor Green
Write-Host ""
Write-Host "Checklist:" -ForegroundColor Cyan
Write-Host "  1. billing.plans: sa-creator-monthly, sa-pro-monthly, sa-lifetime"
Write-Host "  2. meta.feature_flags: billing.unified"
Write-Host "  3. STRIPE_PRICE_SA_* en servicio billing"
Write-Host "  4. Webhook Stripe -> /billing/v1/webhooks/stripe"
Write-Host "  5. STREAMAUTOMATOR_INTERNAL_URL en billing"
Write-Host "  6. Usuarios SA con platformAuthSub"
Write-Host "  7. Migracion 047 outbox idempotency_key tras deploy Foundation Fase 2"

# Valida variables billing unificado: matriz codigo vs prod (sin imprimir secretos)
#
# Uso:
#   .\scripts\validate-billing-unified-vars.ps1
#   $env:DAKINIS_INTERNAL_SERVICE_KEY = "..." ; .\scripts\validate-billing-unified-vars.ps1

param(
    [string]$GatewayUrl = $(if ($env:DAKINIS_GATEWAY_URL) { $env:DAKINIS_GATEWAY_URL } else { "https://api.dakinissystems.com" }),
    [string]$StreamApiUrl = $(if ($env:STREAMAUTOMATOR_API_URL) { $env:STREAMAUTOMATOR_API_URL } else { "https://api.streamautomator.com" }),
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } elseif ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { "" })
)

$ErrorActionPreference = "Continue"
$GatewayUrl = $GatewayUrl.TrimEnd("/")
$StreamApiUrl = $StreamApiUrl.TrimEnd("/")
$SaPlans = @("sa-creator-monthly", "sa-pro-monthly", "sa-lifetime")

function Get-HttpJson {
    param([string]$Url, [hashtable]$Headers = @{})
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "${k}: $($Headers[$k])"
    }
    $raw = curl.exe -s @headerArgs $Url
    $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    $json = $null
    if ($raw) {
        try { $json = $raw | ConvertFrom-Json } catch { $json = $null }
    }
    return @{ Code = $code; Raw = $raw; Json = $json }
}

function Show-VarRow {
    param(
        [string]$Service,
        [string]$Variable,
        [string]$Required,
        [string]$ProdStatus,
        [string]$Notes = ""
    )
    $color = switch ($ProdStatus) {
        "OK" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
        "SKIP" { "DarkGray" }
        default { "White" }
    }
    Write-Host ("{0,-22} {1,-34} {2,-5} {3,-6}" -f $Service, $Variable, $Required, $ProdStatus) -ForegroundColor $color
    if ($Notes) { Write-Host ("  -> {0}" -f $Notes) -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "=== Validacion variables billing unificado ===" -ForegroundColor Green
Write-Host "Gateway: $GatewayUrl"
Write-Host "SA API:  $StreamApiUrl"
Write-Host ""

# --- Probes prod ---
$billingHealth = Get-HttpJson -Url "$GatewayUrl/billing/health"
$billingPlans = Get-HttpJson -Url "$GatewayUrl/billing/v1/plans"
$saConfig = Get-HttpJson -Url "$StreamApiUrl/api/payments/config-status"
$saInternalNoAuth = Get-HttpJson -Url "$StreamApiUrl/api/internal/billing/license-sync" -Headers @{ "Content-Type" = "application/json" }
try {
    $tmp = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmp, "{}", [System.Text.UTF8Encoding]::new($false))
    $saInternalNoAuth.Code = [int](curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Content-Type: application/json" --data-binary "@$tmp" "$StreamApiUrl/api/internal/billing/license-sync")
    Remove-Item $tmp -Force
} catch { }

$internalAuthOk = $false
if ($InternalKey) {
    $internalPlans = Get-HttpJson -Url "$GatewayUrl/internal/billing/plans" -Headers @{ Authorization = "Bearer $InternalKey" }
    $internalAuthOk = ($internalPlans.Code -eq 200)
}

$catalog = @()
$planStripe = @{}
if ($billingPlans.Json -and $billingPlans.Json.catalog) {
    foreach ($p in $billingPlans.Json.catalog) {
        $catalog += $p.id
        $planStripe[$p.id] = $p.stripePriceId
    }
}

$saPlansInCatalog = ($SaPlans | Where-Object { $catalog -contains $_ }).Count -eq $SaPlans.Count
$saPricesConfigured = ($SaPlans | Where-Object { $planStripe[$_] }).Count -eq $SaPlans.Count
$billingStripeOk = ($billingHealth.Json.stripe -eq "configured")
$billingWebhookOk = ($billingHealth.Json.webhook -eq "configured")
$saUnifiedAvail = [bool]$saConfig.Json.billingUnifiedAvailable
$saInternalDeployed = ($saInternalNoAuth.Code -in @(401, 503))

Write-Host "Matriz (prod inferido por probes HTTP):" -ForegroundColor Cyan
Write-Host ("{0,-22} {1,-34} {2,-5} {3,-6}" -f "Servicio", "Variable", "Req", "Prod")
Write-Host ("-" * 72)

Show-VarRow "dakinis-billing" "STRIPE_SECRET_KEY" "SI" $(if ($billingStripeOk) { "OK" } else { "FAIL" })
Show-VarRow "dakinis-billing" "STRIPE_WEBHOOK_SECRET" "SI" $(if ($billingWebhookOk) { "OK" } else { "FAIL" }) "Webhook unico Stripe central"
Show-VarRow "dakinis-billing" "STRIPE_PRICE_SA_CREATOR_MONTHLY" "SI" $(if ($planStripe["sa-creator-monthly"]) { "OK" } elseif ($catalog -contains "sa-creator-monthly") { "WARN" } else { "FAIL" }) $(if (-not ($catalog -contains "sa-creator-monthly")) { "Redeploy billing (codigo SA plans) + env price ID" } elseif (-not $planStripe["sa-creator-monthly"]) { "Plan en catalog pero sin stripePriceId" } else { "" })
Show-VarRow "dakinis-billing" "STRIPE_PRICE_SA_PRO_MONTHLY" "SI" $(if ($planStripe["sa-pro-monthly"]) { "OK" } elseif ($catalog -contains "sa-pro-monthly") { "WARN" } else { "FAIL" })
Show-VarRow "dakinis-billing" "STRIPE_PRICE_SA_LIFETIME" "SI" $(if ($planStripe["sa-lifetime"]) { "OK" } elseif ($catalog -contains "sa-lifetime") { "WARN" } else { "FAIL" })
Show-VarRow "dakinis-billing" "INTERNAL_API_KEY" "SI" $(if ($internalAuthOk) { "OK" } elseif ($InternalKey) { "FAIL" } else { "SKIP" }) "Debe ser IGUAL a DAKINIS_INTERNAL_SERVICE_KEY"
Show-VarRow "dakinis-billing" "DAKINIS_INTERNAL_SERVICE_KEY" "SI" $(if ($InternalKey) { "SKIP" } else { "SKIP" }) "Outbound fan-out SA; mismo valor que INTERNAL_API_KEY"
Show-VarRow "dakinis-billing" "STREAMAUTOMATOR_INTERNAL_URL" "SI" "SKIP" "https://api.streamautomator.com (prod publico OK)"
Show-VarRow "dakinis-billing" "DATABASE_URL" "SI" $(if ($billingHealth.Json.database -eq "connected") { "OK" } else { "WARN" })
Show-VarRow "dakinis-billing" "REDIS_URL" "SI" "SKIP" "Event bus / no bloquea checkout"

Show-VarRow "dakinis-internal-api" "DAKINIS_INTERNAL_SERVICE_KEY" "SI" $(if ($internalAuthOk) { "OK" } elseif ($InternalKey) { "FAIL" } else { "SKIP" }) "Bearer en SA -> Internal"
Show-VarRow "dakinis-internal-api" "DAKINIS_BILLING_URL" "SI" $(if ($billingPlans.Code -eq 200) { "OK" } else { "FAIL" }) "Proxy /billing/* (Railway internal OK)"
Show-VarRow "dakinis-internal-api" "DATABASE_URL" "SI" "SKIP" "Feature flags billing.unified (046)"
Show-VarRow "dakinis-internal-api" "REDIS_URL" "SI" "SKIP" "BFF cache hub.bff_cache"

Show-VarRow "streamautomator-api" "DAKINIS_INTERNAL_SERVICE_KEY" "SI" $(if ($saUnifiedAvail) { "OK" } else { "FAIL" }) "config-status.billingUnifiedAvailable"
Show-VarRow "streamautomator-api" "DAKINIS_INTERNAL_URL" "SI" $(if ($saUnifiedAvail) { "OK" } else { "WARN" }) "https://api.dakinissystems.com/internal"
Show-VarRow "streamautomator-api" "BILLING_UNIFIED" "REC" $(if ($saUnifiedAvail) { "SKIP" } else { "WARN" }) "true = cutover sin esperar flag 046"
Show-VarRow "streamautomator-api" "FRONTEND_URL" "SI" "SKIP" "https://streamautomator.com (success/cancel checkout)"
Show-VarRow "streamautomator-api" "DATABASE_URL" "SI" "SKIP" "Usuarios + platformAuthSub"
Show-VarRow "streamautomator-api" "codigo internal-billing" "SI" $(if ($saInternalDeployed) { "OK" } else { "FAIL" }) "/api/internal/billing/license-sync (404 = sin deploy)"

Write-Host ""
Write-Host "Regla clave:" -ForegroundColor Cyan
Write-Host "  DAKINIS_INTERNAL_SERVICE_KEY (Internal + SA) == INTERNAL_API_KEY (billing inbound)"
Write-Host ""

Write-Host "Supabase (no probe HTTP):" -ForegroundColor Cyan
Write-Host "  045 billing.plans SA rows        -> aplicada (confirmado)"
Write-Host "  046 billing.unified enabled=true -> pendiente hasta ejecutar SQL"
Write-Host "  043 drop sync triggers           -> NO aplicar aun"
Write-Host ""

$failCount = 0
if (-not $billingStripeOk) { $failCount++ }
if (-not $saPlansInCatalog) { $failCount++ }
if (-not $saPricesConfigured) { $failCount++ }
if (-not $saUnifiedAvail) { $failCount++ }
if (-not $saInternalDeployed) { $failCount++ }
if ($InternalKey -and -not $internalAuthOk) { $failCount++ }

Write-Host "Resumen:" -ForegroundColor Cyan
if ($failCount -eq 0) {
    Write-Host "  OK - variables criticas alineadas en prod" -ForegroundColor Green
} else {
    Write-Host "  $failCount bloqueo(s) detectado(s) - ver FAIL/WARN arriba" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Acciones minimas:" -ForegroundColor Yellow
    if (-not $saPlansInCatalog) {
        Write-Host "  1. Redeploy dakinis-billing (codigo con planes SA en plans.js)"
    }
    if (-not $saPricesConfigured) {
        Write-Host "  2. Railway billing: STRIPE_PRICE_SA_CREATOR_MONTHLY, _PRO_, _LIFETIME + redeploy"
    }
    if (-not $saUnifiedAvail) {
        Write-Host "  3. Railway streamautomator-api: DAKINIS_INTERNAL_SERVICE_KEY + BILLING_UNIFIED=true"
    }
    if (-not $saInternalDeployed) {
        Write-Host "  4. Redeploy streamautomator-api (ruta internal-billing)"
    }
    if ($InternalKey -and -not $internalAuthOk) {
        Write-Host "  5. Igualar INTERNAL_API_KEY billing con DAKINIS_INTERNAL_SERVICE_KEY"
    }
    Write-Host "  6. Supabase: ejecutar 046_enable_billing_unified_global.sql"
}

Write-Host ""
if (-not $InternalKey) {
    Write-Host "Tip: export DAKINIS_INTERNAL_SERVICE_KEY para validar auth Internal->billing" -ForegroundColor DarkYellow
}

exit $(if ($failCount -eq 0) { 0 } else { 1 })

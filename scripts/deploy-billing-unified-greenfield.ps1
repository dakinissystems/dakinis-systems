# Deploy checklist - Billing unificado greenfield (sin usuarios legacy)
# 1. Aplicar migracion 046 en Supabase (si aun no)
# 2. Configurar variables Railway (ver abajo)
# 3. Redeploy: dakinis-billing, streamautomator-api, dakinis-internal-api
# 4. Crear Prices en Stripe central + pegar price IDs
# 5. Ejecutar smoke

param(
    [switch]$RunSmoke,
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } else { "" })
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Billing unificado - greenfield deploy ===" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 1 - Supabase SQL Editor" -ForegroundColor Cyan
Write-Host "  Ejecutar: docs/supabase/migrations/046_enable_billing_unified_global.sql"
Write-Host "  (045 ya aplicada - confirma billing.unified enabled=true)"
Write-Host ""

Write-Host "PASO 2 - Stripe Dashboard (cuenta billing central)" -ForegroundColor Cyan
Write-Host "  Crear 3 Prices activos y copiar price_... IDs:"
Write-Host "    - StreamAutomator Creator monthly  -> STRIPE_PRICE_SA_CREATOR_MONTHLY"
Write-Host "    - StreamAutomator Pro monthly      -> STRIPE_PRICE_SA_PRO_MONTHLY"
Write-Host "    - StreamAutomator Lifetime one-time -> STRIPE_PRICE_SA_LIFETIME"
Write-Host "  Webhook endpoint UNICO:"
Write-Host "    https://api.dakinissystems.com/billing/v1/webhooks/stripe"
Write-Host ""

Write-Host "PASO 3 - Railway: dakinis-billing" -ForegroundColor Cyan
@(
    "STRIPE_PRICE_SA_CREATOR_MONTHLY=price_...",
    "STRIPE_PRICE_SA_PRO_MONTHLY=price_...",
    "STRIPE_PRICE_SA_LIFETIME=price_...",
    "DAKINIS_INTERNAL_SERVICE_KEY=<shared>",
    "INTERNAL_API_KEY=<same as service key>",
    "STREAMAUTOMATOR_INTERNAL_URL=https://api.streamautomator.com",
    "REDIS_URL=<redis>",
    "DATABASE_URL=<supabase pooler 6543>"
) | ForEach-Object { Write-Host "  $_" }
Write-Host ""

Write-Host "PASO 4 - Railway: streamautomator-api" -ForegroundColor Cyan
@(
    "DAKINIS_INTERNAL_SERVICE_KEY=<shared>",
    "DAKINIS_INTERNAL_URL=https://api.dakinissystems.com/internal",
    "BILLING_UNIFIED=true",
    "# Mantener STRIPE_* legacy opcional hasta retirar webhook SA"
) | ForEach-Object { Write-Host "  $_" }
Write-Host ""

Write-Host "PASO 5 - Railway: dakinis-internal-api" -ForegroundColor Cyan
@(
    "DAKINIS_INTERNAL_SERVICE_KEY=<shared>",
    "DAKINIS_BILLING_URL=https://api.dakinissystems.com/billing",
    "REDIS_URL=<redis>",
    "DATABASE_URL=<supabase pooler 6543>"
) | ForEach-Object { Write-Host "  $_" }
Write-Host ""

Write-Host "PASO 6 - Redeploy servicios (orden sugerido)" -ForegroundColor Cyan
Write-Host "  1. dakinis-internal-api"
Write-Host "  2. dakinis-billing"
Write-Host "  3. streamautomator-api"
Write-Host ""

Write-Host "PASO 7 - Aplicar migracion 047 (outbox idempotency_key)" -ForegroundColor Cyan
Write-Host "  docs/supabase/migrations/047_outbox_idempotency_key.sql"
Write-Host ""

if ($RunSmoke) {
    if (-not $InternalKey) {
        Write-Host "Smoke omitido - export DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
    } else {
        $env:DAKINIS_INTERNAL_SERVICE_KEY = $InternalKey
        & "$PSScriptRoot/smoke-billing-unified-sa.ps1"
    }
} else {
    Write-Host "Verificacion:" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-billing-unified-greenfield.ps1 -RunSmoke"
    Write-Host "  .\scripts\smoke-billing-unified-sa.ps1"
}

Write-Host ""
Write-Host "Listo - tras deploy, checkout SA usa Stripe central automaticamente." -ForegroundColor Green

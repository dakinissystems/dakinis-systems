# Deploy checklist - Foundation Fase 2 (CQRS BFF, SDK, AkoeNet addons, outbox 047)
#
# Uso:
#   .\scripts\deploy-foundation-phase2.ps1
#   .\scripts\deploy-foundation-phase2.ps1 -RunSmoke

param(
    [switch]$RunSmoke,
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } else { "" })
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Foundation Fase 2 - deploy checklist ===" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 1 - Supabase SQL Editor" -ForegroundColor Cyan
Write-Host "  OK 047_outbox_idempotency_key.sql aplicada"
Write-Host "  Verificar: docs/supabase/scripts/verify_outbox_idempotency.sql"
Write-Host ""

Write-Host "PASO 2 - Vendor packages en internal-api" -ForegroundColor Cyan
Write-Host "  cd internal"
Write-Host "  npm install"
Write-Host '  shared-platform + shared-db con OutboxPublisher idempotency_key'
Write-Host ""

Write-Host "PASO 3 - Tests locales (opcional)" -ForegroundColor Cyan
Write-Host "  cd packages/shared-platform; npm test"
Write-Host "  cd projects/workspace/packages/addon-sdk; npm test"
Write-Host "  cd apps/akoenet/Client; npm run validate:addons"
Write-Host ""

Write-Host "PASO 4 - Railway redeploy (orden sugerido)" -ForegroundColor Cyan
Write-Host '  1. dakinis-internal-api - buses.js CacheService tags shared-platform'
Write-Host '  2. streamautomator-api - Director facade + outbox 047'
Write-Host '  3. akoenet-backend - proxy Internal si cambio'
Write-Host '  4. akoenet-frontend - AddonRoutes auto-discovery'
Write-Host ""

Write-Host "PASO 5 - Variables clave internal-api" -ForegroundColor Cyan
@(
    "DATABASE_URL=<supabase pooler 6543>",
    "REDIS_URL=<redis>",
    "DAKINIS_INTERNAL_SERVICE_KEY=<shared>",
    "DAKINIS_BILLING_URL=https://api.dakinissystems.com/billing"
) | ForEach-Object { Write-Host "  $_" }
Write-Host ""

if ($RunSmoke) {
    if (-not $InternalKey) {
        Write-Host "Smoke omitido - export DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
    } else {
        $env:DAKINIS_INTERNAL_SERVICE_KEY = $InternalKey
        Write-Host "Ejecutando smoke BFF..." -ForegroundColor Cyan
        & "$PSScriptRoot/smoke-foundation-bff.ps1"
        Write-Host ""
        Write-Host "Ejecutando smoke billing..." -ForegroundColor Cyan
        & "$PSScriptRoot/smoke-billing-unified-sa.ps1"
    }
} else {
    Write-Host "Verificacion post-deploy:" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-foundation-phase2.ps1 -RunSmoke"
    Write-Host "  .\scripts\smoke-foundation-bff.ps1"
    Write-Host '  .\scripts\smoke-billing-unified-sa.ps1 -LiveCheckout -SaJwt "<jwt>"'
}

Write-Host ""
Write-Host "Listo - Foundation Fase 2 lista para deploy." -ForegroundColor Green

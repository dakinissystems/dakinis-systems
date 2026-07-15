# Deploy checklist - Hub Mi día + Automation (jul 2026)
#
# Uso:
#   .\scripts\deploy-hub-automation.ps1
#   .\scripts\deploy-hub-automation.ps1 -RunSmoke

param(
    [switch]$RunSmoke,
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } else { "" }),
    [string]$PlatformUserId = $env:DAKINIS_PLATFORM_USER_ID,
    [string]$SaJwt = $env:STREAMAUTOMATOR_JWT
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Hub Mi dia + Automation - deploy checklist ===" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 1 - Supabase SQL Editor" -ForegroundColor Cyan
Write-Host "  OK 016-029 ya en prod (smoke hub stub=false)"
Write-Host "  PENDIENTE: 048_hub_dashboard_automation.sql"
Write-Host "  CLI: .\scripts\apply-hub-048.ps1"
Write-Host "  Verificar: scripts/smoke-supabase-phase-c.sql"
Write-Host ""

Write-Host "PASO 2 - Sync Hub DES packages" -ForegroundColor Cyan
Write-Host "  .\scripts\sync-hub-des.ps1"
Write-Host "  Commit + push dakinis-hub (HubDashboardPage + ActivityTimeline)"
Write-Host ""

Write-Host "PASO 3 - Railway redeploy" -ForegroundColor Cyan
Write-Host "  1. dakinis-internal-api  (hub-timeline.js, hub-actions, routes)"
Write-Host "  2. dakinis-streamautomator API (sin cambios API en este sprint)"
Write-Host "  3. dakinis-streamautomator WEB (Automation builder + CreatorSuiteCard)"
Write-Host "  4. dakinis-hub frontend (packages shared-layouts + shared-ux)"
Write-Host ""

Write-Host "PASO 4 - Variables SA (opcional cutover stream)" -ForegroundColor Cyan
@(
    "AUTOMATION_READ_FROM_STREAM=true",
    "DIRECTOR_READ_FROM_STREAM=true",
    "LEGACY_SYNC_MODE=true",
    "ENABLE_OUTBOX_WORKER=true"
) | ForEach-Object { Write-Host "  $_" }
Write-Host ""

if ($RunSmoke) {
    if (-not $InternalKey) {
        Write-Host "Smoke BFF omitido - set DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
    } else {
        $env:DAKINIS_INTERNAL_SERVICE_KEY = $InternalKey
        if ($PlatformUserId) { $env:DAKINIS_PLATFORM_USER_ID = $PlatformUserId }
        Write-Host "Ejecutando smoke foundation BFF..." -ForegroundColor Cyan
        & "$PSScriptRoot/smoke-foundation-bff.ps1"
        Write-Host ""
        Write-Host "Ejecutando smoke hub..." -ForegroundColor Cyan
        & "$PSScriptRoot/smoke-hub.ps1"
        if ($PlatformUserId) {
            Write-Host ""
            Write-Host "Ejecutando smoke hub timeline..." -ForegroundColor Cyan
            & "$PSScriptRoot/smoke-hub-timeline.ps1"
        }
    }
    if ($SaJwt) {
        $env:STREAMAUTOMATOR_JWT = $SaJwt
        Write-Host ""
        Write-Host "Ejecutando smoke creator suite..." -ForegroundColor Cyan
        & "$PSScriptRoot/smoke-creator-suite-sa.ps1" -LiveWrite
    } else {
        Write-Host "Smoke creator suite omitido - set STREAMAUTOMATOR_JWT" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "Verificacion post-deploy:" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-hub-automation.ps1 -RunSmoke"
    Write-Host "  .\scripts\smoke-creator-suite-sa.ps1 -LiveWrite"
}

Write-Host ""
Write-Host "Listo - Hub + Automation listos para deploy." -ForegroundColor Green

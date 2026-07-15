# Aplica migraciones Hub Mi día (Fase C + 027-029 + 048) en Supabase.
#
# Requiere DATABASE_URL (directo 5432, no pooler) o --EnvFile con la URL.
#
# Uso:
#   $env:DATABASE_URL = "postgresql://postgres:...@db....supabase.co:5432/postgres"
#   .\scripts\apply-hub-phase-c.ps1
#
#   .\scripts\apply-hub-phase-c.ps1 -EnvFile "D:\secrets\supabase.env" -PreflightOnly
#   .\scripts\apply-hub-phase-c.ps1 -EnvFile "...\supabase.env" -SkipApplied

param(
    [string]$EnvFile = "",
    [string]$MigrationsDir = $(Join-Path $PSScriptRoot "..\docs\supabase\migrations"),
    [switch]$PreflightOnly,
    [switch]$SkipApplied
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$runner = Join-Path $PSScriptRoot "run-supabase-sql-files.mjs"
$preflight = Join-Path $PSScriptRoot "smoke-supabase-phase-c.sql"

$migrations = @(
    "016_schema_enhancements.sql",
    "017_functions_v1.sql",
    "018_hub_dashboard.sql",
    "019_rls_templates_and_cutover_plan.sql",
    "027_hub_mi_dia.sql",
    "028_hub_dashboard_widgets.sql",
    "029_hub_product_access.sql",
    "048_hub_dashboard_automation.sql"
)

function Get-RunnerArgs {
    $args = @()
    if ($EnvFile) { $args += "--env-file"; $args += (Resolve-Path $EnvFile).Path }
    return $args
}

if (-not (Test-Path $runner)) { throw "Missing $runner" }

Write-Host "Hub Phase C — Supabase migrations" -ForegroundColor Green
Write-Host "Dir: $MigrationsDir" -ForegroundColor DarkGray

if (-not $env:DATABASE_URL -and -not $EnvFile) {
    Write-Host ""
    Write-Host "DATABASE_URL no configurada." -ForegroundColor Yellow
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "  1. SQL Editor: pegar cada archivo en orden (ver RUN-ORDER.md)"
    Write-Host "  2. CLI: `$env:DATABASE_URL = 'postgresql://...:5432/postgres'"
    Write-Host "         .\scripts\apply-hub-phase-c.ps1"
    Write-Host "  3. .\scripts\apply-hub-phase-c.ps1 -EnvFile path\to\supabase.env"
    Write-Host ""
    Write-Host "Archivos a aplicar:" -ForegroundColor Cyan
    $migrations | ForEach-Object { Write-Host "  -> $_" }
    exit 0
}

$runnerBase = @( "node", $runner ) + (Get-RunnerArgs)

Write-Host ""
Write-Host "== Preflight (estado actual) ==" -ForegroundColor Cyan
& $runnerBase[0] $runnerBase[1] @($runnerBase[2..($runnerBase.Length-1)]) $preflight
if ($LASTEXITCODE -ne 0) { throw "Preflight failed" }

if ($PreflightOnly) {
    Write-Host "PreflightOnly — sin aplicar migraciones." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "== Aplicando migraciones ==" -ForegroundColor Cyan
foreach ($file in $migrations) {
    $path = Join-Path $MigrationsDir $file
    if (-not (Test-Path $path)) { throw "Missing migration: $path" }
    if ($SkipApplied) {
        Write-Host "Skip check not automated — applying $file" -ForegroundColor DarkYellow
    }
    Write-Host ""
    & $runnerBase[0] $runnerBase[1] @($runnerBase[2..($runnerBase.Length-1)]) $path
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed: $file (exit $LASTEXITCODE)"
    }
}

Write-Host ""
Write-Host "== Post-check ==" -ForegroundColor Cyan
& $runnerBase[0] $runnerBase[1] @($runnerBase[2..($runnerBase.Length-1)]) $preflight
if ($LASTEXITCODE -ne 0) { throw "Post-check failed" }

Write-Host ""
Write-Host "OK — Hub Phase C aplicada. Redeploy internal-api si ya estaba live." -ForegroundColor Green
Write-Host "  .\scripts\smoke-hub.ps1" -ForegroundColor DarkGray
Write-Host "  .\scripts\deploy-hub-automation.ps1 -RunSmoke" -ForegroundColor DarkGray

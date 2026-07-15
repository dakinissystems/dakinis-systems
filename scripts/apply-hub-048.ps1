# Aplica solo migracion 048 (automation metrics + core_low_stock).
# Requiere 016-029 ya aplicadas (confirmado en prod jul 2026).
#
# Uso:
#   $env:DATABASE_URL = "postgresql://...@db....supabase.co:5432/postgres"
#   .\scripts\apply-hub-048.ps1

param(
    [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$runner = Join-Path $PSScriptRoot "run-supabase-sql-files.mjs"
$migration = Join-Path $root "docs\supabase\migrations\048_hub_dashboard_automation.sql"
$preflight = Join-Path $PSScriptRoot "smoke-supabase-phase-c.sql"

if (-not $env:DATABASE_URL -and -not $EnvFile) {
    Write-Host "048_hub_dashboard_automation.sql — pegar en Supabase SQL Editor" -ForegroundColor Cyan
    Write-Host "  $migration"
    Write-Host ""
    Write-Host "O con CLI:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "postgresql://...:5432/postgres"'
    Write-Host "  .\scripts\apply-hub-048.ps1"
    exit 0
}

$args = @("node", $runner)
if ($EnvFile) { $args += "--env-file"; $args += (Resolve-Path $EnvFile).Path }

Write-Host "Aplicando 048..." -ForegroundColor Green
& $args[0] $args[1] @($args[2..($args.Length-1)]) $migration
if ($LASTEXITCODE -ne 0) { throw "048 failed" }

Write-Host ""
Write-Host "Post-check..." -ForegroundColor Cyan
& $args[0] $args[1] @($args[2..($args.Length-1)]) $preflight
Write-Host "OK — 048 aplicada." -ForegroundColor Green

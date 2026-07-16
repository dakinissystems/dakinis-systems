# Aplica 049 (stream.automation_runs mirror) + seed score test user.
# Uso:
#   $env:DATABASE_URL = "postgresql://..."
#   .\scripts\apply-automation-runs-049.ps1

param(
    [switch]$SkipSeed,
    [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$runner = Join-Path $PSScriptRoot "run-supabase-sql-files.mjs"
$migration = Join-Path $root "docs\supabase\migrations\049_stream_automation_runs.sql"
$seed = Join-Path $root "docs\scripts\seed_lifeflow_score_velezcampeon.sql"

if (-not $env:DATABASE_URL -and -not $env:PLATFORM_DATABASE_URL -and -not $EnvFile) {
    Write-Host "049_stream_automation_runs.sql — pegar en Supabase SQL Editor" -ForegroundColor Cyan
    Write-Host "  $migration"
    Write-Host "  $seed"
    Write-Host ""
    Write-Host "O con CLI:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "postgresql://...:5432/postgres"'
    Write-Host "  .\scripts\apply-automation-runs-049.ps1"
    exit 0
}

$nodeArgs = @()
if ($EnvFile) {
    $nodeArgs += "--env-file"
    $nodeArgs += (Resolve-Path $EnvFile).Path
}

Write-Host "Aplicando 049..." -ForegroundColor Green
& node $runner @nodeArgs $migration
if ($LASTEXITCODE -ne 0) { throw "049 failed" }

if (-not $SkipSeed) {
    Write-Host "Seed lifeflow_score (velez)..." -ForegroundColor Green
    & node $runner @nodeArgs $seed
    if ($LASTEXITCODE -ne 0) { throw "seed score failed" }
}

Write-Host "OK — 049 aplicada (+ seed salvo -SkipSeed)." -ForegroundColor Green

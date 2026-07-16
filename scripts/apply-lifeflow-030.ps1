# Aplica migracion 030 (lifeflow.app_user_links) + cleanup de links invalidos.
# Uso:
#   $env:PLATFORM_DATABASE_URL = "postgresql://..."
#   .\scripts\apply-lifeflow-030.ps1
#
# O con Railway (service internal-api):
#   .\scripts\apply-lifeflow-030.ps1 -FromRailway

param(
  [switch]$FromRailway
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $root "scripts\run-supabase-sql-files.mjs"
$mig = Join-Path $root "docs\supabase\migrations\030_lifeflow_app_links.sql"
$cleanup = Join-Path $root "docs\supabase\scripts\cleanup_lifeflow_bad_links.sql"

if ($FromRailway -and -not $env:PLATFORM_DATABASE_URL -and -not $env:DATABASE_URL) {
  Push-Location (Join-Path $root "internal")
  try {
    $varsJson = npx --yes @railway/cli variables --service dakinis-internal-api --json 2>$null
    if ($varsJson) {
      $vars = $varsJson | ConvertFrom-Json
      if ($vars.DATABASE_URL) { $env:PLATFORM_DATABASE_URL = $vars.DATABASE_URL }
      elseif ($vars.PLATFORM_DATABASE_URL) { $env:PLATFORM_DATABASE_URL = $vars.PLATFORM_DATABASE_URL }
    }
  } finally {
    Pop-Location
  }
}

$dbUrl = $env:PLATFORM_DATABASE_URL
if (-not $dbUrl) { $dbUrl = $env:DATABASE_URL }
if (-not $dbUrl) {
  Write-Host "Define PLATFORM_DATABASE_URL o usa -FromRailway" -ForegroundColor Yellow
  Write-Host "Alternativa: pegar 030_lifeflow_app_links.sql en Supabase SQL Editor"
  exit 1
}

$env:PLATFORM_DATABASE_URL = $dbUrl
$env:DATABASE_URL = $dbUrl

Write-Host "==> Apply 030_lifeflow_app_links.sql"
node $runner $mig
if ($LASTEXITCODE -ne 0) { throw "030 failed" }

Write-Host "==> Cleanup bad app_user_links"
node $runner $cleanup
if ($LASTEXITCODE -ne 0) { throw "cleanup failed" }

Write-Host "OK - 030 applied + cleanup" -ForegroundColor Green

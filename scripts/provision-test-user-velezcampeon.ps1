# Provision test user velezcampeon_88@hotmail.com across all platforms (Supabase).
# Password default: DakinisTest2026!

param(
  [string]$Email = "velezcampeon_88@hotmail.com",
  [string]$Password = "DakinisTest2026!",
  [switch]$SkipLogin
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "docs\supabase\scripts\provision_test_user_velezcampeon.sql"))) {
  $root = "d:\dakinis-systems"
}

$sqlFile = Join-Path $root "docs\supabase\scripts\provision_test_user_velezcampeon.sql"
$runner = Join-Path $root "scripts\run-supabase-sql-files.mjs"
$idpLib = Join-Path $root "scripts\lib\idp-smoke-auth.ps1"

Write-Host "==> Provision test user: $Email"
Write-Host "    Password: $Password"
Write-Host ""

$dbUrl = $env:PLATFORM_DATABASE_URL
if (-not $dbUrl) { $dbUrl = $env:DATABASE_URL }

if (-not $dbUrl) {
  try {
    Push-Location (Join-Path $root "internal")
    $varsJson = npx --yes @railway/cli variables --service dakinis-internal-api --json 2>$null
    if ($varsJson) {
      $vars = $varsJson | ConvertFrom-Json
      $dbUrl = $vars.DATABASE_URL
    }
  } catch {
    # railway optional
  } finally {
    Pop-Location
  }
}

if (-not $dbUrl) {
  Write-Host "PLATFORM_DATABASE_URL no definida. Ejecuta en Supabase SQL Editor:" -ForegroundColor Yellow
  Write-Host "  $sqlFile"
  exit 1
}

$env:PLATFORM_DATABASE_URL = $dbUrl
node $runner $sqlFile
if ($LASTEXITCODE -ne 0) { throw "SQL provisioning failed" }
Remove-Item Env:PLATFORM_DATABASE_URL -ErrorAction SilentlyContinue

Write-Host ""
if (-not $SkipLogin) {
  Write-Host "==> IdP login smoke"
  . $idpLib
  $env:DAKINIS_TEST_EMAIL = $Email
  $env:DAKINIS_TEST_PASSWORD = $Password
  try {
    $auth = Get-IdpSmokeAuth
    if ($auth.UserId) {
      Write-Host "OK - platform_user_id: $($auth.UserId)" -ForegroundColor Green
      Write-Host ""
      Write-Host "Para smokes:"
      Write-Host ('  $env:DAKINIS_PLATFORM_USER_ID = ''' + $auth.UserId + '''')
      Write-Host ('  $env:DAKINIS_TEST_EMAIL = ''' + $Email + '''')
      Write-Host ('  $env:DAKINIS_TEST_PASSWORD = ''' + $Password + '''')
    }
  } catch {
    Write-Host "IdP login falló (SQL OK): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Verifica auth.dakinissystems.com y password_hash en dakinis_auth.users."
  }
}

Write-Host ""
Write-Host "Listo."

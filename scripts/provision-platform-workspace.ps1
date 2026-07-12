# Provision completo — Dakinis Workspace + AkoeNet Assistant (platform admin)
#
# 1. Sincroniza catálogo JSON → shared-brand, Client, Server
# 2. Ejecuta SQL en Supabase si PLATFORM_DATABASE_URL o DATABASE_URL está definida
#    (URI pooler :5432 direct session — no pgbouncer para DDL)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path (Join-Path $root "projects\workspace\catalog\workspace-addons.json"))) {
  $root = "d:\dakinis-systems"
}

Write-Host "==> Sync workspace addon catalog"
node (Join-Path $root "scripts\sync-workspace-addons-catalog.mjs")

$sqlFiles = @(
  (Join-Path $root "docs\supabase\migrations\035_dakinis_workspace_addons.sql"),
  (Join-Path $root "docs\supabase\scripts\provision_workspace_addons_christiandvillar.sql"),
  (Join-Path $root "docs\supabase\scripts\provision_akoenet_assistant_christiandvillar.sql")
)

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
    /* railway optional */
  } finally {
    Pop-Location
  }
}

Write-Host ""
if ($dbUrl) {
  Write-Host "==> Supabase SQL (automático via run-supabase-sql-files.mjs)"
  $env:PLATFORM_DATABASE_URL = $dbUrl
  $runner = Join-Path $root "scripts\run-supabase-sql-files.mjs"
  $args = @($runner) + $sqlFiles
  node @args
  if ($LASTEXITCODE -ne 0) { throw "SQL provisioning failed" }
  Remove-Item Env:PLATFORM_DATABASE_URL -ErrorAction SilentlyContinue
} else {
  Write-Host "==> Supabase SQL (ejecutar en SQL Editor, en orden):"
  foreach ($f in $sqlFiles) {
    Write-Host "  - $f"
  }
  Write-Host ""
  Write-Host "O define PLATFORM_DATABASE_URL (pooler session :5432) y vuelve a ejecutar este script."
}

Write-Host ""
Write-Host "==> Internal API (opcional, tras SQL):"
Write-Host "  POST /internal/workspaces/{workspaceId}/addons/enable-all"
Write-Host ""
Write-Host "Listo. Despliega akoenet-backend + akoenet-client para ver /workspace en producción."

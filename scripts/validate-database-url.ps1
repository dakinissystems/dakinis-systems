# Valida DATABASE_URL (formato Supabase/Railway) sin mostrar contraseña.
# Uso:
#   $env:DATABASE_URL = "postgresql://..."
#   .\scripts\validate-database-url.ps1
# O desde Core API:
#   cd platform\core\api
#   $env:DATABASE_URL = "..."
#   node --test test/validate-database-url.test.js

$ErrorActionPreference = "Stop"
$url = $env:DATABASE_URL
if (-not $url) {
  Write-Host "ERROR: Define DATABASE_URL primero." -ForegroundColor Red
  Write-Host "Ejemplo (Supabase pooler):"
  Write-Host '  $env:DATABASE_URL = "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"'
  exit 1
}

$coreApi = Join-Path $PSScriptRoot "..\platform\core\api"
if (-not (Test-Path $coreApi)) {
  Write-Host "ERROR: No se encuentra platform/core/api"
  exit 1
}

Push-Location $coreApi
node --input-type=module -e @"
import { dakinisValidateDatabaseUrl, dakinisMaskDatabaseUrl } from './src/db/validate-database-url.js';
const r = dakinisValidateDatabaseUrl(process.env.DATABASE_URL);
console.log(JSON.stringify({
  ok: r.ok,
  errors: r.errors,
  warnings: r.warnings,
  meta: r.meta,
  masked: dakinisMaskDatabaseUrl(process.env.DATABASE_URL)
}, null, 2));
process.exit(r.ok ? 0 : 1);
"@
$code = $LASTEXITCODE
Pop-Location
exit $code

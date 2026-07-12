# Provision completo — Dakinis Workspace + AkoeNet Assistant (platform admin)
#
# 1. Sincroniza catálogo JSON → shared-brand, Client, Server
# 2. Muestra SQL a ejecutar en Supabase (035 + provisioning)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path (Join-Path $root "projects\workspace\catalog\workspace-addons.json"))) {
  $root = "d:\dakinis-systems"
}

Write-Host "==> Sync workspace addon catalog"
node (Join-Path $root "scripts\sync-workspace-addons-catalog.mjs")

Write-Host ""
Write-Host "==> Supabase SQL (ejecutar en SQL Editor, en orden):"
Write-Host "  1. docs\supabase\migrations\035_dakinis_workspace_addons.sql"
Write-Host "  2. docs\supabase\scripts\provision_workspace_addons_christiandvillar.sql"
Write-Host "  3. docs\supabase\scripts\provision_akoenet_assistant_christiandvillar.sql"
Write-Host ""
Write-Host "==> Internal API (opcional, tras SQL):"
Write-Host "  POST /internal/workspaces/{workspaceId}/addons/enable-all"
Write-Host ""
Write-Host "Listo. Despliega akoenet-backend + akoenet-client para ver /workspace en producción."

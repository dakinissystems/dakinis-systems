# Clone LifeFlow (finanzas) into finanzas/
# Usage: .\scripts\clone-finanzas.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Dest = Join-Path $Root "finanzas"
$Remote = "https://github.com/dakinissystems/lifeflow.git"

if (Test-Path (Join-Path $Dest ".git")) {
  Write-Host "OK finanzas (lifeflow) - already cloned: $Dest"
  Push-Location $Dest
  git fetch origin
  git status -sb | Select-Object -First 1
  Pop-Location
  exit 0
}

if (Test-Path $Dest) {
  $items = Get-ChildItem $Dest -Force
  if ($items.Count -gt 0) {
    Write-Error "Abort: $Dest exists but is not a git repo."
  }
}

Write-Host "Cloning $Remote -> $Dest"
git clone $Remote $Dest
Write-Host "Next: node scripts/sync-all-packages.mjs ; cd finanzas ; npm ci"

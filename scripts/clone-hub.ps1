# Clone Dakinis Hub into hub/
# Usage: .\scripts\clone-hub.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Dest = Join-Path $Root "hub"
$Remote = "https://github.com/dakinissystems/dakinis-hub.git"

if (Test-Path (Join-Path $Dest ".git")) {
  Write-Host "OK hub - already cloned: $Dest"
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
Write-Host "Next: .\scripts\sync-hub-des.ps1 ; cd hub ; npm ci"

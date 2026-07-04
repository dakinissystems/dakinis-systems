# Copia paquetes DES necesarios para build standalone de dakinis-hub.
# Uso: .\scripts\sync-hub-des.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$hubPackages = Join-Path $root "hub\packages"
$srcRoot = Join-Path $root "packages"

$packages = @("shared-brand", "shared-layouts", "shared-ux")

function Copy-Tree($from, $to) {
  if (Test-Path $to) { Remove-Item $to -Recurse -Force }
  Copy-Item $from $to -Recurse
}

New-Item -ItemType Directory -Force -Path $hubPackages | Out-Null

foreach ($pkg in $packages) {
  $from = Join-Path $srcRoot $pkg
  $to = Join-Path $hubPackages $pkg
  if (-not (Test-Path $from)) { throw "Missing $from" }
  Copy-Tree $from $to
  Write-Host "OK $pkg -> hub/packages/$pkg" -ForegroundColor Green
}

Write-Host "Hub DES packages synced." -ForegroundColor Cyan

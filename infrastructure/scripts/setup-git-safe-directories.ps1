# Adds Git safe.directory entries for this ecosystem (Windows / dubious ownership).
# Safe to run multiple times (skips duplicates). Uses UTF-8 with BOM for PS 5.x.

$ErrorActionPreference = 'Stop'

$dirs = @(
  'D:/dakinis-systems'
  'D:/dakinis-systems/apps/streamautomator'
  'D:/dakinis-systems/apps/akoenet/Client'
  'D:/dakinis-systems/apps/akoenet/Server'
  'D:/dakinis-systems/apps/landing'
  'D:/dakinis-systems/platform/auth'
  'D:/dakinis-systems/platform/core'
  'D:/dakinis-systems/platform/shared'
)

function Test-SafeDirectoryPresent {
  param([string]$PathNormalized)
  $all = @(git config --global --get-all safe.directory 2>$null)
  foreach ($line in $all) {
    if ($line -eq $PathNormalized) { return $true }
  }
  return $false
}

foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) {
    Write-Host "SKIP (missing): $d"
    continue
  }
  $norm = $d -replace '\\', '/'
  if (Test-SafeDirectoryPresent -PathNormalized $norm) {
    Write-Host "OK (already): $norm"
  }
  else {
    git config --global --add safe.directory $norm
    Write-Host "ADDED: $norm"
  }
}

Write-Host 'Done.'

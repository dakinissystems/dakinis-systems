# Run when nothing uses these folders (cerrar Cursor/terminals/TortoiseGit desde esas rutas).
# Ejecutar: PowerShell "como administrador" solo si ves errores ACL en .git

$ErrorActionPreference = 'Stop'
$Root = 'D:\dakinis-systems'

# 1) Vacía zombie D:\dakinis-systems\dakinis-shared (el real está en platform\shared)
$legacyShared = Join-Path $Root 'dakinis-shared'
if (Test-Path $legacyShared) {
  $fileCount = (Get-ChildItem $legacyShared -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
  if ($fileCount -eq 0) {
    cmd.exe /c "rmdir /s /q `"$legacyShared`""
    Write-Host "Removed empty legacy dakinis-shared at root (if no lock)."
  }
  else {
    Write-Host "WARN: $legacyShared still has $fileCount files - inspect before deleting."
  }
}

# 2) Traslado físico StreamAutomator: quitar junction y mover desde D:\Schedule
$appsSa = Join-Path $Root 'apps\streamautomator'
$scheduleSrc = 'D:\Schedule\streamer-scheduler'

if (-not (Test-Path $scheduleSrc)) {
  Write-Host "SKIP streamautomator move: schedule source missing (already migrated?)."
} elseif (-not (Test-Path $appsSa)) {
  Move-Item -LiteralPath $scheduleSrc -Destination $appsSa -ErrorAction Stop
  Write-Host "OK moved streamer-scheduler -> apps\streamautomator"
}
elseif ((Get-Item $appsSa).LinkType -eq 'Junction') {
  cmd.exe /c "rmdir `"$appsSa`""
  Move-Item -LiteralPath $scheduleSrc -Destination $appsSa -ErrorAction Stop
  Write-Host "OK replaced junction with physical repo at apps\streamautomator"
}
else {
  Write-Host "SKIP streamautomator: apps\streamautomator exists and is not a junction."
}

Write-Host 'Done.'

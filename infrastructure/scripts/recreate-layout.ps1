# Recrea sólo vínculos que aún tienen sentido después de migración física.
# Akoenet, landing y core están bajo paths reales dentro de dakinis-systems (sin junction).

$ErrorActionPreference = 'Stop'
$Root = 'D:\dakinis-systems'

# StreamAutomator: junction si el repo sigue vivo en D:\Schedule\streamer-scheduler
$targetSa = Join-Path $Root 'apps\streamautomator'
$scheduleSrc = 'D:\Schedule\streamer-scheduler'

if ((-not (Test-Path $targetSa)) -and (Test-Path $scheduleSrc)) {
  New-Item -ItemType Directory -Path (Split-Path $targetSa -Parent) -Force | Out-Null
  cmd.exe /c "mklink /J `"$targetSa`" `"$scheduleSrc`""
  Write-Host "Linked apps\streamautomator -> Schedule\streamer-scheduler"
}
elseif (-not (Test-Path $targetSa)) {
  Write-Host "SKIP streamautomator: create apps/streamautomator manually (move repo or junction)."
}

Write-Host "Note: akoenet -> apps\\akoenet (repo real). landing -> apps\\landing. core -> platform\\core. shared -> platform\\shared."

# Recrea sólo vínculos que aún tienen sentido después de migración física.
# Akoenet, landing y core están bajo paths reales dentro de dakinis-systems (sin junction).
# StreamAutomator upstream: https://github.com/ChristianDVillar/Stream-Schedule (allí el API es backend/).
# En dakinis-systems, Compose espera ../apps/streamautomator/apps/api (no backend/ en la raíz).

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
  Write-Host "SKIP streamautomator: create apps\streamautomator with apps\api + apps\web (Dakinis layout for compose), or junction from your clone. Plain Stream-Schedule uses backend/ — map or fork to apps\api for this stack."
}

Write-Host "Note: akoenet -> apps\\akoenet (repo real). landing -> apps\\landing. core -> platform\\core. shared -> platform\\shared."

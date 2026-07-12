# Regenera docs/AKOENET-ESTADO.md — compilación de todos los MD de AkoeNet
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'docs\AKOENET-ESTADO.md'

$files = @(
  @{ path = 'docs\AKOENET-ASSISTANT.md'; title = 'AKOENET-ASSISTANT.md' },
  @{ path = 'docs\PRODUCTS.md'; title = 'PRODUCTS.md' },
  @{ path = 'docs\DAKINIS-WORKSPACE.md'; title = 'DAKINIS-WORKSPACE.md' },
  @{ path = 'projects\workspace\docs\CAPABILITIES.md'; title = 'workspace/CAPABILITIES.md' },
  @{ path = 'projects\workspace\docs\DESKTOP-RUNTIME.md'; title = 'workspace/DESKTOP-RUNTIME.md' },
  @{ path = 'projects\workspace\docs\ARCHITECTURE.md'; title = 'workspace/ARCHITECTURE.md' },
  @{ path = 'docs\PLATFORM-SETUP-STEPS.md'; title = 'PLATFORM-SETUP-STEPS.md' },
  @{ path = 'docs\supabase\MIGRATE-AKOENET.md'; title = 'MIGRATE-AKOENET.md' },
  @{ path = 'apps\akoenet\Server\README.md'; title = 'akoenet-backend README.md' },
  @{ path = 'services\media\README.md'; title = 'services/media/README.md' },
  @{ path = 'services\media\skins\classic\README.md'; title = 'services/media/skins/classic/README.md' },
  @{ path = 'projects\media-player\README.md'; title = 'projects/media-player/README.md' },
  @{ path = 'projects\media-player\docs\ARCHITECTURE.md'; title = 'projects/media-player/docs/ARCHITECTURE.md' },
  @{ path = 'projects\media-player\docs\AUDIO-ENGINE.md'; title = 'projects/media-player/docs/AUDIO-ENGINE.md' },
  @{ path = 'projects\media-player\docs\DATABASE.md'; title = 'projects/media-player/docs/DATABASE.md' },
  @{ path = 'projects\media-player\docs\INTEGRATION-AKOENET.md'; title = 'projects/media-player/docs/INTEGRATION-AKOENET.md' },
  @{ path = 'projects\media-player\docs\MARKETPLACE.md'; title = 'projects/media-player/docs/MARKETPLACE.md' },
  @{ path = 'projects\media-player\docs\ROADMAP.md'; title = 'projects/media-player/docs/ROADMAP.md' },
  @{ path = 'projects\media-player\docs\SKINS.md'; title = 'projects/media-player/docs/SKINS.md' },
  @{ path = 'projects\media-player\docs\WINDOW-MANAGER.md'; title = 'projects/media-player/docs/WINDOW-MANAGER.md' },
  @{ path = 'projects\media-player\scaffold\README.md'; title = 'projects/media-player/scaffold/README.md' },
  @{ path = 'projects\media-player\scaffold\frontend\README.md'; title = 'projects/media-player/scaffold/frontend/README.md' },
  @{ path = 'projects\media-player\scaffold\backend\README.md'; title = 'projects/media-player/scaffold/backend/README.md' },
  @{ path = 'projects\media-player\examples\skin-classic\README.md'; title = 'projects/media-player/examples/skin-classic/README.md' },
  @{ path = 'projects\akoenet-media-player\README.md'; title = 'projects/akoenet-media-player/README.md' },
  @{ path = 'projects\akoenet-media-player\backend\README.md'; title = 'projects/akoenet-media-player/backend/README.md' },
  @{ path = 'projects\akoenet-media-player\frontend\README.md'; title = 'projects/akoenet-media-player/frontend/README.md' },
  @{ path = 'projects\akoenet-media-player\docs\API.md'; title = 'projects/akoenet-media-player/docs/API.md' },
  @{ path = 'projects\akoenet-media-player\docs\ARCHITECTURE.md'; title = 'projects/akoenet-media-player/docs/ARCHITECTURE.md' },
  @{ path = 'projects\akoenet-media-player\docs\DATABASE.md'; title = 'projects/akoenet-media-player/docs/DATABASE.md' },
  @{ path = 'projects\akoenet-media-player\docs\INTEGRATION-AKOENET.md'; title = 'projects/akoenet-media-player/docs/INTEGRATION-AKOENET.md' },
  @{ path = 'projects\akoenet-media-player\docs\ROADMAP.md'; title = 'projects/akoenet-media-player/docs/ROADMAP.md' },
  @{ path = 'projects\akoenet-media-player\docs\SKINS.md'; title = 'projects/akoenet-media-player/docs/SKINS.md' },
  @{ path = 'projects\akoenet-media-player\docs\WINDOW-MANAGER.md'; title = 'projects/akoenet-media-player/docs/WINDOW-MANAGER.md' },
  @{ path = 'projects\akoenet-media-player\packages\window-manager\README.md'; title = 'projects/akoenet-media-player/packages/window-manager/README.md' },
  @{ path = 'projects\akoenet-media-player\skins\classic\README.md'; title = 'projects/akoenet-media-player/skins/classic/README.md' }
)

$lines = @(
  '# AkoeNet - Compilacion de documentacion',
  '',
  '> Indice maestro para analizar cada documento por separado.',
  '> Regenerar: ``.\scripts\build-akoenet-estado.ps1``',
  '',
  '## Como usar',
  '',
  '- Cada seccion empieza con ``# >> nombre-del-archivo``',
  '- Busca ``>>`` en el editor para saltar entre documentos',
  '- Los originales no se modifican; solo se copian aqui',
  '',
  '## Indice',
  ''
)

$i = 1
foreach ($f in $files) {
  $anchor = ($f.title -replace '[^a-zA-Z0-9\-]', '-').ToLower()
  $lines += "$i. [$($f.title)](#$anchor)"
  $i++
}
$lines += ''
$lines += '---'
$lines += ''

foreach ($f in $files) {
  $full = Join-Path $root $f.path
  $anchor = ($f.title -replace '[^a-zA-Z0-9\-]', '-').ToLower()
  $lines += "<a id=`"$anchor`"></a>"
  $lines += ''
  $lines += "# >> $($f.title)"
  $lines += ''
  $lines += "**Ruta:** ``$($f.path -replace '\\', '/')``"
  $lines += ''
  if (Test-Path $full) {
    $content = (Get-Content $full -Raw -Encoding UTF8).TrimEnd()
    $lines += $content
  } else {
    $lines += '*Archivo no encontrado.*'
  }
  $lines += ''
  $lines += '---'
  $lines += ''
}

[System.IO.File]::WriteAllText($out, ($lines -join "`n") + "`n", [System.Text.UTF8Encoding]::new($true))
Write-Host "OK: $out ($i documents)"

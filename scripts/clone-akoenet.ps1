# Clona AkoeNet (2 repos) en apps/akoenet/ — requerido para Docker compose y CI.
# Uso: .\scripts\clone-akoenet.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Base = Join-Path $Root "apps\akoenet"

$Repos = @(
  @{
    Name   = "Client"
    Remote = "https://github.com/dakinissystems/akoenet-client.git"
  },
  @{
    Name   = "Server"
    Remote = "https://github.com/dakinissystems/akoenet-backend.git"
  }
)

New-Item -ItemType Directory -Force -Path $Base | Out-Null

foreach ($repo in $Repos) {
  $dest = Join-Path $Base $repo.Name
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "OK $($repo.Name) - ya clonado: $dest"
    Push-Location $dest
    git fetch origin
    git status -sb | Select-Object -First 1
    Pop-Location
    continue
  }
  if (Test-Path $dest) {
    $items = Get-ChildItem $dest -Force
    if ($items.Count -gt 0) {
      Write-Error "Abortado: $dest existe pero no es repo git. Mueve o borra la carpeta e reintenta."
    }
  }
  Write-Host "Clonando $($repo.Remote) -> $dest"
  git clone $repo.Remote $dest
}

Write-Host ""
Write-Host "Estructura esperada:"
Write-Host "  apps/akoenet/Client  -> akoenet-client"
Write-Host "  apps/akoenet/Server  -> akoenet-backend"
Write-Host "Nota: apps/akoenet/ no es un repo git; Client y Server tienen cada uno su .git."

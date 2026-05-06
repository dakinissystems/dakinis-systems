# Entrypoint DX: levanta el stack completo desde docker/
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dockerDir = Join-Path $root 'docker'

Set-Location $dockerDir

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created docker/.env from .env.example (ENV=dev).'
}
if (-not (Test-Path '.env.dev')) {
    Copy-Item '.env.dev.example' '.env.dev'
    Write-Host 'Created docker/.env.dev from .env.dev.example — review JWT_SECRET.'
}

docker compose -f compose.full.yml -f compose.dev.yml up --build

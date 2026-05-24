# Backup PostgreSQL — Dakinis local / Docker
# Uso: .\scripts\backup-postgres.ps1
# Requiere contenedor dakinis-postgres en ejecución.

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $PSScriptRoot "..\backups\postgres"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$container = "dakinis-postgres"
$outFile = Join-Path $outDir "dakinis-$timestamp.sql.gz"

Write-Host "Backing up $container -> $outFile"

docker exec $container pg_dumpall -U dakinis | gzip > $outFile

if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_dumpall failed"
}

Write-Host "OK: $outFile"

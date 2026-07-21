# Backup Postgres — Dakinis
#
# Local Docker:
#   .\scripts\backup-postgres.ps1
#
# Production / any Postgres (pg_dump):
#   $env:BACKUP_DATABASE_URL = "postgresql://..."
#   .\scripts\backup-postgres.ps1
#
# Restore test (local ephemeral container):
#   .\scripts\restore-postgres-test.ps1 -BackupFile backups\postgres\dakinis-YYYYMMDD-HHMMSS.sql.gz

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $PSScriptRoot "..\backups\postgres"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$backupUrl = [string]$env:BACKUP_DATABASE_URL
if ($backupUrl) {
  $outFile = Join-Path $outDir "dakinis-remote-$timestamp.sql.gz"
  Write-Host "Backing up via BACKUP_DATABASE_URL -> $outFile"
  $pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
  if (-not $pgDump) {
    Write-Error "pg_dump not found in PATH. Install PostgreSQL client tools or use Docker mode without BACKUP_DATABASE_URL."
  }
  & pg_dump --no-owner --no-acl $backupUrl | gzip > $outFile
  if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed"
  }
  Write-Host "OK: $outFile"
  Write-Host "Next: .\scripts\restore-postgres-test.ps1 -BackupFile `"$outFile`""
  exit 0
}

$container = "dakinis-postgres"
$outFile = Join-Path $outDir "dakinis-$timestamp.sql.gz"

Write-Host "Backing up Docker container $container -> $outFile"
docker exec $container pg_dumpall -U dakinis | gzip > $outFile

if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_dumpall failed"
}

Write-Host "OK: $outFile"
Write-Host "Next: .\scripts\restore-postgres-test.ps1 -BackupFile `"$outFile`""

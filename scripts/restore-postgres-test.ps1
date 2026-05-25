# Prueba de restore PostgreSQL — OBLIGATORIO tras configurar backups
# Uso: .\scripts\restore-postgres-test.ps1 -BackupFile backups\postgres\dakinis-20260524.sql.gz

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$container = "dakinis-postgres-restore-test"
$image = "postgres:15"

if (-not (Test-Path $BackupFile)) {
  Write-Error "Backup no encontrado: $BackupFile"
}

Write-Host "Starting ephemeral Postgres container: $container"
docker rm -f $container 2>$null | Out-Null
docker run -d --name $container -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=restore_test $image | Out-Null

Start-Sleep -Seconds 8

Write-Host "Restoring $BackupFile ..."
if ($BackupFile -match '\.gz$') {
  gzip -dc $BackupFile | docker exec -i $container psql -U test -d restore_test
} else {
  Get-Content $BackupFile -Raw | docker exec -i $container psql -U test -d restore_test
}

if ($LASTEXITCODE -ne 0) {
  docker rm -f $container | Out-Null
  Write-Error "Restore failed"
}

Write-Host "OK: restore completed. Listing schemas:"
docker exec $container psql -U test -d restore_test -c "\dn"

Write-Host "Cleaning up container..."
docker rm -f $container | Out-Null
Write-Host "Restore test PASSED."

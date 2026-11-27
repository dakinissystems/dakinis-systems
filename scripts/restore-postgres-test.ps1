# Prueba de restore PostgreSQL — OBLIGATORIO tras configurar backups
# Uso: .\scripts\restore-postgres-test.ps1 -BackupFile backups\postgres\dakinis-20260524.sql.gz

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$container = "dakinis-postgres-restore-test"
$image = "postgres:15"
$sqlFile = $null

function Remove-RestoreContainer {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  docker rm -f $container 2>$null | Out-Null
  $ErrorActionPreference = $prev
}

if (-not (Test-Path $BackupFile)) {
  Write-Error "Backup no encontrado: $BackupFile"
}

Write-Host "Starting ephemeral Postgres container: $container"
Remove-RestoreContainer
docker run -d --name $container -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=restore_test $image | Out-Null

Start-Sleep -Seconds 8

Write-Host "Restoring $BackupFile ..."
try {
  if ($BackupFile -match '\.gz$') {
    # Windows no trae gzip; descomprimir con .NET a un SQL temporal.
    $sqlFile = Join-Path ([IO.Path]::GetTempPath()) ("dakinis-restore-" + [guid]::NewGuid().ToString("n") + ".sql")
    $in = [IO.File]::OpenRead((Resolve-Path $BackupFile))
    try {
      $gz = New-Object IO.Compression.GzipStream($in, [IO.Compression.CompressionMode]::Decompress)
      try {
        $out = [IO.File]::Create($sqlFile)
        try { $gz.CopyTo($out) } finally { $out.Dispose() }
      } finally { $gz.Dispose() }
    } finally { $in.Dispose() }
  } else {
    $sqlFile = (Resolve-Path $BackupFile).Path
  }

  Get-Content -LiteralPath $sqlFile -Raw -Encoding UTF8 | docker exec -i $container psql -U test -d restore_test
  if ($LASTEXITCODE -ne 0) {
    throw "Restore failed (psql exit $LASTEXITCODE)"
  }
} catch {
  Remove-RestoreContainer
  throw
} finally {
  if ($BackupFile -match '\.gz$' -and $sqlFile -and (Test-Path -LiteralPath $sqlFile)) {
    Remove-Item -LiteralPath $sqlFile -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "OK: restore completed. Listing schemas:"
docker exec $container psql -U test -d restore_test -c "\dn"

Write-Host "Cleaning up container..."
Remove-RestoreContainer
Write-Host "Restore test PASSED."

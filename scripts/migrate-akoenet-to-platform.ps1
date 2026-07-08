#Requires -Version 5.1
<#
.SYNOPSIS
  Exporta datos AkoeNet (Supabase standalone) a legacy_akoenet en dakinis-platform.

.EXAMPLE
  $env:AKOENET_DATABASE_URL = "postgresql://..."
  $env:PLATFORM_DATABASE_URL = "postgresql://..."
  .\scripts\migrate-akoenet-to-platform.ps1
#>
param(
  [string] $SourceDatabaseUrl = $env:AKOENET_DATABASE_URL,
  [string] $DestDatabaseUrl = $env:PLATFORM_DATABASE_URL,
  [switch] $SkipStaging,
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

$tables = @(
  "users",
  "servers",
  "server_members",
  "roles",
  "user_roles",
  "channel_categories",
  "channels",
  "channel_permissions",
  "channel_user_permissions",
  "messages",
  "direct_conversations",
  "direct_messages",
  "server_invites",
  "server_emojis",
  "message_reactions",
  "admin_audit_logs",
  "dmca_takedowns",
  "dpo_requests",
  "push_subscriptions",
  "user_friendships",
  "user_blocks",
  "server_webhooks",
  "server_bans",
  "message_edit_history",
  "legal_terms_acceptances",
  "server_custom_commands",
  "server_calendar_events",
  "server_announcements",
  "role_server_permissions"
)

function Assert-Cli($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "No se encontró '$name' en PATH. Instala PostgreSQL client tools."
  }
}

function Invoke-PsqlFile($url, $file) {
  $resolved = Resolve-Path $file
  Write-Host ">> psql $resolved"
  if ($DryRun) { return }
  & psql $url -v ON_ERROR_STOP=1 -f $resolved.FullName
  if ($LASTEXITCODE -ne 0) { throw "psql falló ($file)" }
}

function Import-TableData($sourceUrl, $destUrl, $table) {
  $qualified = "public.$table"
  Write-Host ">> Export $qualified"

  if ($DryRun) { return }

  $dump = & pg_dump $sourceUrl --data-only --no-owner --no-acl --format=plain --table=$qualified 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Omitiendo $table (pg_dump): $dump"
    return
  }

  $lines = @($dump) | Where-Object {
    $_ -notmatch '^(SET |SELECT pg_catalog\.set_config|\\\\restrict|\\\\unrestrict)' -and
    $_ -notmatch '^--' -and
    $_.Trim() -ne ''
  }

  if ($lines.Count -eq 0) {
    Write-Host "   (vacía)"
    return
  }

  $sql = ($lines -join "`n") -replace 'public\.', 'legacy_akoenet.'
  $tmp = [System.IO.Path]::GetTempFileName() + ".sql"
  try {
    [System.IO.File]::WriteAllText($tmp, $sql)
    & psql $destUrl -v ON_ERROR_STOP=1 -f $tmp
    if ($LASTEXITCODE -ne 0) { throw "Import falló para $table" }
  } finally {
    Remove-Item $tmp -ErrorAction SilentlyContinue
  }
}

Assert-Cli "psql"
Assert-Cli "pg_dump"

if (-not $SourceDatabaseUrl) { throw "Falta -SourceDatabaseUrl o AKOENET_DATABASE_URL" }
if (-not $DestDatabaseUrl) { throw "Falta -DestDatabaseUrl o PLATFORM_DATABASE_URL" }

$repoRoot = Split-Path $PSScriptRoot -Parent
$stagingSql = Join-Path $repoRoot "docs\supabase\scripts\legacy_akoenet_staging.sql"

Write-Host "=== AkoeNet → dakinis-platform (legacy_akoenet staging) ===" -ForegroundColor Cyan

if (-not $SkipStaging) {
  Invoke-PsqlFile $DestDatabaseUrl $stagingSql
}

foreach ($t in $tables) {
  Import-TableData $SourceDatabaseUrl $DestDatabaseUrl $t
}

Write-Host "`n=== Conteos en destino (legacy_akoenet) ===" -ForegroundColor Cyan
$countSql = @"
SELECT 'users' AS tbl, count(*)::text FROM legacy_akoenet.users
UNION ALL SELECT 'servers', count(*)::text FROM legacy_akoenet.servers
UNION ALL SELECT 'messages', count(*)::text FROM legacy_akoenet.messages
UNION ALL SELECT 'channels', count(*)::text FROM legacy_akoenet.channels;
"@

if (-not $DryRun) {
  $countSql | & psql $DestDatabaseUrl -v ON_ERROR_STOP=1
}

Write-Host "`nSiguiente paso: ejecutar en SQL Editor de dakinis-platform:" -ForegroundColor Green
Write-Host "  1. docs/supabase/migrations/014_backfill_legacy_map.sql (si no aplicado)"
Write-Host "  2. docs/supabase/migrations/015b_backfill_akoenet_data.sql"
Write-Host "`nGuía completa: docs/supabase/MIGRATE-AKOENET.md"

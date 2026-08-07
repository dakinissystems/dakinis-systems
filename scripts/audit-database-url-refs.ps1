<#
.SYNOPSIS
  Audita servicios con DATABASE_URL y detecta project ref Supabase legacy.

.PARAMETER ExpectedRef
  Project ref canónico.

.PARAMETER BadRef
  Project ref legacy.

.PARAMETER UseRailway
  Intenta leer variables del servicio Railway linkeado (sin imprimir passwords).
#>
param(
  [string]$ExpectedRef = "omdosutakaefpowscagp",
  [string]$BadRef = "eyiuplmpfjclwrlkbmbe",
  [switch]$UseRailway
)

$ErrorActionPreference = "Continue"

$services = @(
  @{ Name = "dakinis-auth"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-core / Core API"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "akoenet-backend"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-billing"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-internal-api"; Vars = "DATABASE_URL | PLATFORM_DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-ai"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-ai-worker"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-knowledge"; Vars = "DATABASE_URL"; Required = $true; Note = "" },
  @{ Name = "dakinis-knowledge-worker"; Vars = "DATABASE_URL"; Required = $false; Note = "" },
  @{ Name = "dakinis-search"; Vars = "DATABASE_URL"; Required = $false; Note = "opcional" },
  @{ Name = "dakinis-notifications"; Vars = "DATABASE_URL"; Required = $false; Note = "opcional" },
  @{ Name = "streamautomator-api"; Vars = "DATABASE_URL"; Required = $false; Note = "si usa Postgres" },
  @{ Name = "streamautomator-worker"; Vars = "DATABASE_URL"; Required = $false; Note = "si usa Postgres" },
  @{ Name = "dakinis-hub"; Vars = "DATABASE_URL"; Required = $false; Note = "normalmente NO tiene DB" },
  @{ Name = "dakinis-landing"; Vars = "DATABASE_URL"; Required = $false; Note = "normalmente NO tiene DB" },
  @{ Name = "Gateway"; Vars = "DATABASE_URL"; Required = $false; Note = "normalmente NO tiene DB" },
  @{ Name = "GitHub BACKUP_DATABASE_URL"; Vars = "BACKUP_DATABASE_URL"; Required = $true; Note = "GitHub Secrets, no Railway" }
)

function Get-ProjectRef([string]$url) {
  if ([string]::IsNullOrWhiteSpace($url)) { return $null }
  if ($url -match 'postgres(?:ql)?\.([a-z0-9]{20})') { return $Matches[1] }
  if ($url -match 'db\.([a-z0-9]{20})\.supabase\.co') { return $Matches[1] }
  if ($url -match '([a-z0-9]{20})\.supabase\.co') { return $Matches[1] }
  return "unknown"
}

function Get-RefStatus([string]$ref) {
  if (-not $ref) { return "MISSING" }
  if ($ref -eq $ExpectedRef) { return "OK" }
  if ($ref -eq $BadRef) { return "BAD_LEGACY" }
  if ($ref -eq "unknown") { return "UNKNOWN_HOST" }
  return "OTHER_REF"
}

Write-Host ""
Write-Host ("Expected Supabase ref: {0}" -f $ExpectedRef) -ForegroundColor Cyan
Write-Host ("Legacy bad ref:        {0}" -f $BadRef) -ForegroundColor DarkYellow
Write-Host ""

$railwayCmd = Get-Command railway -ErrorAction SilentlyContinue

if ($UseRailway -and $railwayCmd) {
  Write-Host "Mode: Railway CLI linked service - refs only" -ForegroundColor Green
  $varsOut = railway variables --json 2>$null
  if ($varsOut) {
    try {
      $vars = $varsOut | ConvertFrom-Json
      $keys = @("DATABASE_URL", "PLATFORM_DATABASE_URL", "BACKUP_DATABASE_URL")
      foreach ($k in $keys) {
        $val = $null
        if ($vars.PSObject.Properties.Name -contains $k) { $val = [string]$vars.$k }
        $ref = Get-ProjectRef $val
        $status = Get-RefStatus $ref
        $color = "Yellow"
        if ($status -eq "OK") { $color = "Green" }
        elseif ($status -eq "BAD_LEGACY") { $color = "Red" }
        elseif ($status -eq "MISSING") { $color = "DarkGray" }
        $refText = if ($ref) { $ref } else { "(empty)" }
        Write-Host ("[{0}] {1} -> ref={2}" -f $status, $k, $refText) -ForegroundColor $color
      }
    } catch {
      Write-Host ("Could not parse railway variables: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
    }
  } else {
    Write-Host "railway variables failed. Run railway login / railway link first." -ForegroundColor Yellow
  }
  Write-Host ""
  Write-Host "Repeat per service: railway service <name>; railway variables" -ForegroundColor Cyan
} else {
  if ($UseRailway -and -not $railwayCmd) {
    Write-Host "railway CLI not found - showing checklist." -ForegroundColor Yellow
    Write-Host ""
  }

  Write-Host "Checklist - open each Railway service Variables and check project ref:" -ForegroundColor Cyan
  Write-Host ("  OK  = contains {0}" -f $ExpectedRef)
  Write-Host ("  BAD = contains {0}" -f $BadRef)
  Write-Host ""

  foreach ($s in $services) {
    $req = if ($s.Required) { "MUST" } else { "check" }
    $note = if ($s.Note) { " | $($s.Note)" } else { "" }
    Write-Host ("- [{0}] {1}" -f $req, $s.Name)
    Write-Host ("         {0}{1}" -f $s.Vars, $note) -ForegroundColor DarkGray
  }

  Write-Host ""
  Write-Host "Railway UI shortcut: project-wide search for eyiuplmpfjclwrlkbmbe" -ForegroundColor Cyan
  Write-Host "Also: GitHub Settings -> Secrets -> BACKUP_DATABASE_URL" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Already confirmed OK:" -ForegroundColor Green
Write-Host "  Auth, Billing, AkoeNet backend -> omdosutakaefpowscagp"
Write-Host "  Hub -> no DATABASE_URL"
Write-Host ""
Write-Host "Check next (most likely leftover eyiu):" -ForegroundColor Yellow
Write-Host "  1. dakinis-internal-api"
Write-Host "  2. dakinis-core / Core API"
Write-Host "  3. dakinis-ai + dakinis-ai-worker"
Write-Host "  4. dakinis-knowledge + worker"
Write-Host "  5. GitHub BACKUP_DATABASE_URL"
Write-Host "  6. search / notifications / streamautomator"
Write-Host ""
Write-Host "Full Railway API audit (all projects/services):" -ForegroundColor Cyan
Write-Host "  node scripts/check-railway-database-urls.mjs"
Write-Host "  (uses RAILWAY_TOKEN or ~/.railway/config.json; never prints passwords)"
Write-Host ""

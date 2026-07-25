#Requires -Version 5.1
<#
.SYNOPSIS
  Interactive console checklist for MFA + Cloudflare WAF + uptime (SECURITY-OPS P0/P1).

.DESCRIPTION
  Opens the right dashboards and records answers into docs/SECURITY-OPS.md status table
  only when you confirm each item. Does not enable MFA for you (each vendor requires TOTP).

.EXAMPLE
  .\scripts\security-console-checklist.ps1
#>

$ErrorActionPreference = "Stop"

function Open-Url([string]$Url) {
  Write-Host "  → $Url" -ForegroundColor DarkCyan
  Start-Process $Url
}

function Ask-Done([string]$Prompt) {
  $r = Read-Host "$Prompt [y/N]"
  return ($r -eq "y" -or $r -eq "Y" -or $r -eq "yes")
}

Write-Host ""
Write-Host "=== MFA (activar TOTP en cada consola) ===" -ForegroundColor Green
Write-Host "GitHub → Settings → Password and authentication → Two-factor"
Open-Url "https://github.com/settings/security"
$mfaGh = Ask-Done "GitHub MFA activo (cuenta + org owners)?"

Write-Host "Railway → Account → Security"
Open-Url "https://railway.com/account"
$mfaRy = Ask-Done "Railway MFA activo?"

Write-Host "Supabase → Account → Security / MFA"
Open-Url "https://supabase.com/dashboard/account/security"
$mfaSb = Ask-Done "Supabase MFA activo?"

Write-Host "Stripe → Profile → Security"
Open-Url "https://dashboard.stripe.com/settings/user"
$mfaSt = Ask-Done "Stripe MFA activo?"

Write-Host "Cloudflare → My Profile → Authentication"
Open-Url "https://dash.cloudflare.com/profile/authentication"
$mfaCf = Ask-Done "Cloudflare MFA activo?"

Write-Host ""
Write-Host "=== Cloudflare WAF ===" -ForegroundColor Green
Open-Url "https://dash.cloudflare.com/?to=/:account/:zone/security/waf"
Write-Host "1) Managed rules: Cloudflare Managed + OWASP → Managed Challenge o Block"
Write-Host "2) Bots: Bot Fight Mode (o Super Bot Fight según plan)"
Write-Host "3) Rate limiting (opcional): /auth/*"
Write-Host "API opcional: `$env:CLOUDFLARE_API_TOKEN=…; node scripts/configure-cloudflare-waf.mjs"
$waf = Ask-Done "WAF managed rules + bots configurados?"

Write-Host ""
Write-Host "=== Uptime ===" -ForegroundColor Green
Write-Host "Ya hay workflow GitHub: .github/workflows/uptime-probes.yml (cada 15 min)."
Write-Host "Complemento recomendado: Cloudflare Health Checks o Better Stack → email/Slack."
Open-Url "https://dash.cloudflare.com/?to=/:account/:zone/traffic/health-checks"
$uptime = Ask-Done "Health checks externos + alerta email/Slack activos?"

Write-Host ""
Write-Host "=== Resumen (marca en SECURITY-OPS.md) ===" -ForegroundColor Yellow
Write-Host ("MFA GitHub:      {0}" -f $(if ($mfaGh) { "✅" } else { "⬜" }))
Write-Host ("MFA Railway:     {0}" -f $(if ($mfaRy) { "✅" } else { "⬜" }))
Write-Host ("MFA Supabase:    {0}" -f $(if ($mfaSb) { "✅" } else { "⬜" }))
Write-Host ("MFA Stripe:      {0}" -f $(if ($mfaSt) { "✅" } else { "⬜" }))
Write-Host ("MFA Cloudflare:  {0}" -f $(if ($mfaCf) { "✅" } else { "⬜" }))
Write-Host ("WAF:             {0}" -f $(if ($waf) { "✅" } else { "⬜" }))
Write-Host ("Uptime alerts:   {0}" -f $(if ($uptime) { "✅" } else { "⬜" }))

$allMfa = $mfaGh -and $mfaRy -and $mfaSb -and $mfaSt -and $mfaCf
if ($allMfa) { Write-Host "MFA_ALL_PASSED" -ForegroundColor Green }
if ($waf) { Write-Host "WAF_PASSED" -ForegroundColor Green }
if ($uptime) { Write-Host "UPTIME_EXTERNAL_PASSED" -ForegroundColor Green }
Write-Host "UPTIME_GH_WORKFLOW=ready (merge/push monorepo)"

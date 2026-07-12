# Dev — Media Player (AkoeNet addon)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

Write-Host 'Starting dakinis-media API on :4090...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "Set-Location '$root\services\media'; npm run dev"
) | Out-Null

Write-Host 'Starting akoenet-client on :5173...' -ForegroundColor Cyan
Set-Location "$root\apps\akoenet\Client"
npm run dev

# Smoke BullMQ event bus (local o prod con REDIS_URL accesible).
param(
    [string]$RedisUrl = $env:REDIS_URL,
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID
)

$ErrorActionPreference = "Stop"

if (-not $RedisUrl) {
    Write-Host "Define REDIS_URL (Railway Redis plugin)" -ForegroundColor Yellow
    exit 1
}

$env:DAKINIS_EVENT_BUS = "bullmq"
$env:REDIS_URL = $RedisUrl

$root = Split-Path $PSScriptRoot -Parent
$sharedAi = Join-Path $root "packages\shared-ai"

Write-Host "BullMQ smoke — publish billing.payment_succeeded" -ForegroundColor Green

$payload = @{
    businessId = $(if ($BusinessId) { $BusinessId } else { "smoke-test-tenant" })
    tenantId   = $(if ($BusinessId) { $BusinessId } else { "smoke-test-tenant" })
    plan       = "pro"
    status     = "active"
}

$js = @"
import { publishPlatformEvent } from './src/event-bus.js';
const result = await publishPlatformEvent('billing.payment_succeeded', $($payload | ConvertTo-Json -Compress), { source: 'smoke-test' });
console.log(JSON.stringify(result, null, 2));
"@

$tmp = New-TemporaryFile
Set-Content -Path $tmp -Value $js -Encoding utf8

Push-Location $sharedAi
try {
    if (-not (Test-Path "node_modules\bullmq")) {
        Write-Host "Installing shared-ai deps..." -ForegroundColor Cyan
        npm install --no-audit --no-fund 2>&1 | Out-Null
    }
    node --input-type=module -e "import { publishPlatformEvent } from './src/event-bus.js'; const r = await publishPlatformEvent('billing.payment_succeeded', { businessId: '$($payload.businessId)', tenantId: '$($payload.tenantId)', plan: 'pro', status: 'active' }, { source: 'smoke-test' }); console.log(JSON.stringify(r));"
} finally {
    Pop-Location
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "OK — job encolado en dakinis.events (verifica worker Core con DAKINIS_EVENT_BUS=bullmq)" -ForegroundColor Green

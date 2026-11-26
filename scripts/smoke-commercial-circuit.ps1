# B11 — Circuito comercial (probes públicos + opcional timeline stock.low).
# Cadena: Core → Hub → Billing → webhook Stripe vivo → (opcional) Hub timeline.
#
# Uso:
#   .\scripts\smoke-commercial-circuit.ps1
#   .\scripts\smoke-commercial-circuit.ps1 -WithTimeline   # requiere INTERNAL key + user UUID
#
# Resultado fechado: tmp/B11-smoke-YYYYMMDD-HHmmss.md (si -WriteEvidence)

param(
    [string]$GatewayUrl = $(if ($env:DAKINIS_GATEWAY_URL) { $env:DAKINIS_GATEWAY_URL } else { "https://api.dakinissystems.com" }),
    [string]$CoreUrl = $(if ($env:DAKINIS_CORE_URL) { $env:DAKINIS_CORE_URL } else { "https://core.dakinissystems.com" }),
    [string]$HubUrl = $(if ($env:DAKINIS_HUB_URL) { $env:DAKINIS_HUB_URL } else { "https://hub.dakinissystems.com" }),
    [switch]$WithTimeline,
    [switch]$WriteEvidence
)

$ErrorActionPreference = "Stop"
$GatewayUrl = $GatewayUrl.TrimEnd("/")
$CoreUrl = $CoreUrl.TrimEnd("/")
$HubUrl = $HubUrl.TrimEnd("/")
$started = Get-Date
$results = [System.Collections.Generic.List[string]]::new()

function Invoke-Probe {
    param([string]$Name, [string]$Url, [int[]]$OkCodes = @(200))
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host $Url
    $code = 0
    try {
        $code = [int](curl.exe -sS -o NUL -w "%{http_code}" --max-time 25 `
            -A "DakinisCommercialSmoke/1.0" -H "Accept: application/json,text/plain,*/*" $Url)
    } catch {
        $code = 0
    }
    Write-Host "HTTP $code"
    if ($OkCodes -notcontains $code) {
        $results.Add("FAIL $Name HTTP $code")
        throw "FAIL $Name (HTTP $code)"
    }
    $results.Add("OK   $Name HTTP $code")
}

Write-Host "Commercial circuit smoke" -ForegroundColor Green
Write-Host "Started $($started.ToString('o'))" -ForegroundColor DarkGray

Invoke-Probe -Name "core health" -Url "$CoreUrl/health"
Invoke-Probe -Name "hub health" -Url "$HubUrl/health"
Invoke-Probe -Name "billing health" -Url "$GatewayUrl/billing/health"
Invoke-Probe -Name "billing plans" -Url "$GatewayUrl/billing/v1/plans"
Invoke-Probe -Name "core stripe plans" -Url "$GatewayUrl/core/api/public/stripe/plans"
# Webhook endpoint vivo: GET debe ser 405 Method Not Allowed (POST-only)
Invoke-Probe -Name "stripe webhook endpoint" -Url "$GatewayUrl/billing/v1/webhooks/stripe" -OkCodes @(405, 400, 401)

if ($WithTimeline) {
    $key = if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } elseif ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { "" }
    $userId = $env:DAKINIS_PLATFORM_USER_ID
    if (-not $key) { throw "WithTimeline requiere DAKINIS_INTERNAL_SERVICE_KEY" }
    if (-not $userId) { throw "WithTimeline requiere DAKINIS_PLATFORM_USER_ID" }

    $stamp = Get-Date -Format "yyyyMMddHHmmss"
    $bodyObj = @{
        event   = "stock.low"
        userId  = $userId
        source  = "smoke-commercial-circuit"
        payload = @{
            product  = "core"
            sku      = "smoke-$stamp"
            label    = "Smoke B11 $stamp"
            quantity = 1
            action   = "open-core-inventory"
            ctaLabel = "Ver inventario"
        }
    }
    $body = $bodyObj | ConvertTo-Json -Depth 5 -Compress
    $tmp = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
    Write-Host ""
    Write-Host "== hub timeline stock.low ==" -ForegroundColor Cyan
    $code = [int](curl.exe -sS -o NUL -w "%{http_code}" -X POST `
        -H "Authorization: Bearer $key" -H "Content-Type: application/json" `
        --data-binary "@$tmp" "$GatewayUrl/internal/events")
    Remove-Item $tmp -Force
    Write-Host "HTTP $code"
    if ($code -notin 200, 201, 202) {
        $results.Add("FAIL hub timeline stock.low HTTP $code")
        throw "FAIL hub timeline stock.low (HTTP $code)"
    }
    $results.Add("OK   hub timeline stock.low HTTP $code")
}

$ended = Get-Date
Write-Host ""
Write-Host "OK - commercial circuit smoke" -ForegroundColor Green
Write-Host "Elapsed $([int]($ended - $started).TotalSeconds)s" -ForegroundColor DarkGray

if ($WriteEvidence) {
    $root = Split-Path $PSScriptRoot -Parent
    $outDir = Join-Path $root "tmp"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $path = Join-Path $outDir "B11-smoke-$stamp.md"
    $lines = @(
        "# B11 smoke — $stamp",
        "",
        "**Started:** $($started.ToString('o'))",
        "**Ended:** $($ended.ToString('o'))",
        "**Result:** PASS",
        "",
        "## Probes",
        ""
    ) + ($results | ForEach-Object { "- $_" })
    Set-Content -Path $path -Value ($lines -join "`n") -Encoding utf8
    Write-Host "Evidence: $path" -ForegroundColor Yellow
}

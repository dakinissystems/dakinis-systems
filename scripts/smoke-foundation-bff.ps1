# Smoke - Foundation Fase 2 (Internal API BFF + flags)
# Verifica endpoints BFF cacheados y feature flags batch.
#
# Uso:
#   $env:DAKINIS_INTERNAL_SERVICE_KEY = "..."
#   $env:DAKINIS_PLATFORM_USER_ID = "uuid-dakinis-auth"
#   .\scripts\smoke-foundation-bff.ps1

param(
    [string]$GatewayUrl = $(if ($env:DAKINIS_GATEWAY_URL) { $env:DAKINIS_GATEWAY_URL } else { "https://api.dakinissystems.com" }),
    [string]$InternalKey = $(if ($env:DAKINIS_INTERNAL_SERVICE_KEY) { $env:DAKINIS_INTERNAL_SERVICE_KEY } elseif ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { "" }),
    [string]$PlatformUserId = $env:DAKINIS_PLATFORM_USER_ID
)

$ErrorActionPreference = "Stop"
$GatewayUrl = $GatewayUrl.TrimEnd("/")
$InternalBase = "$GatewayUrl/internal"

function Invoke-SmokeJson {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [int[]]$ExpectCodes = @(200)
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "${k}: $($Headers[$k])"
    }
    if ($Method -eq "GET") {
        $raw = curl.exe -s @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    } else {
        $raw = curl.exe -s -X $Method @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if ($ExpectCodes -notcontains $code) {
        throw "FAIL $Name HTTP $code"
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Foundation BFF smoke" -ForegroundColor Green
Write-Host "Gateway: $GatewayUrl" -ForegroundColor DarkGray

Invoke-SmokeJson -Name "Internal health (no auth)" -Url "$InternalBase/health" -ExpectCodes @(200, 401) | Out-Null

if (-not $InternalKey) {
    Write-Host "Omitidos probes autenticados - set DAKINIS_INTERNAL_SERVICE_KEY" -ForegroundColor DarkYellow
    exit 0
}

$authHeaders = @{ Authorization = "Bearer $InternalKey" }

$health = Invoke-SmokeJson -Name "Platform health BFF" -Url "$InternalBase/platform/health" -Headers $authHeaders
$healthJson = $health.Raw | ConvertFrom-Json
$dbOk = if ($healthJson.db) { $healthJson.db.ok } else { $null }
$redisOk = if ($healthJson.redis) { $healthJson.redis.ok } else { $null }
Write-Host "  db: $dbOk | redis: $redisOk" -ForegroundColor Yellow

if ($PlatformUserId) {
    $uid = [uri]::EscapeDataString($PlatformUserId)
    $hub = Invoke-SmokeJson -Name "Hub dashboard aggregated" -Url "$InternalBase/hub/dashboard/aggregated/$uid" -Headers $authHeaders
    $hubJson = $hub.Raw | ConvertFrom-Json
    Write-Host "  aggregated=$($hubJson.aggregated) cached=$($hubJson.cached)" -ForegroundColor Yellow

    $ws = Invoke-SmokeJson -Name "Workspace summary" -Url "$InternalBase/workspace/summary/$uid" -Headers $authHeaders
    $wsJson = $ws.Raw | ConvertFrom-Json
    $enabled = if ($wsJson.addons) { $wsJson.addons.enabled } else { $null }
    Write-Host "  addons.enabled=$enabled" -ForegroundColor Yellow

    $flagsUrl = "${InternalBase}/feature-flags/evaluate?keys=billing.unified,hub.bff_cache&userId=$uid"
    Invoke-SmokeJson -Name "Feature flags batch" -Url $flagsUrl -Headers $authHeaders | Out-Null
} else {
    Write-Host "Omitidos BFF por usuario - set DAKINIS_PLATFORM_USER_ID" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - smoke foundation BFF completado." -ForegroundColor Green

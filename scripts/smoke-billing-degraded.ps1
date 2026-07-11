# Smoke: billing sync degrade -> restore via Core internal API + /api/config check.
param(
    [string]$CoreBase = "https://api.dakinissystems.com/core/api",
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
    [string]$InternalKey = $(if ($env:INTERNAL_API_KEY) { $env:INTERNAL_API_KEY } else { $env:DAKINIS_INTERNAL_SERVICE_KEY }),
    [string]$CoreJwt = $env:DAKINIS_CORE_JWT
)

$ErrorActionPreference = "Stop"
$CoreBase = $CoreBase.TrimEnd("/")

if (-not $InternalKey) {
    Write-Host "Define `$env:INTERNAL_API_KEY (mismo valor en Billing y Core)" -ForegroundColor Yellow
    exit 0
}
if (-not $BusinessId) {
    Write-Host "Define `$env:DAKINIS_BUSINESS_ID (UUID del tenant)" -ForegroundColor Yellow
    exit 0
}

function Invoke-BillingSync {
    param([string]$Event, [hashtable]$Payload)
    $body = @{ event = $Event; payload = $Payload } | ConvertTo-Json -Compress
    $tmp = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
    $url = "$CoreBase/internal/billing/sync"
    Write-Host ""
    Write-Host "== $Event ==" -ForegroundColor Cyan
    $raw = curl.exe -s -X POST -H "Authorization: Bearer $InternalKey" -H "Content-Type: application/json" --data-binary "@$tmp" $url
    $code = curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Authorization: Bearer $InternalKey" -H "Content-Type: application/json" --data-binary "@$tmp" $url
    Remove-Item $tmp -Force
    Write-Host "HTTP $code"
    if ($raw) { try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw } }
    if ($code -notmatch "^2") { throw "FAIL $Event" }
}

function Get-TenantConfig {
    param([string]$Label)
    if (-not $CoreJwt) {
        Write-Host "Omitido GET /api/config ($Label) - define DAKINIS_CORE_JWT" -ForegroundColor DarkYellow
        return $null
    }
    Write-Host ""
    Write-Host "== GET /api/config ($Label) ==" -ForegroundColor Cyan
    $url = "$CoreBase/config"
    $raw = curl.exe -s -H "Authorization: Bearer $CoreJwt" -H "x-business-id: $BusinessId" $url
    $code = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer $CoreJwt" -H "x-business-id: $BusinessId" $url
    Write-Host "HTTP $code"
    if ($raw) {
        try {
            $json = $raw | ConvertFrom-Json
            $json | ConvertTo-Json -Depth 6
            return $json
        } catch {
            Write-Host $raw
        }
    }
    if ($code -notmatch "^2") { throw "FAIL /api/config ($Label)" }
    return $null
}

Write-Host "Billing degraded sync smoke - tenant $BusinessId" -ForegroundColor Green

Invoke-BillingSync -Event "billing.payment_failed" -Payload @{
    businessId = $BusinessId
    tenantId   = $BusinessId
    plan       = "pro"
    status     = "past_due"
}

$degradedConfig = Get-TenantConfig -Label "degraded"
if ($degradedConfig) {
    $access = $degradedConfig.data.accessState
    if ($access -ne "degraded") {
        throw "Expected accessState=degraded, got '$access'"
    }
    Write-Host "OK accessState=degraded" -ForegroundColor Green
}

Invoke-BillingSync -Event "billing.payment_succeeded" -Payload @{
    businessId = $BusinessId
    tenantId   = $BusinessId
    plan       = "pro"
    status     = "active"
}

$activeConfig = Get-TenantConfig -Label "restored"
if ($activeConfig) {
    $access = $activeConfig.data.accessState
    if ($access -ne "active") {
        throw "Expected accessState=active, got '$access'"
    }
    Write-Host "OK accessState=active" -ForegroundColor Green
}

Write-Host ""
Write-Host "OK - degrade + restore sync." -ForegroundColor Green

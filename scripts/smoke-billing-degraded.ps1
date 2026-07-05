# Smoke: billing sync degrade → restore vía Core internal API.
param(
    [string]$CoreBase = "https://api.dakinissystems.com/core/api",
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
    [string]$InternalKey = $env:INTERNAL_API_KEY
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
    Set-Content -Path $tmp -Value $body -Encoding utf8NoBOM -NoNewline
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

Write-Host "Billing degraded sync smoke — tenant $BusinessId" -ForegroundColor Green

Invoke-BillingSync -Event "billing.payment_failed" -Payload @{
    businessId = $BusinessId
    tenantId   = $BusinessId
    plan       = "pro"
    status     = "past_due"
}

Invoke-BillingSync -Event "billing.payment_succeeded" -Payload @{
    businessId = $BusinessId
    tenantId   = $BusinessId
    plan       = "pro"
    status     = "active"
}

Write-Host ""
Write-Host "OK — degrade + restore sync." -ForegroundColor Green

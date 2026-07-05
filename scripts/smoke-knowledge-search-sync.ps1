# Smoke Knowledge → Search index sync.
param(
    [string]$Gateway = "https://api.dakinissystems.com",
    [string]$ServiceKey = $env:DAKINIS_INTERNAL_SERVICE_KEY,
    [string]$IngestSlug = "search-sync-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

$ErrorActionPreference = "Stop"
$Gateway = $Gateway.TrimEnd("/")

if (-not $ServiceKey) {
    Write-Host "Define DAKINIS_INTERNAL_SERVICE_KEY for sync endpoint" -ForegroundColor Yellow
    exit 1
}

$headers = @{ Authorization = "Bearer $ServiceKey"; "Content-Type" = "application/json" }

Write-Host "Knowledge → Search sync smoke" -ForegroundColor Green

$ingestBody = (@{
    sourceType = "faq"
    title      = "Search sync smoke"
    content    = "indexed content $IngestSlug"
    metadata   = @{ slug = $IngestSlug }
} | ConvertTo-Json -Compress)

Invoke-RestMethod -Uri "$Gateway/knowledge/v1/ingest" -Method POST -Body $ingestBody -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 3

$sync = Invoke-RestMethod -Uri "$Gateway/knowledge/v1/sync/search" -Method POST -Headers $headers -Body '{"limit":50}'
Write-Host "Sync: total=$($sync.total) indexed=$($sync.indexed) deferred=$($sync.deferred)"

$query = Invoke-RestMethod -Uri "$Gateway/search/v1/query?q=$IngestSlug&scope=knowledge"
$hits = @($query.hits)
if ($hits.Count -lt 1) {
    throw "FAIL — no search hits for slug token in scope=knowledge"
}

Write-Host "Search hit: $($hits[0].title) ($($hits[0].id))"
Write-Host "OK — Knowledge indexed in Search" -ForegroundColor Green

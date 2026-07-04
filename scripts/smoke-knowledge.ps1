# Smoke test Knowledge (prod or local via gateway).
# Usage:
#   .\scripts\smoke-knowledge.ps1
#   .\scripts\smoke-knowledge.ps1 -BaseUrl http://localhost

param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$IngestSlug = "smoke-persist-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

function Invoke-Smoke {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [int[]]$OkCodes = @(200)
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    if ($Body) {
        $tmp = New-TemporaryFile
        Set-Content -Path $tmp -Value $Body -Encoding utf8NoBOM -NoNewline
        $raw = curl.exe -s -X $Method -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method -H "Content-Type: application/json" --data-binary "@$tmp" $Url)
        Remove-Item $tmp -Force
    } else {
        $raw = curl.exe -s $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if ($OkCodes -notcontains $code) { throw "FAIL $Name (HTTP $code)" }
    return $raw
}

Write-Host "Knowledge smoke - $BaseUrl" -ForegroundColor Green

Invoke-Smoke -Name "knowledge health (gateway)" -Url "$BaseUrl/knowledge/health"
Invoke-Smoke -Name "knowledge sources" -Url "$BaseUrl/knowledge/v1/sources"

$ingestBody = (@{
    sourceType = "faq"
    title      = "Smoke persist doc"
    content    = "hello knowledge persist $IngestSlug"
    metadata   = @{ slug = $IngestSlug }
} | ConvertTo-Json -Compress)

Invoke-Smoke -Name "knowledge ingest" -Url "$BaseUrl/knowledge/v1/ingest" -Method "POST" -Body $ingestBody -OkCodes @(201, 202)

Write-Host ""
Write-Host "Waiting for worker persist..." -ForegroundColor DarkGray
Start-Sleep -Seconds 4

$docRaw = Invoke-Smoke -Name "knowledge document by slug" -Url "$BaseUrl/knowledge/v1/documents?slug=$IngestSlug"
$docJson = $docRaw | ConvertFrom-Json
if (-not $docJson.items -or $docJson.items.Count -lt 1) {
    throw "FAIL document persist — no row for slug=$IngestSlug (check worker DATABASE_URL)"
}

Invoke-Smoke -Name "knowledge query stub" -Url "$BaseUrl/knowledge/v1/query" -Method "POST" -Body '{"query":"test"}'

Write-Host ""
Write-Host "OK - Knowledge ingest persisted (slug=$IngestSlug)." -ForegroundColor Green

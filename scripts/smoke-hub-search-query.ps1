# Smoke Hub Ctrl+K search chain: Search API + Core proxy /api/search/query.
param(
    [string]$Gateway = "https://api.dakinissystems.com",
    [string]$CoreBase = "https://api.dakinissystems.com/core/api",
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
    [string]$CoreJwt = $env:DAKINIS_CORE_JWT,
    [string]$Query = "dakinis"
)

$ErrorActionPreference = "Stop"
$Gateway = $Gateway.TrimEnd("/")
$CoreBase = $CoreBase.TrimEnd("/")

function Invoke-SmokeGet {
    param([string]$Name, [string]$Url, [hashtable]$Headers = @{})
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "GET $Url"
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "$k`: $($Headers[$k])"
    }
    $raw = curl.exe -s @headerArgs $Url
    $code = curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 6 } catch { Write-Host $raw }
    }
    if ($code -notmatch "^2") { throw "FAIL $Name (HTTP $code)" }
    if ($raw) {
        try { return $raw | ConvertFrom-Json } catch { return $null }
    }
    return $null
}

Write-Host "Hub search query smoke - $Gateway" -ForegroundColor Green

$q = [uri]::EscapeDataString($Query)
$scopeParam = [char]38 + "scope=knowledge"
$searchUrl = "$Gateway/search/v1/query?q=$q$scopeParam"
$coreUrl = "$CoreBase/search/query?q=$q$scopeParam"

Invoke-SmokeGet -Name "search health" -Url "$Gateway/search/health" | Out-Null
$searchJson = Invoke-SmokeGet -Name "search query (knowledge scope)" -Url $searchUrl
$hits = @($searchJson.hits)
Write-Host "Search hits: $($hits.Count)" -ForegroundColor DarkGray

if ($CoreJwt -and $BusinessId) {
    $coreJson = Invoke-SmokeGet -Name "core proxy /api/search/query" -Url $coreUrl -Headers @{
        Authorization = "Bearer $CoreJwt"
        "x-business-id" = $BusinessId
    }
    $coreHits = @($coreJson.data.hits)
    if ($coreHits.Count -lt 0) {
        Write-Host "Core proxy returned data (hits may be 0 if index empty)" -ForegroundColor DarkYellow
    }
} else {
    Write-Host ""
    Write-Host "Omitido Core proxy - define DAKINIS_CORE_JWT y DAKINIS_BUSINESS_ID para validar /api/search/query" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - Hub search query chain reachable" -ForegroundColor Green

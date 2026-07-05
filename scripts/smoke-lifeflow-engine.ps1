# Smoke LifeFlow Engine v1 (service auth).
param(
    [string]$ApiUrl = $env:FINANZAS_API_URL,
    [string]$ServiceKey = $env:DAKINIS_SERVICE_KEY,
    [string]$UserId = $env:DAKINIS_USER_ID
)

$ErrorActionPreference = "Stop"

if (-not $ApiUrl) { $ApiUrl = "http://127.0.0.1:4100" }
if (-not $ServiceKey) { $ServiceKey = $env:DAKINIS_AI_SERVICE_KEY }
if (-not $UserId) {
    Write-Host "Define DAKINIS_USER_ID (UUID LifeFlow user)" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    Authorization       = "Bearer $ServiceKey"
    "X-Dakinis-User-Id" = $UserId
}

Write-Host "LifeFlow Engine v1 — $ApiUrl" -ForegroundColor Green

$health = Invoke-RestMethod -Uri "$($ApiUrl.TrimEnd('/'))/health" -Method GET
Write-Host "API health engineVersion=$($health.engineVersion)"

$score = Invoke-RestMethod -Uri "$($ApiUrl.TrimEnd('/'))/v1/score" -Method POST -Headers $headers -Body "{}" -ContentType "application/json"
Write-Host "Score overall=$($score.lifeflowIndex.overall) grade=$($score.lifeflowIndex.grade)"
Write-Host "Health $($score.financialHealth.label) risk=$($score.financialRisk.level)"

Write-Host ""
Write-Host "OK — Engine v1 /v1/score" -ForegroundColor Green

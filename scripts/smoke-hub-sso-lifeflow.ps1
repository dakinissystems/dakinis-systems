# Smoke Hub SSO → LifeFlow API exchange (sin navegador).
param(
    [string]$AuthUrl = $env:DAKINIS_AUTH_URL,
    [string]$LifeFlowApi = $env:FINANZAS_API_URL,
    [string]$Email = $env:DAKINIS_TEST_EMAIL,
    [string]$Password = $env:DAKINIS_TEST_PASSWORD
)

$ErrorActionPreference = "Stop"

if (-not $AuthUrl) { $AuthUrl = "https://auth.dakinissystems.com/auth" }
if (-not $LifeFlowApi) { $LifeFlowApi = "http://127.0.0.1:4100" }
if (-not $Email -or -not $Password) {
    Write-Host "Define DAKINIS_TEST_EMAIL y DAKINIS_TEST_PASSWORD" -ForegroundColor Yellow
    exit 1
}

Write-Host "Hub SSO smoke — IdP login + LifeFlow hub-sso" -ForegroundColor Green

$idp = Invoke-RestMethod -Uri "$($AuthUrl.TrimEnd('/'))/login" -Method POST `
    -ContentType "application/json" `
    -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)

$token = $idp.token
if (-not $token) { $token = $idp.accessToken }
if (-not $token) { throw "IdP no devolvió token" }

$lf = Invoke-RestMethod -Uri "$($LifeFlowApi.TrimEnd('/'))/api/auth/hub-sso" -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body "{}"

Write-Host "LifeFlow user=$($lf.user.email) provisioned=$($lf.sso.provisioned)"
Write-Host "OK — Hub SSO exchange" -ForegroundColor Green

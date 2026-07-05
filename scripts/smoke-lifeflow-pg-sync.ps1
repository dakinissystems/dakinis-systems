# Smoke LifeFlow PostgreSQL sync (score_history + app_user_links).
param(
    [string]$LifeFlowApi = $env:FINANZAS_API_URL,
    [string]$ServiceKey = $env:DAKINIS_SERVICE_KEY,
    [string]$UserId = $env:DAKINIS_LIFEFLOW_USER_ID,
    [string]$AuthUrl = $env:DAKINIS_AUTH_URL,
    [string]$Email = $env:DAKINIS_TEST_EMAIL,
    [string]$Password = $env:DAKINIS_TEST_PASSWORD
)

$ErrorActionPreference = "Stop"

if (-not $LifeFlowApi) { $LifeFlowApi = "https://api-finanzas.dakinissystems.com" }
if (-not $ServiceKey) {
    Write-Host "Define DAKINIS_SERVICE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "LifeFlow PG sync smoke — $LifeFlowApi" -ForegroundColor Green

$health = Invoke-RestMethod -Uri "$($LifeFlowApi.TrimEnd('/'))/health"
Write-Host "SQLite: $($health.db.engine) users=$($health.db.userCount)"
Write-Host "Postgres: enabled=$($health.postgres.enabled) ok=$($health.postgres.ok) schema=$($health.postgres.schema)"
if (-not $health.postgres.enabled) {
    Write-Host "DATABASE_URL no configurada en LifeFlow API — omitido score sync" -ForegroundColor Yellow
    exit 0
}
if (-not $health.postgres.ok) {
    throw "Postgres no conecta: $($health.postgres.reason)"
}

if (-not $UserId -and $Email -and $Password) {
    if (-not $AuthUrl) { $AuthUrl = "https://auth.dakinissystems.com/auth" }
    $idp = Invoke-RestMethod -Uri "$($AuthUrl.TrimEnd('/'))/login" -Method POST `
        -ContentType "application/json" `
        -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)
    $token = $idp.token
    if (-not $token) { $token = $idp.accessToken }
    $lf = Invoke-RestMethod -Uri "$($LifeFlowApi.TrimEnd('/'))/api/auth/hub-sso" -Method POST `
        -Headers @{ Authorization = "Bearer $token" } `
        -ContentType "application/json" -Body "{}"
    $UserId = $lf.user.id
    Write-Host "Hub SSO → app user $UserId (provisioned=$($lf.sso.provisioned))"
}

if (-not $UserId) {
    Write-Host "Define DAKINIS_LIFEFLOW_USER_ID o credenciales IdP" -ForegroundColor Yellow
    exit 1
}

$score = Invoke-RestMethod -Uri "$($LifeFlowApi.TrimEnd('/'))/v1/score" -Method POST `
    -Headers @{
        Authorization = "Bearer $ServiceKey"
        "X-Dakinis-User-Id" = $UserId
    } `
    -ContentType "application/json" `
    -Body "{}"

Write-Host "Engine score overall=$($score.lifeflowIndex.overall)"
Write-Host ""
Write-Host "OK — score calculado; verifica lifeflow.score_history en Supabase para el platform_user_id enlazado." -ForegroundColor Green

# Smoke Hub SSO -> LifeFlow API exchange (sin navegador).
param(
    [string]$AuthUrl = $(if ($env:DAKINIS_AUTH_URL) { $env:DAKINIS_AUTH_URL } else { "https://auth.dakinissystems.com/auth" }),
    [string]$LifeFlowApi = $(if ($env:FINANZAS_API_URL) { $env:FINANZAS_API_URL } else { "https://finance-api.dakinissystems.com" }),
    [string]$Email = $env:DAKINIS_TEST_EMAIL,
    [string]$Password = $env:DAKINIS_TEST_PASSWORD
)

$ErrorActionPreference = "Stop"
$AuthUrl = $AuthUrl.TrimEnd("/")
$LifeFlowApi = $LifeFlowApi.TrimEnd("/")

if (-not $Email -or -not $Password) {
    Write-Host "Define DAKINIS_TEST_EMAIL y DAKINIS_TEST_PASSWORD" -ForegroundColor Yellow
    exit 1
}

Write-Host "Hub SSO smoke - IdP login + LifeFlow hub-sso" -ForegroundColor Green
Write-Host "Auth: $AuthUrl | LifeFlow: $LifeFlowApi" -ForegroundColor DarkGray

$loginBody = (@{ email = $Email; password = $Password } | ConvertTo-Json -Compress)
$loginTmp = New-TemporaryFile
[System.IO.File]::WriteAllText($loginTmp, $loginBody, [System.Text.UTF8Encoding]::new($false))
$idpRaw = curl.exe -s -X POST -H "Content-Type: application/json" --data-binary "@$loginTmp" "$AuthUrl/login"
$idpCode = [int](curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Content-Type: application/json" --data-binary "@$loginTmp" "$AuthUrl/login")
Remove-Item $loginTmp -Force
if ($idpCode -ne 200) {
    Write-Host $idpRaw
    throw "IdP login failed HTTP $idpCode"
}
$idp = $idpRaw | ConvertFrom-Json
$token = $idp.token
if (-not $token) { $token = $idp.accessToken }
if (-not $token) { throw "IdP no devolvio token" }

$ssoTmp = New-TemporaryFile
[System.IO.File]::WriteAllText($ssoTmp, "{}", [System.Text.UTF8Encoding]::new($false))
$lfRaw = curl.exe -s -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" --data-binary "@$ssoTmp" "$LifeFlowApi/api/auth/hub-sso"
$lfCode = [int](curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" --data-binary "@$ssoTmp" "$LifeFlowApi/api/auth/hub-sso")
Remove-Item $ssoTmp -Force
Write-Host "hub-sso HTTP $lfCode"
if ($lfCode -ne 200) {
    Write-Host $lfRaw
    throw "LifeFlow hub-sso failed HTTP $lfCode"
}
$lf = $lfRaw | ConvertFrom-Json
Write-Host "LifeFlow user=$($lf.user.email) id=$($lf.user.id) provisioned=$($lf.sso.provisioned)"
Write-Host "OK - Hub SSO exchange" -ForegroundColor Green

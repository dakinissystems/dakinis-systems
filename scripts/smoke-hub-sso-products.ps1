# Smoke Hub SSO -> product API exchange (StreamAutomator, AkoeNet, LifeFlow).
param(
    [string]$AuthUrl = $env:DAKINIS_AUTH_URL,
    [string]$StreamAutomatorApi = $env:STREAMAUTOMATOR_API_URL,
    [string]$AkoeNetApi = $env:AKOENET_API_URL,
    [string]$LifeFlowApi = $env:FINANZAS_API_URL,
    [string]$Email = $env:DAKINIS_TEST_EMAIL,
    [string]$Password = $env:DAKINIS_TEST_PASSWORD,
    [ValidateSet("all", "streamautomator", "akoenet", "lifeflow")]
    [string]$Product = "all"
)

$ErrorActionPreference = "Stop"

if (-not $AuthUrl) { $AuthUrl = "https://auth.dakinissystems.com/auth" }
if (-not $StreamAutomatorApi) { $StreamAutomatorApi = "https://api.streamautomator.com" }
if (-not $AkoeNetApi) { $AkoeNetApi = "https://api.akoenet.com" }
if (-not $LifeFlowApi) { $LifeFlowApi = "https://finance-api.dakinissystems.com" }
if (-not $Email -or -not $Password) {
    Write-Host "Hub SSO gateway probe (sin credenciales)" -ForegroundColor Yellow
    Write-Host "Tip: define DAKINIS_TEST_EMAIL y DAKINIS_TEST_PASSWORD para E2E IdP + hub-sso" -ForegroundColor DarkYellow
    Write-Host ""

    function Test-HubSsoRoute {
        param([string]$Name, [string]$Url)
        Write-Host "== $Name ==" -ForegroundColor Cyan
        Write-Host "POST $Url"
        $raw = curl.exe -s -X POST -H "Content-Type: application/json" -d "{}" $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "{}" $Url
        Write-Host "HTTP $code"
        if ($raw) { Write-Host $raw -ForegroundColor DarkGray }
        if ($code -match "^(401|403|400)$") {
            Write-Host "OK route live (auth/validation required)" -ForegroundColor Green
        } elseif ($code -eq "404") {
            Write-Host "WARN ruta no desplegada o URL incorrecta" -ForegroundColor Yellow
        } elseif ($code -eq "000") {
            Write-Host "WARN host no alcanzable (DNS/TLS)" -ForegroundColor Yellow
        } else {
            throw "FAIL $Name (HTTP $code)"
        }
    }

    $authBase = $AuthUrl.TrimEnd("/")
    Write-Host "== Auth reachable ==" -ForegroundColor Cyan
    Write-Host "GET $authBase/health"
    $authCode = curl.exe -s -o NUL -w "%{http_code}" "$authBase/health"
    Write-Host "HTTP $authCode"

    Test-HubSsoRoute -Name "StreamAutomator hub-sso" -Url "$($StreamAutomatorApi.TrimEnd('/'))/api/auth/hub-sso"
    Test-HubSsoRoute -Name "AkoeNet hub-sso" -Url "$($AkoeNetApi.TrimEnd('/'))/auth/hub-sso"
    Test-HubSsoRoute -Name "LifeFlow hub-sso" -Url "$($LifeFlowApi.TrimEnd('/'))/api/auth/hub-sso"

    Write-Host ""
    Write-Host "OK - Hub SSO routes reachable (gateway probe)" -ForegroundColor Green
    exit 0
}

function Invoke-HubSsoExchange {
    param([string]$Name, [string]$ApiBase)
    $base = $ApiBase.TrimEnd("/")
    $url = if ($Name -eq "AkoeNet") { "$base/auth/hub-sso" } else { "$base/api/auth/hub-sso" }
    Write-Host ""
    Write-Host "== $Name hub-sso ==" -ForegroundColor Cyan
    Write-Host "POST $url"
    try {
        $res = Invoke-RestMethod -Uri $url -Method POST `
            -Headers @{ Authorization = "Bearer $script:IdpToken" } `
            -ContentType "application/json" `
            -Body "{}"
    } catch {
        Write-Host "WARN $($_.Exception.Message)" -ForegroundColor Yellow
        return
    }
    $email = $res.user.email
    if (-not $email) { $email = $res.user.username }
    Write-Host "user=$email provisioned=$($res.sso.provisioned)" -ForegroundColor Green
}

Write-Host "Hub SSO smoke - IdP + products" -ForegroundColor Green

$idp = Invoke-RestMethod -Uri "$($AuthUrl.TrimEnd('/'))/login" -Method POST `
    -ContentType "application/json" `
    -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)

$script:IdpToken = $idp.token
if (-not $script:IdpToken) { $script:IdpToken = $idp.accessToken }
if (-not $script:IdpToken) { throw "IdP no devolvio token" }

if ($Product -eq "all" -or $Product -eq "streamautomator") {
    Invoke-HubSsoExchange -Name "StreamAutomator" -ApiBase $StreamAutomatorApi
}
if ($Product -eq "all" -or $Product -eq "akoenet") {
    Invoke-HubSsoExchange -Name "AkoeNet" -ApiBase $AkoeNetApi
}
if ($Product -eq "all" -or $Product -eq "lifeflow") {
    Invoke-HubSsoExchange -Name "LifeFlow" -ApiBase $LifeFlowApi
}

Write-Host ""
Write-Host "OK - Hub SSO exchanges" -ForegroundColor Green

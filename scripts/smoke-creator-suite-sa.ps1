# Smoke - Creator Suite StreamAutomator (Fase 1C dual-write)
# Verifica Director + Automation API y dual-write stream.* (lectura/escritura).
#
# Uso basico (solo lectura, requiere JWT):
#   $env:STREAMAUTOMATOR_JWT = "eyJ..."
#   .\scripts\smoke-creator-suite-sa.ps1
#
# Escritura segura (crea/borra regla automation de prueba):
#   .\scripts\smoke-creator-suite-sa.ps1 -LiveWrite
#
# Director start (idempotente; no finaliza sesion activa salvo -EndDirector):
#   .\scripts\smoke-creator-suite-sa.ps1 -LiveWrite -LiveDirector
#   .\scripts\smoke-creator-suite-sa.ps1 -LiveWrite -LiveDirector -EndDirector

param(
    [string]$StreamApiUrl = $(if ($env:STREAMAUTOMATOR_API_URL) { $env:STREAMAUTOMATOR_API_URL } else { "https://api.streamautomator.com" }),
    [string]$SaJwt = $env:STREAMAUTOMATOR_JWT,
    [switch]$LiveWrite,
    [switch]$LiveDirector,
    [switch]$EndDirector
)

$ErrorActionPreference = "Stop"
$StreamApiUrl = $StreamApiUrl.TrimEnd("/")

function Invoke-SmokeJson {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int[]]$ExpectCodes = @(200, 201)
    )
    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    Write-Host "$Method $Url"
    $headerArgs = @()
    foreach ($k in $Headers.Keys) {
        $headerArgs += "-H"
        $headerArgs += "${k}: $($Headers[$k])"
    }
    if ($Body) {
        $tmp = New-TemporaryFile
        [System.IO.File]::WriteAllText($tmp, $Body, [System.Text.UTF8Encoding]::new($false))
        $raw = curl.exe -s -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url)
        Remove-Item $tmp -Force
    } elseif ($Method -eq "GET") {
        $raw = curl.exe -s @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    } else {
        $raw = curl.exe -s -X $Method @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
    }
    if ($ExpectCodes -notcontains $code) {
        if ($raw) {
            try {
                $errJson = $raw | ConvertFrom-Json
                if ($errJson.details) { Write-Host "  details: $($errJson.details)" -ForegroundColor Yellow }
                if ($errJson.error) { Write-Host "  error: $($errJson.error)" -ForegroundColor Yellow }
            } catch { }
        }
        throw "FAIL $Name HTTP $code"
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "Creator Suite SA smoke (Fase 1C)" -ForegroundColor Green
Write-Host "API: $StreamApiUrl" -ForegroundColor DarkGray

Invoke-SmokeJson -Name "SA API health" -Url "$StreamApiUrl/api/health" | Out-Null
Invoke-SmokeJson -Name "Director active (sin auth -> 401)" -Url "$StreamApiUrl/api/director/active" -ExpectCodes @(401) | Out-Null
Invoke-SmokeJson -Name "Automation rules (sin auth -> 401)" -Url "$StreamApiUrl/api/automation/rules" -ExpectCodes @(401) | Out-Null

if (-not $SaJwt) {
    Write-Host ""
    Write-Host "Omitidos probes autenticados - set STREAMAUTOMATOR_JWT (auth_token:v1 del navegador)" -ForegroundColor DarkYellow
    exit 0
}

$jwtTrim = $SaJwt.Trim()
$authHeaders = @{ Authorization = "Bearer $jwtTrim" }

$preflight = Invoke-SmokeJson -Name "SA auth preflight (payments)" `
    -Url "$StreamApiUrl/api/payments/subscription" `
    -Headers $authHeaders `
    -ExpectCodes @(200, 401, 404)
if ($preflight.Code -eq 401) {
    throw "FAIL JWT invalid for SA API (preflight 401)"
}

Invoke-SmokeJson -Name "Automation catalog" -Url "$StreamApiUrl/api/automation/catalog" -Headers $authHeaders | Out-Null
Invoke-SmokeJson -Name "Automation rules list" -Url "$StreamApiUrl/api/automation/rules" -Headers $authHeaders | Out-Null

$active = Invoke-SmokeJson -Name "Director active session" -Url "$StreamApiUrl/api/director/active" -Headers $authHeaders -ExpectCodes @(200, 404)
$activeJson = $null
if ($active.Raw) {
    try { $activeJson = $active.Raw | ConvertFrom-Json } catch { }
}
if ($activeJson -and $activeJson.session) {
    Write-Host "  Sesion director activa: id=$($activeJson.session.id) status=$($activeJson.session.status)" -ForegroundColor DarkGray
} else {
    Write-Host "  Sin sesion director activa" -ForegroundColor DarkGray
}

if (-not $LiveWrite) {
    Write-Host ""
    Write-Host "LiveWrite omitido - usa -LiveWrite para crear/borrar regla de prueba" -ForegroundColor DarkYellow
    Write-Host "OK - smoke Creator Suite SA (lectura) completado." -ForegroundColor Green
    exit 0
}

$ruleName = "smoke-creator-suite-$(Get-Date -Format 'yyyyMMddHHmmss')"
$ruleBody = (@{
    name = $ruleName
    enabled = $false
    triggerType = "stream.scheduled"
    triggerConfig = @{ minutesBefore = 30 }
    actions = @(@{ type = "notify.discord"; params = @{ message = "smoke test" } })
} | ConvertTo-Json -Compress -Depth 6)

$created = Invoke-SmokeJson -Name "Automation rule create (dual-write)" `
    -Url "$StreamApiUrl/api/automation/rules" `
    -Method "POST" -Headers $authHeaders -Body $ruleBody -ExpectCodes @(201)
$createdJson = $created.Raw | ConvertFrom-Json
Write-Host "  Regla creada id=$($createdJson.id) name=$ruleName" -ForegroundColor DarkGray

$ruleId = $createdJson.id
if (-not $ruleId) { throw "FAIL rule create - sin id en respuesta" }

$deleted = $false
for ($attempt = 1; $attempt -le 4; $attempt++) {
    if ($attempt -gt 1) { Start-Sleep -Seconds 2 }
    Write-Host ""
    Write-Host "== Automation rule delete (attempt $attempt, id=$ruleId) ==" -ForegroundColor Cyan
    Write-Host "DELETE $StreamApiUrl/api/automation/rules/$ruleId"
    $delCode = [int](curl.exe -s -o NUL -w "%{http_code}" -X DELETE -H "Authorization: Bearer $jwtTrim" "$StreamApiUrl/api/automation/rules/$ruleId")
    Write-Host "HTTP $delCode"
    if ($delCode -eq 200) {
        $deleted = $true
        break
    }
    if ($delCode -eq 404 -and $attempt -lt 4) {
        Write-Host "  Reintentando tras replica lag..." -ForegroundColor DarkYellow
        continue
    }
    throw "FAIL Automation rule delete HTTP $delCode"
}
Write-Host "  Regla $ruleId eliminada" -ForegroundColor DarkGray

if (-not $LiveDirector) {
    Write-Host ""
    Write-Host "OK - smoke Creator Suite SA (LiveWrite) completado." -ForegroundColor Green
    exit 0
}

$startBody = (@{ title = "Smoke director $(Get-Date -Format 'HH:mm:ss')"; platform = "twitch" } | ConvertTo-Json -Compress)
$started = Invoke-SmokeJson -Name "Director start (dual-write + outbox)" `
    -Url "$StreamApiUrl/api/director/start" `
    -Method "POST" -Headers $authHeaders -Body $startBody -ExpectCodes @(200, 201)
$sessionJson = $started.Raw | ConvertFrom-Json
$sessionId = $sessionJson.id
if (-not $sessionId) { throw "FAIL director start - sin id en respuesta" }
Write-Host "  Director session id=$sessionId status=$($sessionJson.status)" -ForegroundColor DarkGray

Invoke-SmokeJson -Name "Director active (post-start)" -Url "$StreamApiUrl/api/director/active" -Headers $authHeaders | Out-Null

if ($EndDirector) {
    Invoke-SmokeJson -Name "Director end session" `
        -Url "$StreamApiUrl/api/director/$sessionId/end" `
        -Method "POST" -Headers $authHeaders -ExpectCodes @(200) | Out-Null
    Write-Host "  Sesion $sessionId finalizada" -ForegroundColor DarkGray
} else {
    Write-Host "  Sesion $sessionId dejada activa (usa -EndDirector para cerrar)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - smoke Creator Suite SA completado." -ForegroundColor Green
Write-Host ""
Write-Host "Checklist Fase 1C:" -ForegroundColor Cyan
Write-Host "  1. DIRECTOR_READ_FROM_STREAM=true en SA API"
Write-Host "  2. AUTOMATION_READ_FROM_STREAM=true en SA API"
Write-Host "  3. LEGACY_SYNC_MODE=true en outbox worker"
Write-Host "  4. Migracion 043 aplicada (sin triggers public->stream)"
Write-Host "  5. Outbox worker -> Internal API POST /events"

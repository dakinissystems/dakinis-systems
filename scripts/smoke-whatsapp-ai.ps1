# Smoke: Core AI (copilot) + WhatsApp inbox/send (prod o local vía gateway).
param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$Phone = "34637169174",
    [string]$CoreJwt = $env:DAKINIS_CORE_JWT,
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
    [string]$AiServiceKey = $env:DAKINIS_AI_SERVICE_KEY,
    [string]$TestMessage = "Prueba Dakinis One — WhatsApp + IA $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
$CoreBase = "$BaseUrl/core/api"

function Invoke-SmokeJson {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
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
        Set-Content -Path $tmp -Value $Body -Encoding utf8NoBOM -NoNewline
        $raw = curl.exe -s -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" -X $Method @headerArgs -H "Content-Type: application/json" --data-binary "@$tmp" $Url
        Remove-Item $tmp -Force
    } else {
        $raw = curl.exe -s @headerArgs $Url
        $code = curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "WhatsApp + AI smoke — $BaseUrl" -ForegroundColor Green
Write-Host "Telefono prueba: +$Phone"

$coreHealth = Invoke-SmokeJson -Name "Core health" -Url "$CoreBase/health"
if ($coreHealth.Code -notmatch "^2") { throw "Core health FAIL" }

$wa = ($coreHealth.Raw | ConvertFrom-Json).data.whatsapp
if ($wa) {
    Write-Host ""
    Write-Host "WhatsApp Meta config: configured=$($wa.configured) phoneNumberId=$($wa.phoneNumberId)" -ForegroundColor Yellow
} else {
    Write-Host "WhatsApp: campo whatsapp no presente en health (despliega Core con whatsapp-meta.js)" -ForegroundColor Yellow
}

$aiHealth = Invoke-SmokeJson -Name "AI health" -Url "$BaseUrl/ai/health"
if ($aiHealth.Code -notmatch "^2") { throw "AI health FAIL" }
$aiJson = $aiHealth.Raw | ConvertFrom-Json
Write-Host "AI provider: $($aiJson.aiProvider)" -ForegroundColor Yellow

if ($AiServiceKey) {
    $advisorBody = @{
        userMessage = "Responde en una frase: prueba smoke copilot Core."
        context     = @{ businessId = "smoke"; businessName = "Smoke Test"; businessType = "restaurante"; plan = "pro" }
    } | ConvertTo-Json -Compress
    $adv = Invoke-SmokeJson -Name "AI core advisor (service key)" -Url "$BaseUrl/ai/v1/core/advisor" -Method "POST" `
        -Headers @{
            "Authorization"       = "Bearer $AiServiceKey"
            "X-Dakinis-Product"   = "core"
            "X-Dakinis-Business-Id" = "smoke-test"
        } -Body $advisorBody
    if ($adv.Code -notmatch "^2") {
        Write-Host "AI advisor: HTTP $($adv.Code) (revisa DAKINIS_AI_SERVICE_KEY / OPENAI_API_KEY en Railway)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Omitido AI advisor — define `$env:DAKINIS_AI_SERVICE_KEY" -ForegroundColor DarkYellow
}

if ($CoreJwt -and $BusinessId) {
    $previewBody = @{
        eventType = "order.ready"
        payload   = @{ customerName = "Ana"; orderRef = "Comanda #42"; table = "12"; businessName = "Smoke Test" }
    } | ConvertTo-Json -Compress
    $preview = Invoke-SmokeJson -Name "WhatsApp preview (tenant)" -Url "$CoreBase/v1/whatsapp/preview" -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $CoreJwt"
            "x-business-id"   = $BusinessId
        } -Body $previewBody
    if ($preview.Code -match "^2") {
        $prevJson = $preview.Raw | ConvertFrom-Json
        Write-Host "Preview OK: $($prevJson.data.message.Substring(0, [Math]::Min(60, $prevJson.data.message.Length)))..." -ForegroundColor Green
    } else {
        Write-Host "WhatsApp preview FAIL — plan Pro + ruta /v1/whatsapp/preview" -ForegroundColor Red
    }

    $sendBody = @{ phone = $Phone; message = $TestMessage } | ConvertTo-Json -Compress
    $send = Invoke-SmokeJson -Name "WhatsApp send (tenant JWT)" -Url "$CoreBase/v1/whatsapp/send" -Method "POST" `
        -Headers @{
            "Authorization"  = "Bearer $CoreJwt"
            "x-business-id"  = $BusinessId
        } -Body $sendBody
    if ($send.Code -match "^2") {
        $sendJson = $send.Raw | ConvertFrom-Json
        Write-Host "WhatsApp status: $($sendJson.data.status) provider: $($sendJson.data.provider)" -ForegroundColor Green
    } else {
        Write-Host "WhatsApp send FAIL — plan Pro requerido + JWT tenant" -ForegroundColor Red
    }

    $copilotBody = @{ question = "Cual es el estado de mi negocio hoy? Responde breve." } | ConvertTo-Json -Compress
    $cop = Invoke-SmokeJson -Name "Tenant copilot (JWT)" -Url "$CoreBase/v1/tenant/copilot" -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $CoreJwt"
            "x-business-id"   = $BusinessId
        } -Body $copilotBody
    if ($cop.Code -match "^2") {
        $copJson = $cop.Raw | ConvertFrom-Json
        $deg = $copJson.data.copilot.degraded
        Write-Host "Copilot degraded=$deg reason=$($copJson.data.copilot.degradedReason)" -ForegroundColor $(if ($deg) { "Yellow" } else { "Green" })
    }
} else {
    Write-Host ""
    Write-Host "Omitido WhatsApp send + copilot — define:" -ForegroundColor DarkYellow
    Write-Host '  $env:DAKINIS_CORE_JWT = "<token sesion Core>"'
    Write-Host '  $env:DAKINIS_BUSINESS_ID = "<uuid negocio>"'
    Write-Host "Login: core.dakinissystems.com → DevTools → token, o POST /core/api/auth/login"
}

Write-Host ""
Write-Host "Smoke terminado." -ForegroundColor Green

# Smoke AI Platform — health, chat/advisor (stub or OpenAI), Core copilot chain.
param(
    [string]$BaseUrl = "https://api.dakinissystems.com",
    [string]$AiServiceKey = $env:DAKINIS_AI_SERVICE_KEY,
    [string]$CoreJwt = $env:DAKINIS_CORE_JWT,
    [string]$BusinessId = $env:DAKINIS_BUSINESS_ID
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
$AiBase = "$BaseUrl/ai"
$CoreBase = "$BaseUrl/core/api"

function Invoke-SmokeJson {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int[]]$ExpectCodes = @(200, 201, 202)
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
    } else {
        $raw = curl.exe -s @headerArgs $Url
        $code = [int](curl.exe -s -o NUL -w "%{http_code}" @headerArgs $Url)
    }
    Write-Host "HTTP $code"
    if ($raw) {
        try { $raw | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { Write-Host $raw }
    }
    if ($ExpectCodes -notcontains $code) {
        throw "FAIL $Name (HTTP $code)"
    }
    return @{ Code = $code; Raw = $raw }
}

Write-Host "AI Platform smoke - $BaseUrl" -ForegroundColor Green

$health = Invoke-SmokeJson -Name "AI health (gateway)" -Url "$AiBase/health"
$healthJson = $health.Raw | ConvertFrom-Json
Write-Host "Provider: $($healthJson.aiProvider) | serviceKey: $($healthJson.serviceKeyConfigured) | model: $($healthJson.openaiModel)" -ForegroundColor Yellow

if ($healthJson.aiProvider -eq "stub") {
    Write-Host 'GO-LIVE: set OPENAI_API_KEY en dakinis-ai y worker, luego redeploy' -ForegroundColor DarkYellow
}

if ($AiServiceKey) {
    $chatBody = (@{
        messages = @(@{ role = "user"; content = "Responde solo: ok smoke" })
    } | ConvertTo-Json -Compress)
    $chat = Invoke-SmokeJson -Name "AI chat (service key)" -Url "$AiBase/v1/chat" -Method "POST" `
        -Headers @{
            Authorization     = "Bearer $AiServiceKey"
            "X-Dakinis-Product" = "core"
        } -Body $chatBody
    $chatJson = $chat.Raw | ConvertFrom-Json
    $chatColor = if ($chatJson.provider -eq "openai") { "Green" } else { "Yellow" }
    Write-Host "Chat provider: $($chatJson.provider)" -ForegroundColor $chatColor

    $advisorBody = (@{
        userMessage = "Responde en una frase: prueba smoke advisor."
        context     = @{ businessId = "smoke"; businessName = "Smoke"; businessType = "restaurante"; plan = "pro" }
    } | ConvertTo-Json -Compress)
    Invoke-SmokeJson -Name "AI core advisor" -Url "$AiBase/v1/core/advisor" -Method "POST" `
        -Headers @{
            Authorization       = "Bearer $AiServiceKey"
            "X-Dakinis-Product" = "core"
        } -Body $advisorBody | Out-Null
} else {
    Write-Host ""
    Write-Host 'Omitido chat/advisor - define DAKINIS_AI_SERVICE_KEY (mismo valor en dakinis-ai y Core Back)' -ForegroundColor DarkYellow
}

if ($CoreJwt -and $BusinessId) {
    $copilotBody = (@{ question = "Estado del negocio en una frase." } | ConvertTo-Json -Compress)
    $cop = Invoke-SmokeJson -Name "Core tenant copilot (JWT)" -Url "$CoreBase/v1/tenant/copilot" -Method "POST" `
        -Headers @{
            Authorization = "Bearer $CoreJwt"
            "x-business-id" = $BusinessId
        } -Body $copilotBody
    $copJson = $cop.Raw | ConvertFrom-Json
    $deg = $copJson.data.copilot.degraded
    $copColor = if ($deg) { "Yellow" } else { "Green" }
    Write-Host "Copilot degraded=$deg reason=$($copJson.data.copilot.degradedReason)" -ForegroundColor $copColor
} else {
    Write-Host ""
    Write-Host "Omitido Core copilot - define DAKINIS_CORE_JWT + DAKINIS_BUSINESS_ID" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "OK - AI smoke complete" -ForegroundColor Green

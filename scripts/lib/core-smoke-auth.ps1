# Shared Core smoke auth — login con email/password si no hay JWT en env.
function Get-CoreSmokeAuth {
    param(
        [string]$CoreBase = "https://api.dakinissystems.com/core/api",
        [string]$CoreJwt = $env:DAKINIS_CORE_JWT,
        [string]$BusinessId = $env:DAKINIS_BUSINESS_ID,
        [string]$Email = $env:DAKINIS_TEST_EMAIL,
        [string]$Password = $env:DAKINIS_TEST_PASSWORD
    )

    if ($CoreJwt -and $BusinessId) {
        return @{ Jwt = $CoreJwt; BusinessId = $BusinessId; Source = "env" }
    }
    if ($CoreJwt -and -not $BusinessId) {
        return @{ Jwt = $CoreJwt; BusinessId = $null; Source = "env-jwt-only" }
    }
    if (-not $Email -or -not $Password) {
        return $null
    }

    $CoreBase = $CoreBase.TrimEnd("/")
    $body = (@{ email = $Email; password = $Password } | ConvertTo-Json -Compress)
    $tmp = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
    $raw = curl.exe -s -X POST -H "Content-Type: application/json" --data-binary "@$tmp" "$CoreBase/auth/login"
    Remove-Item $tmp -Force
    $json = $raw | ConvertFrom-Json
    if (-not $json.ok) {
        Write-Host "WARN Core login failed with DAKINIS_TEST_* (IdP creds may differ from Core): $($json.error.message)" -ForegroundColor Yellow
        return $null
    }
    $bid = $json.meta.businessId
    if (-not $bid) { $bid = $json.data.business.id }
    return @{
        Jwt        = $json.data.token
        BusinessId = $bid
        Source     = "login"
    }
}

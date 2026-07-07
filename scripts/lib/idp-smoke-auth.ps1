# Shared IdP smoke auth — login platform/auth for Hub SSO and notifications inbox.
function Get-JwtPayload {
    param([string]$Jwt)
    $parts = $Jwt.Split(".")
    if ($parts.Count -lt 2) { return $null }
    $payload = $parts[1]
    $mod = $payload.Length % 4
    if ($mod -gt 0) { $payload += ("=" * (4 - $mod)) }
    $payload = $payload.Replace("-", "+").Replace("_", "/")
    try {
        $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
        return $json | ConvertFrom-Json
    } catch {
        return $null
    }
}

function Get-IdpSmokeAuth {
    param(
        [string]$AuthUrl = $env:DAKINIS_AUTH_URL,
        [string]$Email = $env:DAKINIS_TEST_EMAIL,
        [string]$Password = $env:DAKINIS_TEST_PASSWORD,
        [string]$Token = $env:DAKINIS_IDP_TOKEN
    )

    if (-not $AuthUrl) { $AuthUrl = "https://auth.dakinissystems.com/auth" }
    $AuthUrl = $AuthUrl.TrimEnd("/")

    if ($Token) {
        $claims = Get-JwtPayload -Jwt $Token
        $userId = $claims.sub
        if (-not $userId) { $userId = $claims.userId }
        return @{
            Token  = $Token
            UserId = $userId
            Email  = $claims.email
            Source = "env-token"
        }
    }

    if (-not $Email -or -not $Password) {
        return $null
    }

    $body = (@{ email = $Email; password = $Password } | ConvertTo-Json -Compress)
    $tmp = New-TemporaryFile
    [System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
    $raw = curl.exe -s -X POST -H "Content-Type: application/json" --data-binary "@$tmp" "$AuthUrl/login"
    Remove-Item $tmp -Force

    $json = $raw | ConvertFrom-Json
    $token = $json.token
    if (-not $token) { $token = $json.accessToken }
    if (-not $token) {
        throw "IdP login failed: no token in response"
    }

    $userId = $null
    if ($json.user) {
        $userId = $json.user.id
        if (-not $userId) { $userId = $json.user.sub }
    }
    if (-not $userId) {
        $claims = Get-JwtPayload -Jwt $token
        if ($claims) {
            $userId = $claims.sub
            if (-not $userId) { $userId = $claims.userId }
        }
    }

    return @{
        Token  = $token
        UserId = $userId
        Email  = if ($json.user.email) { $json.user.email } else { $Email }
        Source = "login"
    }
}

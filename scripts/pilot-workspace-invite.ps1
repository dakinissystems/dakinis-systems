# Pilot checklist: create workspace invite + print accept URL.
# Requires Internal API service key and an existing workspace id.
param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspaceId,
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$Role = "member",
    [string]$InvitedBy = $env:DAKINIS_TEST_USER_ID,
    [string]$InternalUrl = $env:DAKINIS_INTERNAL_URL,
    [string]$ServiceKey = $env:DAKINIS_INTERNAL_SERVICE_KEY,
    [string]$HubUrl = "https://hub.dakinissystems.com"
)

$ErrorActionPreference = "Stop"

if (-not $InternalUrl) { $InternalUrl = "https://api.dakinissystems.com/internal" }
if (-not $ServiceKey) { throw "DAKINIS_INTERNAL_SERVICE_KEY required" }

$base = $InternalUrl.TrimEnd("/")
$url = "$base/workspaces/$WorkspaceId/members/invite"
$body = @{
    email = $Email.Trim().ToLower()
    role = $Role
}
if ($InvitedBy) { $body.invitedBy = $InvitedBy }

Write-Host "POST $url" -ForegroundColor Cyan
$json = $body | ConvertTo-Json -Compress
$res = Invoke-RestMethod -Uri $url -Method POST `
    -Headers @{ Authorization = "Bearer $ServiceKey" } `
    -ContentType "application/json" `
    -Body $json

$token = $res.invite.token
if (-not $token) {
    Write-Host ($res | ConvertTo-Json -Depth 6)
    throw "Invite response missing token"
}

$accept = "$($HubUrl.TrimEnd('/'))/invite/$token"
Write-Host ""
Write-Host "created=$($res.created) email=$($res.invite.email) role=$($res.invite.role)" -ForegroundColor Green
Write-Host "Accept URL:" -ForegroundColor Green
Write-Host $accept
Write-Host ""
Write-Host "Checklist piloto:" -ForegroundColor Yellow
Write-Host "1. Abrir Accept URL con el usuario invitado (mismo email IdP)"
Write-Host "2. Confirmar miembro active en Hub Admin > Members"
Write-Host "3. Abrir Hub Mi dia y verificar widgets (>=2 productos)"
Write-Host "4. Lanzar SA / AkoeNet / LifeFlow via Hub SSO"

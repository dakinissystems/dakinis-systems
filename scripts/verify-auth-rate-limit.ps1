# Comprueba el límite de login. No marca el control como verificado.
# Uso: .\scripts\verify-auth-rate-limit.ps1 -BaseUrl http://127.0.0.1:3000
param(
  [string]$BaseUrl = "http://127.0.0.1:3000"
)

$uri = ($BaseUrl.TrimEnd("/")) + "/auth/login"
$body = '{"email":"rate-limit-probe@example.com","password":"incorrect-probe"}'
$statuses = @()
1..12 | ForEach-Object {
  try {
    $resp = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $statuses += [int]$resp.StatusCode
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code) { $statuses += [int]$code } else { $statuses += "error" }
  }
}
Write-Output ("statuses=" + ($statuses -join ","))
Write-Output "Esperado tras desplegar: 429 antes de la petición 12. Guarda esta salida en docs/evidence/ si el entorno era el que dice el runbook."

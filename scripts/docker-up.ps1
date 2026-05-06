# Levanta todo el stack Docker desde la raíz del ecosistema (D:\dakinis-systems).
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "docker")
docker compose up --build @args

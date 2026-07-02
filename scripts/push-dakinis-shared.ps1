# Publica mirror packages/ -> repo dakinis-shared
# Uso: .\scripts\push-dakinis-shared.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "packages"
$dest = Join-Path (Split-Path $root -Parent) "dakinis-shared"
$remote = "https://github.com/dakinissystems/dakinis-shared.git"
$exclude = @("node_modules", ".git")

function Copy-Tree($from, $to) {
    New-Item -ItemType Directory -Force -Path $to | Out-Null
    Get-ChildItem -LiteralPath $from -Force | ForEach-Object {
        if ($exclude -contains $_.Name) { return }
        $target = Join-Path $to $_.Name
        if ($_.PSIsContainer) { Copy-Tree $_.FullName $target }
        else { Copy-Item -LiteralPath $_.FullName -Destination $target -Force }
    }
}

Write-Host "Sync $src -> $dest" -ForegroundColor Cyan
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Tree $src $dest

Copy-Item (Join-Path $root "docs\templates\README-dakinis-shared.md") (Join-Path $dest "README.md") -Force
Copy-Item (Join-Path $root "scripts\dakinis-shared-package.json") (Join-Path $dest "package.json") -Force
Copy-Item (Join-Path $src ".gitignore") (Join-Path $dest ".gitignore") -Force

Push-Location $dest
if (-not (Test-Path ".git")) { git init -b main | Out-Null }
$hasOrigin = git remote 2>$null | Select-String -Pattern "^origin$"
if ($hasOrigin) { git remote remove origin }
git remote add origin $remote
git add -A
$status = git status --porcelain
if ($status) { git commit -m "DES monorepo sync from dakinis-systems/packages" }
git push -u origin main --force
Pop-Location

Write-Host "OK dakinis-shared -> $remote" -ForegroundColor Green

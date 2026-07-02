# Publica el scaffolding inicial en los repos platform de GitHub.
# Requiere: git, acceso push a dakinissystems/*
# Uso: .\scripts\push-platform-scaffolds.ps1
#      .\scripts\push-platform-scaffolds.ps1 -Repo billing   # solo uno

param(
    [ValidateSet("all", "billing", "notifications", "search")]
    [string]$Repo = "all"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$map = @{
    billing = @{
        dir = Join-Path $root "billing"
        remote = "https://github.com/dakinissystems/dakinis-billing.git"
        message = "Initial billing platform scaffold"
    }
    notifications = @{
        dir = Join-Path $root "notifications"
        remote = "https://github.com/dakinissystems/dakinis-notifications.git"
        message = "Initial notifications platform scaffold"
    }
    search = @{
        dir = Join-Path $root "search"
        remote = "https://github.com/dakinissystems/dakinis-search.git"
        message = "Initial search platform scaffold"
    }
}

function Push-Scaffold($name, $cfg) {
    $dir = $cfg.dir
    if (-not (Test-Path $dir)) {
        Write-Warning "SKIP $name — no existe $dir"
        return
    }

    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    Push-Location $dir

    if (-not (Test-Path ".git")) {
        git init -b main
    }

    $remotes = git remote 2>$null
    if ($remotes -notcontains "origin") {
        git remote add origin $cfg.remote
    } else {
        git remote set-url origin $cfg.remote
    }

    git add -A
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "Nothing to commit in $name"
    } else {
        git commit -m $cfg.message
    }

    git push -u origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Push failed for $name — verify repo exists and you have access"
    } else {
        Write-Host "OK $name -> $($cfg.remote)" -ForegroundColor Green
    }

    Pop-Location
}

$targets = if ($Repo -eq "all") { @("billing", "notifications", "search") } else { @($Repo) }

foreach ($name in $targets) {
    Push-Scaffold $name $map[$name]
}

Write-Host "`nDone. Repos:" -ForegroundColor Green
Write-Host "  https://github.com/dakinissystems/dakinis-billing"
Write-Host "  https://github.com/dakinissystems/dakinis-notifications"
Write-Host "  https://github.com/dakinissystems/dakinis-search"

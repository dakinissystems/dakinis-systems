# Publica scaffolding en repos platform (git aislado por carpeta).
# Uso: .\scripts\push-platform-scaffolds.ps1
#      .\scripts\push-platform-scaffolds.ps1 -Repo billing

param(
    [ValidateSet("all", "billing", "notifications", "search", "internal")]
    [string]$Repo = "all"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$map = @{
    billing = @{
        dir = Join-Path $root "billing"
        remote = "https://github.com/dakinissystems/dakinis-billing.git"
        message = "Platform billing scaffold"
    }
    notifications = @{
        dir = Join-Path $root "notifications"
        remote = "https://github.com/dakinissystems/dakinis-notifications.git"
        message = "Platform notifications scaffold"
    }
    search = @{
        dir = Join-Path $root "search"
        remote = "https://github.com/dakinissystems/dakinis-search.git"
        message = "Platform search scaffold"
    }
    internal = @{
        dir = Join-Path $root "internal"
        remote = "https://github.com/dakinissystems/dakinis-internal-api.git"
        message = "Platform internal API scaffold"
    }
}

function Push-Scaffold($name, $cfg) {
    $dir = $cfg.dir
    if (-not (Test-Path $dir)) {
        Write-Warning "SKIP $name - folder missing: $dir"
        return
    }

    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    Push-Location $dir

    $gitDir = Join-Path $dir ".git"
    if (-not (Test-Path $gitDir)) {
        git init -b main | Out-Null
    }

    $top = (Resolve-Path (git rev-parse --show-toplevel)).Path
    $dirResolved = (Resolve-Path $dir).Path
    if ($top.ToLower() -ne $dirResolved.ToLower()) {
        throw "Git toplevel wrong for ${name}: ${top} (expected ${dirResolved})"
    }

    if (git remote 2>$null | Select-String -Pattern "^origin$") {
        git remote remove origin
    }
    git remote add origin $cfg.remote

    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m $cfg.message
    }

    $files = (git ls-files | Measure-Object -Line).Lines
    if ($files -lt 5) {
        throw "Repo ${name} has only ${files} files - aborting incomplete push"
    }

    Write-Host "Files tracked: $files"
    git push -u origin main --force
    if ($LASTEXITCODE -ne 0) {
        throw "Push failed for ${name}"
    }
    Write-Host "OK ${name} -> $($cfg.remote)" -ForegroundColor Green

    Pop-Location
}

$targets = if ($Repo -eq "all") { @("billing", "notifications", "search", "internal") } else { @($Repo) }

foreach ($name in $targets) {
    Push-Scaffold $name $map[$name]
}

Write-Host "`nDone. Verify GitHub has package.json + Dockerfile + src/ (not README only)." -ForegroundColor Green

# Clone platform services (auth, core, ai) into platform/
# Usage: .\scripts\clone-platform.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Base = Join-Path $Root "platform"

$Repos = @(
  @{ Name = "auth"; Remote = "https://github.com/dakinissystems/dakinis-auth.git" },
  @{ Name = "core"; Remote = "https://github.com/dakinissystems/dakinis-core.git" },
  @{ Name = "ai"; Remote = "https://github.com/dakinissystems/dakinis-ai.git" }
)

New-Item -ItemType Directory -Force -Path $Base | Out-Null

foreach ($repo in $Repos) {
  $dest = Join-Path $Base $repo.Name
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "OK $($repo.Name) - already cloned: $dest"
    continue
  }
  if (Test-Path $dest) {
    $items = Get-ChildItem $dest -Force
    if ($items.Count -gt 0) {
      Write-Error "Abort: $dest exists but is not a git repo."
    }
  }
  Write-Host "Cloning $($repo.Remote) -> $dest"
  git clone $repo.Remote $dest
}

Write-Host ""
Write-Host "Platform clones under platform/{auth,core,ai}"

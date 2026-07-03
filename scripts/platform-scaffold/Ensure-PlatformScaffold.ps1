# Idempotent platform service layout for dakinis-* repos.
# Dot-source from push-platform-scaffolds.ps1 or run standalone:
#   . .\scripts\platform-scaffold\Ensure-PlatformScaffold.ps1
#   Ensure-PlatformScaffold -ServiceDir D:\dakinis-systems\knowledge -Config @{ ... }

function Ensure-PlatformScaffold {
    param(
        [Parameter(Mandatory)]
        [string]$ServiceDir,
        [Parameter(Mandatory)]
        [hashtable]$Config
    )

    $name = $Config.Name
    $port = $Config.Port
    $desc = $Config.Description
    $hasWorker = [bool]$Config.HasWorker
    $githubDesc = $Config.GithubDescription

    if (-not (Test-Path $ServiceDir)) {
        New-Item -ItemType Directory -Path $ServiceDir -Force | Out-Null
    }

    $dirs = @(
        "api/controllers", "api/routes", "api/services", "api/repositories",
        "api/providers", "api/embeddings", "api/ingestion", "api/search", "api/rag", "api/storage",
        "workers/embeddings", "workers/ocr", "workers/pdf", "workers/cleanup", "workers/sync",
        "packages", "docs", "tests", ".github/workflows"
    )
    foreach ($rel in $dirs) {
        $p = Join-Path $ServiceDir $rel
        if (-not (Test-Path $p)) {
            New-Item -ItemType Directory -Path $p -Force | Out-Null
        }
    }

    function Write-IfMissing($relPath, $content) {
        $full = Join-Path $ServiceDir $relPath
        if (-not (Test-Path $full)) {
            $parent = Split-Path $full -Parent
            if ($parent -and -not (Test-Path $parent)) {
                New-Item -ItemType Directory -Path $parent -Force | Out-Null
            }
            Set-Content -Path $full -Value $content -Encoding utf8NoBOM
            Write-Host "  + $relPath" -ForegroundColor DarkGray
        }
    }

    Write-Host "Scaffold $name ($ServiceDir)" -ForegroundColor Cyan

    Write-IfMissing ".editorconfig" @"
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
"@

    Write-IfMissing ".nvmrc" "20`n"

    Write-IfMissing ".gitignore" @"
node_modules/
.env
.env.local
*.log
.DS_Store
dist/
coverage/
"@

    Write-IfMissing "packages/README.md" @"
# Packages

Shared libraries for ``$name`` (types, clients, constants). Empty until extracted from ``api/``.
"@

    Write-IfMissing "docs/README.md" @"
# $name — docs

- [architecture.md](./architecture.md) — layout and integrations
- [railway.md](./railway.md) — deploy (API + worker)
- [env.md](./env.md) — environment variables
"@

    Write-IfMissing "docs/architecture.md" @"
# $name — architecture

Standard Dakinis platform layout:

``````
$name/
├── api/          HTTP service
├── workers/      background jobs (Redis)
├── packages/     shared code
├── docs/
└── tests/
``````

**Port:** $port · **Gateway prefix:** ``/$($Config.GatewayPrefix)``

Consumers: Core, AI, Hub, Search, LifeFlow (via gateway or internal API).
"@

    Write-IfMissing "docs/railway.md" @"
# Railway — $name

## API service

- Repo root · Dockerfile · ``PORT=$port``
- Health: ``/health``
- Domain (target): ``$($Config.Domain)``

## Worker service (if applicable)

- Same repo · ``npm run worker`` · no public domain
- ``REDIS_URL`` required
"@

    Write-IfMissing "docs/env.md" @"
# Environment — $name

| Variable | Required | Notes |
|----------|----------|-------|
| ``PORT`` | API | Default ``$port`` |
| ``REDIS_URL`` | Worker / queues | Railway Redis plugin |
| ``DATABASE_URL`` | When persisting | Supabase pooler 6543 |
| ``DAKINIS_INTERNAL_SERVICE_KEY`` | S2S | Same as other platform services |
"@

    Write-IfMissing "tests/README.md" @"
# Tests

Add smoke and integration tests here. Run via CI on push.
"@

    Write-IfMissing ".github/workflows/ci.yml" @"
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci || npm install
      - run: node --check api/server.js 2>/dev/null || node --check src/server.js 2>/dev/null || echo "no entry yet"
"@

    $compose = @"
# Local dev — API + worker (platform standard)
services:
  ${name}-api:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      PORT: "${port}"
      NODE_ENV: development
    env_file:
      - .env
    command: npm run start:api

"@ 
    if ($hasWorker) {
        $compose += @"
  ${name}-worker:
    build: .
    environment:
      NODE_ENV: development
      WORKER_MODE: "true"
    env_file:
      - .env
    command: npm run worker
    depends_on:
      - ${name}-api

"@
    }
    Write-IfMissing "docker-compose.yml" $compose

    Write-IfMissing "railway.toml" @"
# Railway — API service (repo root)
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"
watchPatterns = ["api/**", "workers/**", "package.json", "Dockerfile"]

[deploy]
startCommand = "npm run start:api"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
"@

    if ($hasWorker) {
        Write-IfMissing "railway.worker.toml" @"
# Railway — Worker service (second Railway service, same repo)
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npm run worker"
restartPolicyType = "ON_FAILURE"
"@
    }

    if ($Config.LegacySrc -and (Test-Path (Join-Path $ServiceDir $Config.LegacySrc))) {
        Write-IfMissing "docs/MIGRATION.md" @"
# Migration to ``api/`` layout

This repo still uses ``$($Config.LegacySrc)/`` from the first scaffold.

**Target:** move HTTP handlers to ``api/``, workers to ``workers/``, keep behavior unchanged.

See ``dakinis-knowledge`` for the reference layout.
"@
    }

    if ($githubDesc) {
        Write-IfMissing "docs/GITHUB-DESCRIPTION.txt" "$githubDesc`n"
    }
}

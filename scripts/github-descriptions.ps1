# Aplica descripciones canónicas a repos dakinissystems (requiere gh CLI).
# Uso: .\scripts\github-descriptions.ps1
# Ver docs/GITHUB-ORG.md

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) no instalado. Instalar: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "Descripciones canónicas en docs/GITHUB-ORG.md"
    exit 1
}

$repos = @{
    "dakinissystems/dakinis-systems"      = "Control repo — API gateway, contracts, legal, SQL schemas for the Dakinis ecosystem."
    "dakinissystems/dakinis-shared"       = "Dakinis Experience System (DES) — monorepo of shared UI packages, tokens, AppShell, SDK."
    "dakinissystems/dakinis-core"         = "Multi-tenant Business Operating System (BOS) — CRM, inventory, restaurant, AI Copilot and business modules."
    "dakinissystems/dakinis-hub"          = "Unified application shell, launcher and cross-product workspace for the Dakinis ecosystem."
    "dakinissystems/dakinis-ai"           = "Shared AI platform — agents, RAG, chat gateway for all Dakinis products."
    "dakinissystems/dakinis-auth"         = "Central authentication service — JWT, multi-tenant identity for the Dakinis platform."
    "dakinissystems/dakinis-landing"      = "Corporate website and acquisition funnel for the Dakinis Systems ecosystem."
    "dakinissystems/lifeflow"             = "Personal finance platform — 90-day financial radar and LifeFlow Score."
    "dakinissystems/dakinis-streamautomator" = "Social streaming scheduler — Twitch, X, Instagram and Discord automation."
    "dakinissystems/akoenet-backend"      = "Real-time communication platform — API, WebRTC, Socket.IO backend."
    "dakinissystems/akoenet-client"       = "Real-time communication platform — web, desktop and mobile clients."
    "dakinissystems/dakinis-tabletop"     = "Modern tabletop RPG platform — D&D 5e sheets, combat and shared campaigns."
    "dakinissystems/dakinis-billing"      = "Platform billing service — Stripe subscriptions, plans, invoices and usage metering."
    "dakinissystems/dakinis-notifications" = "Cross-product notifications platform — email, push, in-app inbox and webhooks."
    "dakinissystems/dakinis-search"       = "Global search platform — Hub Ctrl+K and cross-product index API."
    "dakinissystems/dakinis-knowledge"    = "Knowledge platform for Dakinis Systems with document ingestion, RAG and semantic search."
    "dakinissystems/dakinis-internal-api" = "Internal API gateway for Dakinis platform services — service-to-service proxy."
}

foreach ($entry in $repos.GetEnumerator()) {
    $repo = $entry.Key
    $desc = $entry.Value
    Write-Host "Updating $repo ..."
    gh repo edit $repo --description $desc
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed: $repo (check org access or repo name)"
    }
}

Write-Host "Done. Verify at https://github.com/dakinissystems" -ForegroundColor Green

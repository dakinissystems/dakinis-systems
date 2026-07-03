# Platform service scaffold

Idempotent layout generator for `dakinis-billing`, `dakinis-notifications`, `dakinis-search`, `dakinis-knowledge`, `dakinis-internal-api`.

## Standard layout

```
service/
├── api/          controllers, routes, services, repositories, …
├── workers/      embeddings, ocr, pdf, cleanup, sync
├── packages/
├── docs/
├── tests/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
├── railway.toml
├── railway.worker.toml   (if HasWorker)
├── .editorconfig
├── .nvmrc
└── package.json
```

## Usage

```powershell
# Apply scaffold + push all platform mirrors
.\scripts\push-platform-scaffolds.ps1

# One repo
.\scripts\push-platform-scaffolds.ps1 -Repo knowledge

# Only create missing dirs/files locally (no git)
.\scripts\push-platform-scaffolds.ps1 -ScaffoldOnly -Repo search
```

Reference implementation: **`knowledge/`** (full `api/` + `workers/` migration).

Legacy repos still on `src/` get `docs/MIGRATION.md` until migrated.

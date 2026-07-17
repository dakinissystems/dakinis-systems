# Workspace hygiene (Dakinis control repo)

Product repos (`finanzas/`, `hub/`, `apps/akoenet/Client`, etc.) are **local clones** — not committed in this repo. Use sync scripts and clone helpers below.

## Clone product repos

```powershell
.\scripts\clone-akoenet.ps1      # apps/akoenet/{Client,Server}
.\scripts\clone-hub.ps1          # hub/
.\scripts\clone-finanzas.ps1     # finanzas/ (lifeflow)
.\scripts\clone-platform.ps1     # platform/{auth,core,ai}
```

## Sync canonical packages → vendored copies

| Script | Packages | Destinations |
|--------|----------|--------------|
| `node scripts/sync-des-packages.mjs` | shared-brand, shared-layouts | landing, core, finanzas, hub |
| `node scripts/sync-experience.mjs` | shared-ux, shared-loading, shared-icons, shared-illustrations | core, finanzas, hub |
| `node scripts/sync-shared-brand.mjs` | shared-brand (subset) | same as DES |
| `node scripts/sync-shared-ai.mjs` | shared-ai | internal, billing, search, notifications |
| `node scripts/sync-hub-des.ps1` | brand, layouts, ux | hub/packages only |
| **`node scripts/sync-all-packages.mjs`** | **all of the above** | — |

Verify no drift before push:

```powershell
node scripts/verify-package-drift.mjs
```

Do not hand-edit vendored copies under `*/packages/` — change `packages/` and sync.

## AkoeNet desktop signing & web download

See `apps/akoenet/Client/docs/DESKTOP-UPDATER.md`.

```powershell
cd apps\akoenet\Client
npm run release:desktop   # Windows only — Tauri .exe
npm run build:deploy      # dist/ + verify PE installer
npm run cleanup           # remove target/, nested src-tauri/, Gradle junk
```

Railway uses `build:ci`; commit `public/releases/desktop/*.exe` for current version so deploy copies into `dist/`.

## Hub canonical frontend

**Production:** root `hub/src/` (Dockerfile). **`hub/web/` is deprecated** — do not deploy.

## Safe local cleanup (AkoeNet Client)

```powershell
cd apps\akoenet\Client
npm run cleanup
```

Also safe to delete empty: `hub/src/server/`, `docs/knowledge/{core,legal,lifeflow}/`.

## Never commit

- `src-tauri/*-signer.key` (Tauri updater private key)
- `.env` with secrets
- `docker/.env*`

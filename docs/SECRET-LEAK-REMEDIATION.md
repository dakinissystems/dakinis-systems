# Remediation — secretos detectados por Gitleaks (historial)

Gitleaks escanea **todo el historial** (`fetch-depth: 0`). Un `.env` borrado de `HEAD` sigue fallando el job.

## Ruta de scripts Cloudflare (monorepo)

Los scripts **no** están en `platform/core`. Desde la raíz del monorepo:

```powershell
cd D:\dakinis-systems
# Preferible worktree actualizado / tras merge de PR #11:
# cd D:\dakinis-systems-wt-ops

$env:CLOUDFLARE_API_TOKEN = "<Zone WAF Write>"
node scripts\configure-cloudflare-health-skip.mjs
node scripts\configure-cloudflare-api-rate-limit.mjs
```

## Triage 25 jul 2026

| Repo | Hallazgo | Tipo | Acción |
|------|----------|------|--------|
| **akoenet-backend** | `.env` en commit inicial (GCP key, Twitch, JWT, Resend, …) | **Real** (historial) | Rotar todo + `git filter-repo --path .env --invert-paths` + force-push |
| **dakinis-streamautomator** | `ENCRYPTION_KEY=tu-…` en guía Render | Placeholder ES | Allowlist `tu-…` |
| **dakinis-streamautomator** | Twitch `clientId` hardcodeado en `backend/src/config/config.ts` (historial) | **Real / legado** | Rotar client secret en Twitch; purgar fallback del historial |
| **dakinis-streamautomator** | `DATABASE_URL` con credenciales en guía antigua (historial) | **Real si sigue viva** | Rotar password Supabase/pooler |
| **dakinis-core** | `TEMP_PASSWORD_CHARS` (alfabeto) | FP | Allowlist alfabeto |
| **dakinis-core** | `x-api-key: dakinis-dev-key` en `API_READY.md` | Dev sample | Allowlist path + `dakinis-*-key` |

## Rotación obligatoria (akoenet-backend)

Tras el leak en historial público/privado de GitHub, **asumir comprometido**:

1. Google Cloud — invalidar la service account key del `.env`
2. Twitch — rotar Client Secret (y revisar Client ID)
3. Resend — rotar API key
4. `JWT_SECRET` — generar nuevo + redeploy (invalida sesiones)
5. Cualquier otra clave del mismo `.env`

Luego purgar historial (ver abajo) y redeploy Railway.

## Purga de historial (akoenet)

```powershell
cd D:\dakinis-systems\apps\akoenet\Server
# Backup branch
git branch backup/pre-env-purge

# Requiere: pip install git-filter-repo
git filter-repo --path .env --invert-paths --force
git remote add origin https://github.com/dakinissystems/akoenet-backend.git
git push --force --all
git push --force --tags
```

Avisar a quien tenga clones: re-clone o `git fetch` + reset duro a `origin/main`.

## Allowlist canónica

Actualizar desde monorepo: `node scripts/sync-gitleaks-workflow.mjs` (copia `.gitleaks.toml` a los checkouts locales).

# Remediation — secretos detectados por Gitleaks

Gitleaks escanea historial (`fetch-depth: 0`). Un `.env` borrado de `HEAD` puede seguir fallando el job si el historial no se purga.

## 1. Rotar secretos

Asumir comprometido todo lo que apareció en el leak:

1. Invalidar keys en el proveedor (GCP, Twitch, Resend, Stripe, etc.)
2. Regenerar `JWT_SECRET` / service keys → redeploy (invalida sesiones)
3. Rotar passwords de DB / pooler si salieron en docs o historial

## 2. Purgar historial

Ejemplo (archivo `.env` en un repo de producto):

```powershell
cd <repo>
git branch backup/pre-env-purge
# pip install git-filter-repo
git filter-repo --path .env --invert-paths --force
git remote add origin <url-github>
git push --force --all
git push --force --tags
```

Avisar a quien tenga clones: re-clone o reset duro a `origin/main`.

## 3. Sync allowlist

Desde monorepo:

```powershell
node scripts/sync-gitleaks-workflow.mjs
```

Copia `.gitleaks.toml` a los checkouts locales. Allowlist **no** sustituye rotación + purge de secretos reales.

## 4. CI — escanear solo HEAD (tras purge)

Si el job sigue viendo refs antiguas (PRs / branches muertas):

```yaml
args: --verbose --redact --exit-code=1 --log-opts=HEAD
```

Plantilla: [`templates/gitleaks.yml`](./templates/gitleaks.yml).

## Scripts Cloudflare (monorepo)

Desde la raíz del monorepo (no `platform/core`):

```powershell
$env:CLOUDFLARE_API_TOKEN = "<Zone WAF Write>"
node scripts\configure-cloudflare-health-skip.mjs
node scripts\configure-cloudflare-api-rate-limit.mjs
```

Seguridad operativa → [`SECURITY.md`](./SECURITY.md).

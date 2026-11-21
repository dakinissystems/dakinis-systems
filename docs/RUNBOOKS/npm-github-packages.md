# GitHub Packages — `@dakinissystems/*`

Registry privado para packages del meta (`packages/`).

**Scope = org GitHub** (`dakinissystems`). `GITHUB_TOKEN` del repo **no** puede publicar `@dakinis/*` (esa instalación no existe) → error `The requested installation does not exist`.

**Ola 1 publicada (17):** `shared-error`, `shared-validation`, `domain`, `shared-loading`, `shared-db`, `shared-auth`, `shared-ai`, `shared-platform`, `shared-feature-flags`, `shared-brand`, `shared-icons`, `sdk-metrics`, `sdk-auth`, `sdk-billing`, `sdk-events`, `sdk-workspace`, `sdk`.  
Smoke: workflow **Packages install smoke**.

**DES ola 2b:** façades preparadas (`shared-illustrations`, `shared-ux`, `shared-layouts`, `shared-des`, `shared-charts`, `design-system`, `design-audit`) — imports de paquete + `file:` local; publish tras merge en orden: illustrations → ux → layouts → des → charts → design-system → design-audit.  
**Fuera del registry global:** `akoenet-*` (K-07).

## Auth lectura (CI + Railway + local)

1. PAT con **`read:packages`** (y `repo` si el paquete es privado) — obligatorio en **Railway**.
2. En Actions, el smoke usa `secrets.NODE_AUTH_TOKEN` o, si falta, `github.token` (`packages: read`).
3. Secreto (nunca en Git):

| Sitio | Nombre | Uso |
|-------|--------|-----|
| GitHub Actions | `NODE_AUTH_TOKEN` (opcional) | override del token de lectura |
| Railway | `NODE_AUTH_TOKEN` | build/install |

3. `.npmrc` del consumer:

```ini
@dakinissystems:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Plantilla: [`packages/.npmrc.example`](../../packages/.npmrc.example).

## Auth escritura (publish)

- Actions con `permissions: packages: write` y `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- Workflow: [`.github/workflows/publish-dakinis-package.yml`](../../.github/workflows/publish-dakinis-package.yml).
- Tags: `<dir>-v*` (p. ej. `shared-validation-v0.1.0`).

No uses el token de publish en Railway.

## Publicar un paquete

1. Preparar metadata (o script):

```powershell
node scripts/prepare-dakinissystems-package.mjs <dir> [<dir>...]
```

2. Merge a `main`.
3. Actions → **Publish Dakinis package** → `package=<dir>`.
4. Comprobar en GitHub → Packages (org `dakinissystems`).

Install smoke (opcional): workflow **Packages install smoke** (usa secreto `NODE_AUTH_TOKEN`).

## Consumers

- **Piloto:** `apps/landing` → `@dakinissystems/shared-brand@1.0.1` (`.npmrc` + job CI `landing-registry-consumer`).
- Migración gradual. LifeFlow packages locales **intactos** hasta que consuman registry.
- K-08 solo tras publish SemVer + install CI/Railway + diff exports OK.
- Railway: PAT `read:packages` como `NODE_AUTH_TOKEN` (ver ops `tmp/K-consumer-railway-checklist.md`).

## Troubleshooting

| Síntoma | Qué mirar |
|---------|-----------|
| `installation does not exist` | Scope ≠ org (`@dakinis` vs `@dakinissystems`) |
| 401/403 install | PAT sin `read:packages` o `.npmrc` mal |
| 403 publish | Job sin `packages: write` |
| Package not found | Aún no publicado o nombre/versión incorrectos |

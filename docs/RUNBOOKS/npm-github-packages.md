# GitHub Packages — `@dakinissystems/*`

Registry privado para packages del meta (`packages/`).

**Scope = org GitHub** (`dakinissystems`). `GITHUB_TOKEN` del repo **no** puede publicar `@dakinis/*` (esa instalación no existe) → error `The requested installation does not exist`.

Piloto: `@dakinissystems/shared-error` · siguiente: `@dakinissystems/shared-validation`.

## Auth lectura (CI + Railway + local)

1. PAT con **`read:packages`** (y `repo` si el paquete es privado).
2. Secreto (nunca en Git):

| Sitio | Nombre | Uso |
|-------|--------|-----|
| GitHub Actions | `NODE_AUTH_TOKEN` | install de consumers |
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

1. `package.json`: `"name": "@dakinissystems/<pkg>"`, sin `private`, con `publishConfig` + `files` + `repository.directory`.
2. Merge a `main`.
3. Actions → **Publish Dakinis package** → `package=<dir>`.
4. Comprobar en GitHub → Packages (org `dakinissystems`).

## Consumers

- Migración gradual. LifeFlow packages locales **intactos** hasta que consuman registry.
- K-08 solo tras publish SemVer + install CI/Railway + diff exports OK.

## Troubleshooting

| Síntoma | Qué mirar |
|---------|-----------|
| `installation does not exist` | Scope ≠ org (`@dakinis` vs `@dakinissystems`) |
| 401/403 install | PAT sin `read:packages` o `.npmrc` mal |
| 403 publish | Job sin `packages: write` |
| Package not found | Aún no publicado o nombre/versión incorrectos |

# GitHub Packages — `@dakinis/*`

Registry privado para packages del meta (`packages/`). Piloto: `@dakinis/shared-error@0.1.0` (PR #71).

## Auth lectura (CI + Railway + local)

1. GitHub → Developer settings → **Fine-grained** o classic PAT con **`read:packages`** (y `repo` si el paquete es privado ligado al repo).
2. Guardar el valor **solo** como secreto (nunca en Git):

| Sitio | Nombre del secreto | Uso |
|-------|--------------------|-----|
| GitHub Actions (org o repo) | `NODE_AUTH_TOKEN` | `npm ci` / `npm install` de consumers |
| Railway (servicio consumer) | `NODE_AUTH_TOKEN` | build/install en imagen |

3. En el consumer, `.npmrc` (o step de CI):

```ini
@dakinis:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Plantilla: [`packages/.npmrc.example`](../../packages/.npmrc.example).

## Auth escritura (publish)

- Preferir **GitHub Actions** con `permissions: packages: write` y `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- Workflow: [`.github/workflows/publish-dakinis-package.yml`](../../.github/workflows/publish-dakinis-package.yml) (`workflow_dispatch` + input `package`).
- Tags opcionales: `<dir>-v*` (p. ej. `shared-validation-v0.1.0`).

No uses el token de publish en Railway.

## Publicar un paquete

1. En `packages/<name>/package.json`: quitar `private`, añadir `publishConfig` + `files` + `repository.directory` (ver `shared-error`).
2. Merge a `main`.
3. Actions → **Publish Dakinis package** → Run → `package=<name>`.
4. Comprobar en GitHub → Packages.

## Consumers

- Migración **gradual**. LifeFlow packages locales **intactos** hasta que el producto apunte al registry.
- K-08 (borrar copias) solo tras: publish SemVer + install en CI/Railway + diff de exports OK.

## Troubleshooting

| Síntoma | Qué mirar |
|---------|-----------|
| 401/403 install | PAT sin `read:packages` o `.npmrc` mal formado |
| 403 publish | Job sin `packages: write` o scope `@dakinis` no autorizado en el owner |
| Package not found | Nombre/versión mal; o paquete aún no publicado |

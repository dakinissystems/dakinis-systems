# Docker — ecosistema Dakinis (local)

## Punto de entrada

Desde **`D:\dakinis-systems\docker`**:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml up --build
```

[`compose.full.yml`](./compose.full.yml) es el stack completo; [`compose.dev.yml`](./compose.dev.yml) añade overlays (labels, etc.). Sin overlays de dev: `docker compose -f compose.full.yml up --build`.

**Un solo comando desde la raíz del workspace:** [`../scripts/dev.ps1`](../scripts/dev.ps1) (crea `.env` / `.env.dev` desde los `.example` si faltan y ejecuta el comando anterior).

### Otros modos

| Objetivo | Comando |
|----------|---------|
| Stack completo sin overlays de dev | `docker compose -f compose.full.yml up --build` |
| Solo Postgres + Redis (red `dakinis`) | `docker compose -f compose.db.yml up -d` |

## Entornos (`ENV`)

1. Copia [`.env.example`](./.env.example) → **`.env`** (en esta carpeta). Define **`ENV=dev`** o **`ENV=prod`**.
2. Copia [`.env.dev.example`](./.env.dev.example) → **`.env.dev`** y [`.env.prod.example`](./.env.prod.example) → **`.env.prod`** según necesites.
3. Los servicios cargan **`env_file: .env.${ENV:-dev}`** (resuelve a `.env.dev` o `.env.prod`). Ajusta `JWT_SECRET` en entornos reales.

`docker/.env` solo alimenta la **interpolación** del Compose (variable `ENV`); los secretos viven en `.env.dev` / `.env.prod`.

## URLs (gateway en puerto 80)

Configuración del borde: [`../gateway/`](../gateway/) (Nginx + rutas).

| Prefijo | Servicio | Ejemplo |
| --- | --- | --- |
| `/auth/` | `platform/auth` | `http://localhost/auth/` |
| `/core/` | `platform/core` API | `http://localhost/core/api/health` |
| `/streamautomator/` | StreamAutomator API | `http://localhost/streamautomator/api/health/live` |
| `/akoenet/` | AkoeNet Server | `http://localhost/akoenet/docs` → Swagger (`/akoenet/docs/`) |

Puertos directos (sin gateway): `4000` auth, `4001` core, `4002` streamautomator, `4003` akoenet.

## Postgres

- Base **`dakinis`**: esquema `dakinis_auth` (init SQL en `postgres/init/`).
- Bases **`dakinis_stream`** y **`akoenet`**: una por app.

Si cambias los scripts de init **después** de crear el volumen:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml down -v
docker compose -f compose.full.yml -f compose.dev.yml up --build
```

## AkoeNet — migraciones

Con Postgres en marcha:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml run --rm akoenet-backend npm run migrate
```

## Rutas de build

Los `Dockerfile` están en cada repo (`../platform/auth`, `../platform/core`, `../apps/...`). Los archivos de compose usan rutas relativas a **`docker/`**.

## Contratos públicos

Rutas y prefijos acordados: [`../docs/contracts/`](../docs/contracts/).

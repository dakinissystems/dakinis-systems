# Docker — ecosistema Dakinis (local)

Desde **`D:\dakinis-systems\docker`** (esta carpeta):

```powershell
docker compose -f compose.full.yml -f compose.dev.yml up --build
```

## URLs (gateway Nginx en puerto 80)

| Prefijo | Servicio | Nota |
| --- | --- | --- |
| `/auth/` | `platform/auth` | Login, registro, `GET /auth/verify` (también usado por Nginx). |
| `/core/` | `platform/core` API | **Requiere** `Authorization: Bearer <JWT>` (validación en el gateway). |
| `/streamautomator/` | StreamAutomator API | JWT + rate limit en el borde; **múltiples rutas públicas** (webhooks, OAuth, streamer público, etc.) en [`gateway/routes/default.conf`](../gateway/routes/default.conf). |
| `/akoenet/` | AkoeNet Server | Sin `auth_request` (Socket.IO y rutas abiertas vía gateway). |

Ejemplos: `http://localhost/auth/login`, `http://localhost/core/api/...` (con token), `http://localhost:4001/api/health` (puerto directo, sin JWT).

Puertos directos (sin gateway): `4000` auth, `4001` core, `4002` streamautomator, `4003` akoenet.

## Entorno

1. Copia `.env.example` a `.env` si aún no existe (`docker/.env` está en `.gitignore`) y fija `ENV=dev`/`prod`.
2. Copia `.env.dev.example` a `.env.dev` y rellena secretos; ese archivo alimenta **auth, core-api, streamautomator y akoenet** vía `env_file`. `compose.full.yml` fija además por servicio puertos, Postgres/Redis internos, **`FRONTEND_URL` distinto por producto** (StreamAutomator `:3000`, AkoeNet/Core `:5173`) y **`SCHEDULER_API_BASE_URL`** de AkoeNet hacia el hostname Docker de StreamAutomator.
3. En producción, usa secretos fuertes y no subas `.env.dev`.

## Postgres

- Base **`dakinis`**: esquema `dakinis_auth` para el servicio auth (init SQL en `postgres/init/`).
- Bases **`dakinis_stream`** y **`akoenet`**: una por app para aislar migraciones/ORM.

Si cambias los scripts de init **después** de haber creado el volumen, borra el volumen y vuelve a levantar:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml down -v
docker compose -f compose.full.yml -f compose.dev.yml up --build
```

## AkoeNet — migraciones

La primera vez, con Postgres ya en marcha:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml run --rm akoenet-backend npm run migrate
```

## Rutas de build

Los `Dockerfile` viven en cada repo (`platform/auth`, `platform/core`, etc.); los contextos en `compose.full.yml` son relativos a esta carpeta (`../platform/...`, `../apps/...`).

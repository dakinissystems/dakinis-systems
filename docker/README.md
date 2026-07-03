# Docker — ecosistema Dakinis (local)

Desde **`D:\dakinis-systems\docker`** (esta carpeta):

```powershell
# Desarrollo (puertos directos 4000–4003 + gateway :80)
docker compose -f compose.full.yml -f compose.dev.yml up --build

# Producción local (solo gateway :80 y :443)
docker compose -f compose.full.yml -f compose.prod.yml up --build
```

## URLs (gateway Nginx en puerto 80)

| Prefijo | Servicio | Nota |
| --- | --- | --- |
| `/auth/` | `platform/auth` | Login, registro, `GET /auth/verify` (también usado por Nginx). |
| `/core/` | `platform/core` API | JWT validado en **Core** (Node), no en gateway. |
| `/streamautomator/` | StreamAutomator API | JWT + rate limit en el borde; **múltiples rutas públicas** (webhooks, OAuth, streamer público, etc.) en [`gateway/routes/default.conf`](../gateway/routes/default.conf). |
| `/akoenet/` | AkoeNet Server | Sin `auth_request` (Socket.IO y rutas abiertas vía gateway). |

Ejemplos: `http://localhost/auth/login`, `http://localhost/core/api/...` (con token), `http://localhost:4001/api/health` (puerto directo, sin JWT).

Puertos directos al host: solo con overlay **`compose.dev.yml`** (`4000` auth, `4001` core, `4002` SA, `4003` akoenet, `4020` AI, `4080–4082` billing/notifications/search, `4090` fitness). En **`compose.prod.yml`** solo se publican `80`/`443` del gateway.

## Troubleshooting

**StreamAutomator: `The server does not support SSL connections`** — el Postgres del contenedor `postgres` no usa TLS. `compose.full.yml` fuerza `DATABASE_SSL_STREAMAUTOMATOR=false` para el stack local. Si apuntas `DATABASE_URL_STREAMAUTOMATOR` a Supabase remoto, define también `DATABASE_SSL_STREAMAUTOMATOR=true` en `docker/.env` o `.env.dev`.

Puertos platform dev: billing **4080**, notifications **4081**, search **4082**, internal **4083**, fitness **4090**.

**502 en `/billing/` (u otros `*.railway.internal`)** — el gateway en Railway usa `resolver [fd12::10]`; en Docker local, `compose.dev.yml` monta `docker/nginx/resolver.local.conf` (`127.0.0.11`). Tras cambiar resolver, recarga gateway:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml up -d gateway --force-recreate
```

## Entorno

1. Copia `.env.example` a `.env` si aún no existe (`docker/.env` está en `.gitignore`) y fija `ENV=dev`/`prod`.
2. Copia `.env.dev.example` a `.env.dev` y rellena secretos; ese archivo alimenta **auth, core-api, streamautomator y akoenet** vía `env_file`. Para **Twitch con credenciales distintas** por producto usa `TWITCH_CLIENT_ID_STREAMAUTOMATOR` / `TWITCH_CLIENT_SECRET_STREAMAUTOMATOR` y `TWITCH_CLIENT_ID_AKOENET` / `TWITCH_CLIENT_SECRET_AKOENET` (`compose.full.yml` las inyecta sólo en el servicio correspondiente). `compose.full.yml` fija además puertos, Postgres/Redis internos, **`FRONTEND_URL` distinto por producto** (StreamAutomator `:3000`, AkoeNet/Core `:5173`) y **`SCHEDULER_API_BASE_URL`** de AkoeNet hacia StreamAutomator.
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

## StreamAutomator y el repo upstream (Stream-Schedule)

El código público de referencia es [ChristianDVillar/Stream-Schedule](https://github.com/ChristianDVillar/Stream-Schedule) (`backend/`, `frontend/` en la raíz del repo).

En el workspace Dakinis, el mismo producto suele vivir en **`../apps/streamautomator`** con layout **monorepo**: API en **`apps/streamautomator/apps/api`** (Compose: `streamautomator-api` → `context: ../apps/streamautomator/apps/api`) y web en **`apps/streamautomator/apps/web`**. El servicio HTTP debe escuchar en **`0.0.0.0`** y **`PORT`** (p. ej. `4002` en este stack) para Docker, Railway y el gateway.

## Rutas de build

Los `Dockerfile` viven en cada repo (`platform/auth`, `platform/core`, etc.); los contextos en `compose.full.yml` son relativos a esta carpeta (`../platform/...`, `../apps/...`).

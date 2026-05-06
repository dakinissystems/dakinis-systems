# Docker — ecosistema Dakinis (local)

Desde **`D:\dakinis-systems\docker`** (esta carpeta):

```powershell
docker compose up --build
```

## URLs (gateway Nginx en puerto 80)

| Prefijo | Servicio | Ejemplo |
| --- | --- | --- |
| `/auth/` | `platform/auth` | `http://localhost/auth/` |
| `/core/` | `platform/core` API | `http://localhost/core/api/health` |
| `/streamautomator/` | StreamAutomator API | `http://localhost/streamautomator/api/health/live` |
| `/akoenet/` | AkoeNet Server | `http://localhost/akoenet/docs` → Swagger UI (`/akoenet/docs/`) |

Puertos directos (sin gateway): `4000` auth, `4001` core, `4002` streamautomator, `4003` akoenet.

## Entorno

1. Copia `.env.example` a `.env` si aún no existe (`docker/.env` está en `.gitignore`).
2. Ajusta `JWT_SECRET` en entornos reales.

## Postgres

- Base **`dakinis`**: esquema `dakinis_auth` para el servicio auth (init SQL en `postgres/init/`).
- Bases **`dakinis_stream`** y **`akoenet`**: una por app para aislar migraciones/ORM.

Si cambias los scripts de init **después** de haber creado el volumen, borra el volumen y vuelve a levantar:

```powershell
docker compose down -v
docker compose up --build
```

## AkoeNet — migraciones

La primera vez, con Postgres ya en marcha:

```powershell
docker compose run --rm akoenet-backend npm run migrate
```

## Rutas de build

Los `Dockerfile` viven en cada repo (`platform/auth`, `platform/core`, etc.); los contextos en `docker-compose.yml` son relativos a esta carpeta (`../platform/...`, `../apps/...`).

# Railway + Supabase — paso a paso (tu setup real)

> **Tu arquitectura:** Railway = contenedores · **Supabase** = PostgreSQL · Railway **Redis** = eventos/cache  
> **NO** uses `${{Postgres.DATABASE_URL}}` de Railway si Supabase es tu base principal.

Proyectos Railway típicos:

| Proyecto | Servicios |
|----------|-----------|
| **dakinis-platform** | gateway, dakinis-auth, Core Back, Core Front, Redis, workers SA |
| **AkoeNet** | akoenet-backend, akoenet-client |

---

## Checklist rápido (30 min)

- [ ] SQL en Supabase: `00` → `01` → `02` ([`supabase/schemas/`](./supabase/schemas/))
- [ ] Core Back: `DATABASE_URL` = pooler Supabase **6543**
- [ ] Core Back: `POSTGRES_SCHEMA=dakinis_core_prod`, `CORE_SEED_DEMO=false`
- [ ] dakinis-auth: misma `DATABASE_URL`, `AUTH_SCHEMA=dakinis_auth`
- [ ] `JWT_SECRET` **idéntico** en Auth y Core
- [ ] `REDIS_URL=${{Redis.REDIS_URL}}` en Core y Auth
- [ ] Health: `db=postgres`, `postgresSchema=dakinis_core_prod`
- [ ] Sentry DSN en Auth + Core
- [ ] AkoeNet Client: `VITE_DAKINIS_AUTH_URL`

---

## Fase 0 — Supabase (ANTES de Railway)

### 0.1 Connection string (pooler)

Supabase → **Settings** → **Database** → **Connection string** → **URI** → **Transaction pooler** (puerto **6543**).

Copia y guarda como secret (nunca en Git):

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Opcional al final: `?pgbouncer=true`

**Session mode (5432 pooler)** solo si tienes problemas con migraciones; para APIs en Railway suele ir bien **6543**.

### 0.2 SQL Editor — ejecutar en orden

1. [`docs/supabase/schemas/00-bootstrap-schemas.sql`](./supabase/schemas/00-bootstrap-schemas.sql)
2. [`docs/supabase/schemas/01-dakinis-auth.sql`](./supabase/schemas/01-dakinis-auth.sql)
3. [`docs/supabase/schemas/02-dakinis-core-prod.sql`](./supabase/schemas/02-dakinis-core-prod.sql)

Guía detallada: [`docs/supabase/SETUP.md`](./supabase/SETUP.md)

### 0.3 Verificar en Supabase

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('dakinis_auth', 'dakinis_core_prod')
ORDER BY 1, 2;
```

Debes ver `dakinis_auth.users`, `dakinis_core_prod.business`, etc.

---

## Fase 1 — Core Back (PRIORIDAD MÁXIMA)

Railway → proyecto **dakinis-platform** → servicio **Core Back** (o `dakinis-core-api`).

### Variables

```env
NODE_ENV=production
PORT=4001
DB_DRIVER=postgres
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DATABASE_SSL=true
POSTGRES_SCHEMA=dakinis_core_prod
CORE_SEED_DEMO=false
JWT_SECRET=<copiar de dakinis-auth>
CORS_ORIGIN=https://core.dakinissystems.com
REDIS_URL=${{Redis.REDIS_URL}}
DAKINIS_EVENT_BUS=redis
TRUST_PROXY=true
```

| Variable | Error común |
|----------|-------------|
| `DATABASE_URL` | Usar Railway Postgres en vez de Supabase |
| `CORE_SEED_DEMO` | Dejar `true` en prod → datos demo |
| `DB_DRIVER` | Omitir → puede quedarse en SQLite local |
| `JWT_SECRET` | Distinto al de Auth → exchange/login fallan |

### Redeploy

**Deployments** → **Redeploy** → revisar logs:

```
[db] PostgreSQL connected schema=dakinis_core_prod pooler=true
```

### Verificación

```http
GET https://core.dakinissystems.com/api/health
```

```json
"db": "postgres",
"postgresSchema": "dakinis_core_prod",
"databasePooler": true
```

Si ves `"db":"sqlite"` → Core **no** lee `DB_DRIVER=postgres`.

---

## Fase 2 — dakinis-auth

Servicio **dakinis-auth** en el mismo proyecto Railway.

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<misma URI Supabase 6543>
DATABASE_SSL=true
AUTH_SCHEMA=dakinis_auth
JWT_SECRET=<secreto único compartido con Core>
JWT_ACCESS_TTL=15m
JWT_REFRESH_DAYS=30
JWT_LEGACY_LONG_TTL=false
REDIS_URL=${{Redis.REDIS_URL}}
CORS_ORIGINS=https://core.dakinissystems.com,https://akoenet.dakinissystems.com,https://streamautomator.com,https://www.streamautomator.com,https://dakinissystems.com
AUTH_ISSUER=https://auth.dakinissystems.com
SENTRY_DSN=<opcional>
SENTRY_ENVIRONMENT=production
```

Redeploy → probar:

```http
GET https://<auth-host>/auth/health
```

---

## Fase 3 — Redis (ya lo tienes)

Servicio **Redis** en Railway. Referencia en otros servicios:

```env
REDIS_URL=${{Redis.REDIS_URL}}
```

Sin Redis, el event bus sigue en in-process (funciona, sin colas distribuidas).

---

## Fase 4 — dakinis-gateway

Mantén **un solo entrypoint** público cuando puedas:

| Ruta pública | Servicio interno |
|--------------|------------------|
| `/auth/` | dakinis-auth |
| `/core/` | Core Back |
| `/akoenet/` | akoenet-backend (proyecto AkoeNet) |

Recomendación futura: `api.dakinissystems.com` → gateway (ocultar puertos directos).

Variables gateway: upstreams internos Railway (`*.railway.internal` o URLs de servicio).

---

## Fase 5 — Sentry

1. [sentry.io](https://sentry.io) → proyecto Node por servicio.
2. `SENTRY_DSN` + `SENTRY_ENVIRONMENT=production` en Auth, Core Back, akoenet-backend.
3. Alertas → errores en production.

---

## Fase 6 — AkoeNet IdP

Proyecto **AkoeNet** → **akoenet-client** → Variables build:

```env
VITE_DAKINIS_AUTH_URL=https://auth.dakinissystems.com/auth
```

Si el gateway expone auth:

```env
VITE_DAKINIS_AUTH_URL=https://api.dakinissystems.com/auth
```

Redeploy **client** (Vite embebe variables en build).

Backend AkoeNet: suele tener **otro** Supabase — no mezclar con `dakinis_core_prod`.

---

## Fase 7 — Backups

| Capa | Qué hacer |
|------|-----------|
| Supabase | Activar backups / PITR en plan |
| GitHub | Secret `BACKUP_DATABASE_URL` = URI Supabase (**direct** 5432 si `pg_dump` falla con pooler) |
| Mensual | `.\scripts\restore-postgres-test.ps1 -BackupFile <archivo.gz>` |

---

## Fase 8 — Uptime Kuma

Monitorear:

| Servicio | URL |
|----------|-----|
| Gateway | `https://<gateway>/health` |
| Auth | `https://<auth>/auth/health` |
| Core | `https://core.dakinissystems.com/api/health` |
| AkoeNet | `https://api.akoenet.dakinissystems.com/health` |
| StreamAutomator | `https://streamautomator.com/api/health/live` |

Ver [`observability/uptime-kuma.md`](./observability/uptime-kuma.md).

---

## Fase 9 — Fastify (NO aún)

Espera 1–2 semanas con Postgres + Sentry estables. Luego en Core Back:

```env
USE_FASTIFY=true
```

---

## Staging (recomendado)

| Ambiente | Schema | URL |
|----------|--------|-----|
| Prod | `dakinis_core_prod` | core.dakinissystems.com |
| Staging | `dakinis_core_dev` | staging-core… (opcional) |

Ejecuta SQL `02` con schema `dakinis_core_dev` y variables:

```env
POSTGRES_SCHEMA=dakinis_core_dev
CORE_SEED_DEMO=true
NODE_ENV=development
```

---

## Qué NO hacer

- ❌ Mezclar Supabase Auth con `dakinis-auth`
- ❌ Poner todo en `public` en Supabase
- ❌ `CORE_SEED_DEMO=true` en producción
- ❌ CORS `*` en prod
- ❌ Kubernetes / microservicios extra ahora

---

## Referencias

- [`docs/supabase/SETUP.md`](./supabase/SETUP.md)
- [`platform/core/docs/PRODUCTION.md`](../platform/core/docs/PRODUCTION.md)
- [`docs/DAKINIS-ESTRUCTURA-TEMP.md`](./DAKINIS-ESTRUCTURA-TEMP.md)

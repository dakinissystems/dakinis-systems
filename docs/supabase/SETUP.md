# Supabase + Railway — guía única

> **Audiencia:** control interno. Checklist prod y tenants: [`OPERATIONS.md`](../OPERATIONS.md).

**Arquitectura:** Railway (compute) + **Supabase PostgreSQL** (datos) + Railway **Redis** (eventos/cache).  
**No** uses el plugin Postgres de Railway para Auth/Core (solo Supabase).

| Producto | Abrev. | Qué es |
|----------|--------|--------|
| **StreamAutomator** | **SA** | App en `apps/streamautomator` — scheduler Twitch, API + workers en Railway |
| **AkoeNet** | — | Comunidad/voz — proyecto Railway aparte |
| **Core** | — | Dakinis One BOS (`platform/core`) |
| **dakinis-auth** | IdP | Login central (`platform/auth`) |

---

## 1. SQL en Supabase (orden único)

Ejecutar en **SQL Editor**, una vez por entorno:

| Paso | Archivo |
|------|---------|
| 1 | [`schemas/00-bootstrap-schemas.sql`](./schemas/00-bootstrap-schemas.sql) |
| 2 | [`schemas/01-dakinis-auth.sql`](./schemas/01-dakinis-auth.sql) |
| 3 | [`schemas/02-dakinis-core-prod.sql`](./schemas/02-dakinis-core-prod.sql) |
| 4 | [`schemas/03-whatsapp-messages.sql`](./schemas/03-whatsapp-messages.sql) |
| 5 | [`schemas/04-crm-core.sql`](./schemas/04-crm-core.sql) |
| 6 | [`schemas/05-tenant-intelligence.sql`](./schemas/05-tenant-intelligence.sql) |
| 7 | [`schemas/06-tenant-intelligence-v2.sql`](./schemas/06-tenant-intelligence-v2.sql) |
| 8 | [`schemas/07-bos-platform.sql`](./schemas/07-bos-platform.sql) |
| 9 | [`schemas/08-telemetry.sql`](./schemas/08-telemetry.sql) |
| 10 | [`schemas/09-feature-events.sql`](./schemas/09-feature-events.sql) |
| 11 | [`schemas/10-user-credentials.sql`](./schemas/10-user-credentials.sql) |
| 12 | [`004-rls-lockdown-all.sql`](./004-rls-lockdown-all.sql) |
| 13 | [`006-rls-policies-deny-api.sql`](./006-rls-policies-deny-api.sql) (1ª vez) **o** [`006b-rls-policies-missing-tables.sql`](./006b-rls-policies-missing-tables.sql) |
| 14 | [`005-advisor-functions-storage.sql`](./005-advisor-functions-storage.sql) (opcional) |
| 15 | [`schemas/99-verify-all-tables.sql`](./schemas/99-verify-all-tables.sql) (diagnóstico) |

Índice completo de tablas: [`schemas/README.md`](./schemas/README.md).

**Tras migraciones Core nuevas** (`03`–`09` en [`schemas/`](./schemas/)): ejecutar de nuevo [`004-rls-lockdown-all.sql`](./004-rls-lockdown-all.sql) (habilita RLS en tablas nuevas) y luego [`006b-rls-policies-missing-tables.sql`](./006b-rls-policies-missing-tables.sql) (corrige advisor **RLS Enabled No Policy**). Alternativa: re-ejecutar `006` completo.

**Staging:** copia `02-dakinis-core-prod.sql` cambiando `dakinis_core_prod` → `dakinis_core_dev` (no hace falta un tercer archivo en repo).

**Diagnóstico:** [`diagnostic.sql`](./diagnostic.sql) (solo lectura).

**Tenants reales (ej. Dumpling House):** [`seeds/README.md`](./seeds/README.md) → `seeds/04-tenant-dumpling-house.sql`.

**Schemas en proyecto equivocado (ej. AkoeNet):** [`scripts/drop-dakinis-schemas-wrong-project.sql`](./scripts/drop-dakinis-schemas-wrong-project.sql) — solo en ese Supabase, nunca en el de Core.

RLS no afecta Auth/Core en Railway (conexión rol `postgres` vía pooler **6543**); bloquea PostgREST `anon`/`authenticated`.

**Supabase Auth (dashboard):** si el advisor pide “leaked passwords”, es GoTrue del panel Supabase, no tu IdP — activar en Authentication → Email → leaked password protection.

---

## 2. `DATABASE_URL` y `?pgbouncer=true`

**Transaction pooler (prod APIs):** puerto **6543**, host `*.pooler.supabase.com`.

Añade el query al **final** de la misma variable `DATABASE_URL` en Railway (Core Back y dakinis-auth):

```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Ejemplo con contraseña URL-encoded (`%21` = `!`):

```
postgresql://postgres.omdosutakaefpowscagp:%21Omunculo_42%21@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

| Dónde | Variable |
|-------|----------|
| **Core Back** | `DATABASE_URL` (con o sin `?pgbouncer=true`) |
| **dakinis-auth** | `DATABASE_URL` (misma URI) |
| **GitHub backup** | `BACKUP_DATABASE_URL` — preferir conexión **directa 5432** para `pg_dump` |

**Opcional:** si `/api/health` ya muestra `databasePooler: true` y todo va bien, puedes dejar la URI **sin** `?pgbouncer=true` (solo quita el warning del validador).

---

## 3. `DB_DRIVER=postgres` (solo Core Back)

| Servicio | `DB_DRIVER` |
|----------|-------------|
| **Core Back** (`dakinis-core-api`) | `postgres` **obligatorio** en prod |
| **dakinis-auth** | No usa `DB_DRIVER` (siempre Postgres si hay `DATABASE_URL`) |

Sin `DB_DRIVER=postgres`, Core puede arrancar en SQLite y `/api/health` devuelve `"db":"sqlite"`.

---

## 4. Variables Railway — `dakinis-platform`

Plantilla: [`../railway.env.example`](../railway.env.example)

### Core Back

```env
DB_DRIVER=postgres
DATABASE_URL=postgresql://...@....pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_SSL=true
POSTGRES_SCHEMA=dakinis_core_prod
CORE_SEED_DEMO=false
JWT_SECRET=<igual que dakinis-auth>
REDIS_URL=${{Redis.REDIS_URL}}
```

### dakinis-auth

```env
DATABASE_URL=<misma URI Supabase 6543>
DATABASE_SSL=true
AUTH_SCHEMA=dakinis_auth
JWT_SECRET=<mismo que Core>
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## 5. Verificación

```http
GET /api/health
```

Esperado: `"db":"postgres"`, `"postgresSchema":"dakinis_core_prod"`, `"databaseProvider":"supabase"`, `"databasePort":6543`.

Tenant (Postman): login → Bearer + header `X-Business-Id: restaurante-demo` → 200 en:

- `/api/tenant/supply/alerts`
- `/api/tenant/supply/deliveries`
- `/api/tenant/restaurant/kitchen`

### Gateway (`dakinis-gateway`)

| Ruta pública | Backend |
|--------------|---------|
| `/auth/` | dakinis-auth |
| `/core/` | Core Back (JWT Core; sin `auth_request` IdP en tenant) |
| `/akoenet/` | akoenet-backend (proyecto AkoeNet) |

Upstreams: `*.railway.internal` en `gateway/routes/default.conf`. Cambios de rutas → [`../rules.md`](../rules.md).

### AkoeNet (proyecto Railway aparte)

**Client** (build Vite):

```env
VITE_DAKINIS_AUTH_URL=https://api.dakinissystems.com/auth
```

**Backend:** suele tener **otro** Supabase — no mezclar con `dakinis_core_prod`.

### Staging Core (opcional)

```env
POSTGRES_SCHEMA=dakinis_core_dev
CORE_SEED_DEMO=true
```

SQL: copia de `02` con schema `dakinis_core_dev`.

### Qué NO hacer

- Mezclar Supabase Auth con `dakinis-auth`
- Plugin Postgres de Railway para Auth/Core
- `CORE_SEED_DEMO=true` en producción
- CORS `*` con credenciales en prod

---

## Mapa schemas

| Schema | Servicio |
|--------|----------|
| `dakinis_auth` | dakinis-auth |
| `dakinis_core_prod` | Core Back (prod) |
| `dakinis_core_dev` | staging (opcional) |

Checklist operativo: [`../OPERATIONS.md`](../OPERATIONS.md)

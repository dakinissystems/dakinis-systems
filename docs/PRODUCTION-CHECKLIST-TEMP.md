# Checklist producción — pendiente (TEMP)

> **Actualizado:** mayo 2026 · Borrar cuando prod esté estable.  
> **Stack:** Supabase (DB) + Railway (compute) + Redis + Gateway nginx.

**Estado:** ~**10/10** Core tenant API validada. Pendiente operativo: redeploys (gateway/front), `CORE_SEED_DEMO=false`, backups GH, Sentry en todos los servicios, AkoeNet IdP.

**Glosario:** **SA** = **StreamAutomator** (`apps/streamautomator`) — producto Twitch/scheduler; no es la base de datos.

---

## Pruebas validadas (prod)

| Prueba | Resultado |
|--------|-----------|
| `POST …/api/auth/login` (demo restaurante) | ✅ JWT `iss: dakinis-core` |
| `GET …/api/tenant/supply/alerts` | ✅ **200** |
| `GET …/api/tenant/supply/deliveries` | ✅ **200** |
| `GET …/api/tenant/restaurant/kitchen` | ✅ **200** |
| Bearer + `X-Business-Id: restaurante-demo` | ✅ sin errores |
| Supabase `dakinis_core_prod` | ✅ tablas OK |
| `GET /core/api/health` | ✅ `databaseProvider: supabase`, pooler **6543** |
| `DB_DRIVER=postgres` (Core Back) | ✅ en Railway |
| `DATABASE_URL` → `pooler.supabase.com:6543` | ✅ (no Railway Postgres) |
| `GET /auth/verify` con token Core | ✅ **401 esperado** (IdP ≠ emisor Core) |
| CI **akoenet-client** (`dakinis-client-logout.js`) | ✅ en `main` (`05e8898`) — re-run CI si falló en commit viejo |

**Postman:** Authorization → Bearer (token del login). Header `X-Business-Id: restaurante-demo`. Misma base URL para login y tenant.

**Vacío es normal:** `alerts: []` hasta `POST …/supply/alerts`.

---

## Base de datos (referencia)

| Tema | Dónde / valor |
|------|----------------|
| **Pooler** | Puerto **6543** en `DATABASE_URL` (Core Back + dakinis-auth) |
| **`DB_DRIVER`** | Solo **Core Back** → `postgres` |
| **`?pgbouncer=true`** | Al final de `DATABASE_URL` en Railway (opcional; ver [`supabase/SETUP.md`](./supabase/SETUP.md)) |
| **SQL Supabase** | Orden único: `00` → `01` → `02` → `004` → `006` → `005` — [`supabase/SETUP.md`](./supabase/SETUP.md) |
| **Postgres Railway plugin** | No se usa — eliminar en `dakinis-platform` tras confirmar variables |
| **Backups** | `BACKUP_DATABASE_URL` en GitHub (URI **5432** directa si `pg_dump` falla con 6543) |

---

## Progreso rápido — solo pendiente

| Bloque | Acción |
|--------|--------|
| Gateway `/core/` | Redeploy si `api.dakinissystems.com/core` devuelve HTML 401 |
| Core Front | Redeploy (`VITE_SENTRY_DSN`, logout) |
| `CORE_SEED_DEMO` | `false` en Core Back |
| Sentry | auth, AkoeNet client, SA web (`VITE_*` / `SENTRY_DSN`) |
| Backup GitHub | Secret `BACKUP_DATABASE_URL` + workflow |
| AkoeNet | `VITE_DAKINIS_AUTH_URL` + redeploy client |
| SA (StreamAutomator) | Redeploy web/logout + Sentry cuando toque |
| Security Advisor Supabase | Refresh panel |
| Plugin Postgres Railway | Eliminar (no usado) |

### Repos

| Repo | Acción |
|------|--------|
| **dakinis-systems** | Redeploy gateway |
| **platform/core** | Redeploy Front; `CORE_SEED_DEMO=false` en Back |
| **akoenet-client** | CI verde en `main` — redeploy si aún no |
| **streamautomator** | Redeploy web (SA) |

---

## Arquitectura

```
SUPABASE → dakinis_auth, dakinis_core_prod
RAILWAY  → gateway, auth, Core Back/Front, Redis, StreamAutomator (SA), AkoeNet*
```

Gateway Core: `/core/` sin `auth_request` IdP; Core valida JWT + `X-Business-Id`.

---

## FASE 1 — Supabase

- [ ] `BACKUP_DATABASE_URL` (5432) en GitHub
- [ ] Security Advisor refresh
- [ ] (Opcional) `?pgbouncer=true` en `DATABASE_URL` si quieres quitar warning en health

---

## FASE 2 — Railway `dakinis-platform`

### Core Back

- [x] Pooler 6543 + `DB_DRIVER=postgres` + schema `dakinis_core_prod`
- [x] Tenant APIs alerts / deliveries / kitchen → 200
- [ ] `CORE_SEED_DEMO=false`
- [ ] Redeploy search_path pooler si aún no (`postgres-connection.js`)

### Core Front

- [ ] Redeploy (Sentry `VITE_SENTRY_DSN` + logout)
- [ ] Navegador: `/sistema/restaurante` → Network 200

### Gateway

- [ ] Redeploy `default.conf` (sin `auth_request` en `/core/`)
- [ ] Quitar `VITE_SENTRY_DSN` del servicio gateway (nginx no la usa)

### dakinis-auth

- [ ] `SENTRY_DSN` → health `sentry: true`

### Troubleshooting

| Síntoma | Estado |
|---------|--------|
| HTML 401 nginx en `/core/api/tenant/*` | Fix en repo — redeploy gateway |
| `JWT invalido` | Misma URL login + API |
| `relation does not exist` | ✅ Resuelto (SQL + pooler) |

---

## FASE 3 — AkoeNet + StreamAutomator (SA)

### akoenet-client

- [x] Logout file en `main`
- [ ] `VITE_DAKINIS_AUTH_URL` + redeploy
- [ ] IdP → exchange → sockets

### SA + Sentry

| Servicio | Variable |
|----------|----------|
| Core Front | `VITE_SENTRY_DSN` (redeploy build) |
| Core Back | `SENTRY_DSN` ✅ |
| dakinis-auth | `SENTRY_DSN` |
| akoenet-client | `VITE_SENTRY_DSN` |
| **SA web** | `VITE_SENTRY_DSN` |

---

## FASE 4–5

- [ ] GitHub backup workflow probado
- [ ] Uptime Kuma · Cloudflare DNS
- [ ] Eliminar plugin Postgres Railway en `dakinis-platform`

---

## Qué sigue

1. Redeploy **gateway** + confirmar tenant vía `api.dakinissystems.com/core`
2. Redeploy **Core Front** (Sentry + logout)
3. `CORE_SEED_DEMO=false`
4. Backups GH · Sentry resto · AkoeNet IdP · borrar Postgres Railway

---

## Referencias

- Supabase (única guía SQL): [`supabase/SETUP.md`](./supabase/SETUP.md) · diagnóstico: [`supabase/diagnostic.sql`](./supabase/diagnostic.sql)
- Railway + Supabase: [`supabase/SETUP.md`](./supabase/SETUP.md) · [`railway.env.example`](./railway.env.example)
- Gateway: `gateway/routes/default.conf`
- Sentry: [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md)

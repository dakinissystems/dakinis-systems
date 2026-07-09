# Dakinis Systems — Operaciones

> Deploy, variables, health checks, backups y pendientes operativos. Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Comandos útiles

```powershell
# Stack local completo
.\scripts\dev.ps1

# Sincronizar tokens de marca → Landing, Core, LifeFlow
node scripts/sync-shared-brand.mjs

# Health checks prod
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://finance-api.dakinissystems.com/health
curl -sS https://tabletop-api.dakinissystems.com/health
curl -sS https://core.dakinissystems.com/hub -o /dev/null -w "%{http_code}`n"

# Finanzas / LifeFlow local
cd D:\dakinis-systems\finanzas
npm run dev
npm test   # 87 tests

# Dakinis AI + Core (Copilot)
cd D:\dakinis-systems\platform\core
npm run dev:full:ai

# Design audit (DES)
node packages/design-audit/src/audit.mjs platform/core/web finanzas/web/src/styles

# Backup Postgres (cuando BACKUP_DATABASE_URL esté configurado)
.\scripts\backup-postgres.ps1
```

**Demo Core:** `admin@restaurante-demo.local` / `demo123` · tenant `restaurante-demo`.

Plantilla variables: [`railway.env.example`](./railway.env.example).

---

## Railway — mapa servicios (Fase 1)

| Servicio | Repo | Dominio |
|----------|------|---------|
| Gateway | `dakinis-systems` | `api.dakinissystems.com` |
| Auth | `dakinis-auth` | `auth.dakinissystems.com` |
| Core API | `dakinis-core` | `core-api.dakinissystems.com` + `/core/` |
| Core Web | `dakinis-core` | `core.dakinissystems.com` |
| Hub | `dakinis-hub` | `hub.dakinissystems.com` |
| AI API | `dakinis-ai` | `ai.dakinissystems.com` |
| AI Worker | `dakinis-ai` | interno |
| Landing | `dakinis-landing` | `dakinissystems.com` |
| StreamAutomator | `dakinis-streamautomator` | `api.streamautomator.com` |
| AkoeNet | `akoenet-*` | `api.akoenet.dakinissystems.com` |
| **LifeFlow Web** | `lifeflow` | `finance.dakinissystems.com` |
| **LifeFlow API** | `lifeflow` | **`finance-api.dakinissystems.com`** |
| **Tabletop Web** | `dakinis-tabletop` | `tabletop.dakinissystems.com` |
| **Tabletop API** | `dakinis-tabletop` | **`tabletop-api.dakinissystems.com`** |
| Redis | plugin | interno — AI · StreamAutomator · Billing events · Notifications · Search · Knowledge workers |
| **Billing** | `dakinis-billing` | `/billing/` |
| **Notifications** | `dakinis-notifications` | `/notifications/` |
| **Search** | `dakinis-search` | `/search/` |
| **Knowledge** | `dakinis-knowledge` | `/knowledge/` |
| **Internal API** | `dakinis-internal-api` | `/internal/` |

### Fase 1 — operativo (prod actual)

Servicios de producto (tabla superior) + platform vía gateway (`/billing/`, `/notifications/`, `/search/`, `/knowledge/`, `/internal/`, `/ai/`).

Pendientes operativos por servicio → [`STATUS.md`](./STATUS.md) (Billing E2E, workers, Resend live…).

### Reservado — Fase 2+ (no crear vacíos)

| Servicio | Notas |
|----------|-------|
| Storage / Media | `/media/` · R2 · post-piloto |
| Observability | Sentry · uptime · costes por workspace |

Contratos: [`docs/contracts/`](./contracts/README.md).

⚠️ **No usar** `api.finance.dakinissystems.com` — SSL Cloudflare free no cubre subdominio de 2º nivel.

**Workers roadmap:** Notifications · Scheduler · Media · Search — ver [`STATUS.md`](./STATUS.md).

---

## LifeFlow — env Railway

### API

| Variable | Valor / notas |
|----------|----------------|
| `FINANZAS_DB_PATH` | `/data/finanzas.db` (**requiere volume** en `/data`) |
| `FINANZAS_JWT_SECRET` | Secret **estable** (no regenerar en cada deploy) |
| `FINANZAS_CORS_ORIGINS` | `https://finance.dakinissystems.com` |
| `PORT` | Railway auto |

### Web

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://finance-api.dakinissystems.com` |

### Estabilidad prod (may 2026)

| Tema | Estado |
|------|--------|
| Crash tier `pro` / init SQLite | ✅ |
| Service Worker v3 | ✅ |
| CORS | ✅ código |
| Auth login/register | ✅ código |
| Volume SQLite persistente | 🔄 verificar mount en `/data` |
| JWT secret fijo | ✅ según `/health` |

### Auth 401 — diagnóstico (no es Supabase)

LifeFlow **no usa Supabase** para usuarios. Auth vive en **SQLite** (`users` en `finanzas.db`).

| Síntoma | Causa probable |
|---------|----------------|
| `POST /api/auth/login` → **401** | Email no existe en SQLite **o** contraseña incorrecta |
| Registro OK, login falla después | BD efímera / WAL sin checkpoint (redeploy) o volume mal montado |
| `/api/auth/me` → 401 con token viejo | JWT secret cambió entre deploys |

**Comprobar prod:**

```powershell
curl.exe -sS https://finance-api.dakinissystems.com/health
```

Esperado: `"engine":"sqlite"`, `"userCount":N`, `"configuredPath":true`.

**Recuperar cuenta en Railway** (Shell del servicio LifeFlow API):

```bash
npm run reset-password -w @finanzas/api -- tu@email.com TuNuevaClave123 --create
```

`--create` crea el usuario si no existe. Sin Supabase ni SQL manual.

**Volume Railway:** montar en **`/data`**, no solo el archivo. Variables:

- `FINANZAS_DB_PATH=/data/finanzas.db`
- `FINANZAS_JWT_SECRET=<secreto fijo>`

---

## Supabase — operaciones

Orden migraciones: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md).

| Fase | Scripts | Prod |
|------|---------|------|
| A Estructura | 000–013 | ✅ |
| B Backfill | 014a, 014, 015 | ✅ |
| C Mejoras | 016, 016b, 017, 018, 019 | ⬜ SQL Editor |
| C+ Hub Mi día | 027 | ⬜ Tras C |
| E Cutover apps | código + disable triggers | ⬜ |

**Fase C — pasos (SQL Editor, en orden):**

1. `016_schema_enhancements.sql`
2. `016b_stream_sync_triggers.sql` (convivencia Stream; opcional si no usas `public.Contents`)
3. `017_functions_v1.sql`
4. `018_hub_dashboard.sql`
5. `019_rls_templates_and_cutover_plan.sql`
6. Verificar: pegar [`scripts/smoke-supabase-phase-c.sql`](../scripts/smoke-supabase-phase-c.sql)
7. `027_hub_mi_dia.sql` — activa flag `hub.mi_dia`

**Regla API:** usar funciones `schema.v1_*` — no queries directas cross-schema.

Backup: workflow `.github/workflows/backup-postgres.yml` — secret `BACKUP_DATABASE_URL` pendiente.

---

## Gateway

- Config: [`gateway/routes/default.conf`](../gateway/routes/default.conf)
- LifeFlow: `/finance/health`, `/finance/api/*`, SPA `/finance/`
- Reglas cambio: [`docs/rules.md`](./rules.md)
- Smoke billing: `.\scripts\smoke-billing.ps1` (prod) o `-BaseUrl http://localhost`
- Smoke knowledge: `.\scripts\smoke-knowledge.ps1` (prod) o `-BaseUrl http://localhost`
- Smoke search: `.\scripts\smoke-search.ps1`
- Smoke notifications: `.\scripts\smoke-notifications.ps1`
- Smoke hub: `.\scripts\smoke-hub.ps1` (Internal API dashboard; requiere `DAKINIS_INTERNAL_SERVICE_KEY`)

---

## Hub «Mi día»

Repo: [dakinis-hub](https://github.com/dakinissystems/dakinis-hub) → `hub.dakinissystems.com`

Antes de push: `.\scripts\sync-hub-des.ps1` (copia `shared-brand`, `shared-layouts`, `shared-ux` → `hub/packages/`).

| Componente | Estado |
|------------|--------|
| Supabase `hub.v1_get_dashboard` | ✅ migraciones 016–019 + 027 |
| Internal API | ✅ `dakinis-internal-api` |
| SPA `hub/` | ✅ build + `server.js` proxy |

### Railway `dakinis-hub`

| Campo | Valor |
|-------|-------|
| Repo | `dakinissystems/dakinis-hub` |
| Builder | Dockerfile |
| Start | `node server.js` |
| Dominio | `hub.dakinissystems.com` |

**Variables build + runtime:**

```
HUB_DEMO_USER_ID=<uuid>
HUB_INTERNAL_SERVICE_KEY=<igual que Internal API>
HUB_INTERNAL_URL=http://dakinis-internal-api.railway.internal:4083
HUB_API_BASE=https://api.dakinissystems.com
PORT=8080
```

`HUB_INTERNAL_URL` evita Cloudflare 403 en proxy server→gateway público.

**Local:**

```powershell
.\scripts\sync-hub-des.ps1
cd hub && npm install && npm run dev
```

Post-deploy: `curl.exe -s https://hub.dakinissystems.com/`

---

## Billing E2E Live (checklist)

**Pre-requisito:** `.\scripts\smoke-billing.ps1` → los 3 checks en **200** (ya OK en prod).

| Paso | Acción | Verificación |
|------|--------|--------------|
| 1 | Stripe Dashboard → Webhooks → endpoint Live | URL: `https://api.dakinissystems.com/billing/v1/webhooks/stripe` |
| 2 | Eventos mínimos activos | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed` |
| 3 | `STRIPE_WEBHOOK_SECRET` en servicio **dakinis-billing** Railway | Redeploy billing |
| 4 | Core Back: `DAKINIS_BILLING_URL` + `REDIS_URL` + `DAKINIS_EVENTS_QUEUE` | Sin `STRIPE_*` en Core |
| 5 | Checkout test | `https://core.dakinissystems.com/precios` → Growth → tarjeta test Live o real |
| 6 | Stripe → Webhook delivery | Respuesta **200** en el evento |
| 7 | Supabase | `billing.subscriptions` fila con `plan=growth` y `tenant_id` correcto |
| 8 | Core | `business.plan` actualizado (Redis consumer o sync manual) |
| 9 | Impago (opcional) | Simular `invoice.payment_failed` → tenant `access_state=degraded` → restore al pagar |

**SQL rápido post-checkout:**

```sql
SELECT plan, status, tenant_id, stripe_subscription_id, updated_at
FROM billing.subscriptions
ORDER BY updated_at DESC LIMIT 5;
```

---

## Railway — Knowledge (dos servicios)

Repo: [dakinis-knowledge](https://github.com/dakinissystems/dakinis-knowledge) · gateway ya expone `/knowledge/` → `dakinis-knowledge.railway.internal:4084`.

### 1. knowledge-api

| Campo | Valor |
|-------|-------|
| Repo | `dakinissystems/dakinis-knowledge` |
| Root | `/` |
| Builder | Dockerfile (`railway.toml`) |
| Start | `npm run start:api` |
| `PORT` | `4084` |
| Health | `/health` |
| Dominio (opcional) | `knowledge.dakinissystems.com` o solo vía gateway `/knowledge/` |

**Variables API:**

```
PORT=4084
REDIS_URL=${{Redis.REDIS_URL}}
DATABASE_URL=<Supabase pooler 6543>
DATABASE_SSL=true
DAKINIS_SEARCH_URL=https://api.dakinissystems.com/search
DAKINIS_INTERNAL_SERVICE_KEY=<igual que Core>
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=knowledge
```

**Private networking:** alias `dakinis-knowledge.railway.internal` (Settings → Networking).

### 2. knowledge-worker

| Campo | Valor |
|-------|-------|
| Mismo repo | Segundo servicio en el mismo proyecto Railway |
| Config | `railway.worker.toml` o Start Command: `npm run worker` |
| Dominio | Ninguno |
| `WORKER_TYPE` | `ingest` |
| `KNOWLEDGE_INGEST_QUEUE` | `dakinis:knowledge:ingest` |

**Variables worker:** `REDIS_URL`, `DATABASE_URL`, `DATABASE_SSL=true`, `WORKER_TYPE=ingest`, `DAKINIS_SEARCH_URL` (opcional, indexa en Search tras persist).

Post-deploy persist smoke:

```powershell
.\scripts\smoke-knowledge.ps1
# ingest → worker → GET /knowledge/v1/documents?slug=...
```

### 3. Post-deploy

```powershell
.\scripts\smoke-knowledge.ps1
curl.exe https://api.dakinissystems.com/knowledge/health
```

Supabase: `025` + `026` ✅ · Post-deploy: `.\scripts\smoke-knowledge.ps1`

---

## Railway — Search + Notifications (API + workers)

APIs prod: `/search/health` · `/notifications/health` (200). Falta **worker** en cada repo.

### Search — `dakinis-search` (4082)

**API** (si no existe o revisar):

| Campo | Valor |
|-------|-------|
| Service name | **`dakinis-search`** |
| Private DNS | `dakinis-search.railway.internal` |
| Start | `node src/server.js` |
| `PORT` | `4082` |
| Health | `/health` |

```env
PORT=4082
REDIS_URL=${{Redis.REDIS_URL}}
SEARCH_INDEX_QUEUE=dakinis:search:index
```

**Worker** — servicio **`dakinis-search-worker`** (mismo repo):

```env
REDIS_URL=${{Redis.REDIS_URL}}
SEARCH_INDEX_QUEUE=dakinis:search:index
```

Start: `npm run worker` · sin dominio · sin healthcheck.

Smoke: `.\scripts\smoke-search.ps1` → worker log: `[worker] index job`

### Notifications — `dakinis-notifications` (4081)

**API**:

| Campo | Valor |
|-------|-------|
| Service name | **`dakinis-notifications`** |
| Private DNS | `dakinis-notifications.railway.internal` |
| `PORT` | `4081` |

```env
PORT=4081
REDIS_URL=${{Redis.REDIS_URL}}
NOTIFICATIONS_QUEUE=dakinis:notifications
```

**Worker** — **`dakinis-notifications-worker`**:

```env
REDIS_URL=${{Redis.REDIS_URL}}
NOTIFICATIONS_QUEUE=dakinis:notifications
```

Start: `npm run worker`

Smoke: `.\scripts\smoke-notifications.ps1` → worker log: `[worker] dispatch channel=in-app`

---

## 🔴 Bloquean go-live

| # | Área | Tarea | Estado |
|---|------|-------|--------|
| 1 | Stripe | Webhook prod → `STRIPE_WEBHOOK_SECRET` | [ ] |
| 2 | Stripe | Payment Links Growth/Pro | [ ] |
| 3 | Stripe | E2E pago → webhook 200 → plan actualizado | [ ] |
| 4 | Stripe | Impago → tenant degraded → restore | [ ] |
| 5 | Stripe SA | Webhook `api.streamautomator.com/...` | [ ] |
| 6 | Supabase | `022` + `023` en prod | [x] |
| 6b | Supabase | `024` + `12-tenant-access.sql` en prod | [x] |
| 7 | Tenant access | Redeploy + smoke suspend/reactivate | [ ] |
| 8 | Deploy | Push `dakinis-core` + Railway (proxy billing `:4080`) | [x] prod OK |
| 9 | Deploy | Push `dakinis-landing` + smoke | [ ] |
| 10 | Deploy | `upsert-platform-admin.mjs` prod | [ ] |
| 11 | Gateway | Upstreams platform `4080–4084` + `/knowledge/` | [x] local |

---

## 🟡 Post-go-live cercano

| # | Área | Tarea | Estado |
|---|------|-------|--------|
| 12 | Railway Core | Variables `WHATSAPP_*` | [ ] |
| 13 | WhatsApp | Callback Meta + smoke | [ ] |
| 14 | Observabilidad | Sentry backend + frontend | [ ] |
| 15 | Observabilidad | Uptime monitoring | [ ] |
| 16 | Backups | Secret + probar workflow | [ ] |
| 17 | Brand sync | SA/AkoeNet pendiente | 🔄 |
| 18 | Legal | Revisión abogado tenant access | [ ] |
| 19 | LifeFlow ops | Volume + JWT secret Railway | [ ] |
| 20 | Knowledge | Railway API + worker + ingest | [x] |

---

## ✅ Completado (referencia ops)

- Variables Railway Core Back (JWT, DATABASE_URL pooler, Stripe key)
- RLS lockdown SQL listo
- Gateway LifeFlow upstreams
- LifeFlow dominios prod + contrato `finance-api.json`
- LifeFlow SW v3, auth, onboarding v6.8.1, responsive móvil
- Script `sync-shared-brand.mjs`
- AI Gateway + analytics usage en código

---

*Actualizar al cerrar tareas de deploy o cambiar secrets en Railway/Supabase.*

---

## Runbook — incidencias comunes

Estado y Done → [`STATUS.md`](./STATUS.md).

### Webhook Stripe falla (Billing)

**Síntomas:** plan no actualiza · webhook 4xx/5xx · `smoke-billing-e2e.ps1` falla

Flujo esperado → [`ARCHITECTURE.md` §13](./ARCHITECTURE.md#13-billing-e2e).

1. Stripe → Webhooks → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`
2. Railway → `dakinis-billing` → logs (`webhook`)
3. Verificar `STRIPE_WEBHOOK_SECRET` y `STRIPE_SECRET_KEY` (test vs live)
4. SQL: `SELECT * FROM billing.subscriptions ORDER BY updated_at DESC LIMIT 5;`
5. Replay evento en Stripe → `.\scripts\smoke-billing-e2e.ps1`

### Gateway 502

1. Identificar prefijo (`/billing/`, `/core/`, …)
2. Railway → upstream → health directo
3. Verificar `DATABASE_URL`, `PORT` · redeploy si crash loop

### AkoeNet 503 `database_schema_outdated`

1. Logs `akoenet-backend` · `npm run migrate`
2. [`supabase/scripts/akoenet_backend_schema_check.sql`](./supabase/scripts/akoenet_backend_schema_check.sql)

### `@AI` no responde

1. `DAKINIS_INTERNAL_SERVICE_KEY` + `DAKINIS_INTERNAL_URL` en akoenet-backend
2. Redis / worker BullMQ · `.\scripts\smoke-ai.ps1`
3. Ver [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md)

### Hub dashboard vacío / stub

1. migr. `016`–`019`, `027`–`029` en prod
2. `SELECT hub.v1_get_dashboard('user-id');` en SQL Editor
3. Internal API logs · [`STATUS.md`](./STATUS.md) § Hub Mi día

### Supabase RLS sin política

Ejecutar [`034_rls_security_advisor_deny_policies.sql`](./supabase/migrations/034_rls_security_advisor_deny_policies.sql)

### Post-incidente

- [ ] Causa en CHANGELOG o issue
- [ ] Smoke relevante OK
- [ ] Riesgo en STATUS si aplica

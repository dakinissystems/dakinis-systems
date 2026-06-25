# Roadmap de plataforma — Dakinis Systems

> **Documento vivo.** Actualizar al completar cada fase o hito.  
> **Última revisión:** 19 mayo 2026  
> **Relacionado:** [`DAKINIS-ESTRUCTURA-TEMP.md`](./DAKINIS-ESTRUCTURA-TEMP.md) · [`PENDIENTES.md`](./PENDIENTES.md) · [`railway.env.example`](./railway.env.example)

---

## Cómo usar este documento

| Símbolo | Significado |
|---------|-------------|
| ✅ | Hecho |
| 🔄 | En progreso |
| ⬜ | Pendiente |
| 🔒 | Bloqueado por dependencia |

Marca `[x]` en las tareas al completarlas y añade una línea en [§ Registro de cambios](#registro-de-cambios).

---

## 1. Estado actual vs objetivo

### 1.1 GitHub (`DakinisSystems`)

| Repo | Rol | Estado |
|------|-----|--------|
| `dakinis-systems` | Orquestación (gateway, Docker, SQL, contratos) | ✅ |
| `dakinis-core` | Core API + Web | ✅ |
| `dakinis-auth` | IdP JWT central | ✅ |
| `dakinis-shared` | Paquetes compartidos (migrar a estructura DES) | 🔄 |
| `dakinis-landing` | Marketing | ✅ |
| `dakinis-streamautomator` | StreamAutomator | ✅ |
| `akoenet-client` / `akoenet-backend` | AkoeNet | ✅ |
| **`dakinis-ai`** | AI Gateway, agents, RAG | ✅ repo creado · 🔄 código en `platform/ai` local |
| **`dakinis-hub`** | Portal unificado | ✅ repo creado · ⬜ app pendiente |

**Objetivo organización GitHub:**

```
DakinisSystems/
├── Platform/     dakinis-systems, dakinis-core, dakinis-auth, dakinis-ai, dakinis-hub, dakinis-shared
├── Products/     streamautomator, akoenet-*, lifeflow, dnd
└── Marketing/    dakinis-landing
```

### 1.2 Railway — proyecto «Dakinis Platform»

| Servicio | Repo | Dominio | Estado |
|----------|------|---------|--------|
| Gateway | `dakinis-systems/gateway` | `api.dakinissystems.com` | ✅ |
| Landing | `dakinis-landing` | `dakinissystems.com` | ✅ |
| Auth | `dakinis-auth` | `auth.dakinissystems.com` | ✅ |
| Core Front | `dakinis-core/web` | `core.dakinissystems.com` | ✅ |
| Core Back | `dakinis-core/api` | interno vía gateway `/core/` | ✅ |
| Stream API / Worker / Scheduler | `dakinis-streamautomator` | `api.streamautomator.com` | ✅ |
| AkoeNet Client / API | `akoenet-*` | `akoenet.dakinissystems.com` | ✅ |
| Redis | Railway plugin | interno | ✅ |
| **AI API** | `dakinis-ai` | `ai.dakinissystems.com` | 🔄 local `:4020` · ⬜ deploy |
| **AI Worker** | `dakinis-ai` (worker) | interno | ⬜ |
| **Hub** | `dakinis-hub` | `hub.dakinissystems.com` | ⬜ |
| **Billing** | futuro `dakinis-billing` | `billing.dakinissystems.com` | ⬜ |
| PostgreSQL (Railway volume) | — | — | 🔄 **eliminar** → Supabase único |

### 1.3 Supabase — proyecto «Dakinis Production»

| Hoy | Objetivo (un schema por producto) | Estado |
|-----|-----------------------------------|--------|
| `dakinis_auth` | `auth` | ✅ schema auth operativo |
| `dakinis_core_prod` | `core` | ✅ tablas Core · 🔄 renombrar gradualmente |
| `public` (mezcla SA/AkoeNet) | vacío salvo extensiones | ⬜ migración gradual |
| — | `stream` | ⬜ crear schema |
| — | `akoenet` | ⬜ crear schema |
| — | `ai` + pgvector | ⬜ |
| — | `hub` | ⬜ |
| — | `billing` | ⬜ |
| — | `lifeflow` (o proyecto aparte) | ⬜ |

**Auth:** seguir con **Auth propio** (`dakinis-auth`). Supabase = BD + Storage + pgvector. **No** Supabase Auth.

**Realtime:** seguir con **Socket.io** (AkoeNet). No migrar a Supabase Realtime.

---

## 2. Arquitectura objetivo

```
Internet → Cloudflare → Railway (Gateway)
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
     Landing                Hub                  Auth
        │                     │                     │
        └──────────┬──────────┴──────────┬──────────┘
                   ▼                     ▼
              Core API              Billing (futuro)
                   │                     │
                   ├─ AI API ────────────┤
                   │      │
                   │      ▼
                   │  AI Workers (BullMQ)
                   │      │
                   ├─ Stream API / Worker / Scheduler
                   ├─ AkoeNet API / Client
                   └─ Redis (colas + cache + rate limit)
                              │
                              ▼
                         Supabase
                    (schemas + Storage + pgvector)
```

**Event bus (objetivo):** Core → Redis → BullMQ → AI Worker / Notifications / Hub / Stream / AkoeNet.  
**Hoy:** Core → HTTP → Dakinis AI (`dakinis-ai-client.js`). Migrar a colas en Fase 14.

---

## 3. Plan por fases (sin Big Bang)

> Regla: **nunca apagar Core ni StreamAutomator** durante la migración.

### Fase 0 — Backup ⬜

- [ ] `git clone --mirror` de todos los repos `DakinisSystems/*`
- [ ] Exportar variables Railway (todas las services → JSON local cifrado)
- [ ] Backup Supabase: `pg_dump` del proyecto Production
- [ ] Documentar DNS Cloudflare actual

### Fase 0.5 — Estandarizar repos existentes ⬜

Antes de mover código a `dakinis-ai` / `dakinis-hub`, unificar base en **todos** los repos:

- [ ] README con mismo formato (descripción, stack, dev, deploy)
- [ ] `.editorconfig`, `.gitignore`, `.nvmrc` (Node 20+)
- [ ] `.github/workflows/ci.yml` (lint + build + test)
- [ ] `SECURITY.md` / `CONTRIBUTING.md` en repos públicos
- [ ] Ramas: `main` (prod), `develop` (próxima), `feature/*`

### Fase 1 — Repos nuevos ✅ (parcial)

- [x] Crear `https://github.com/dakinissystems/dakinis-ai`
- [x] Crear `https://github.com/dakinissystems/dakinis-hub`
- [ ] Teams GitHub: Platform · Products · Infrastructure
- [ ] Secrets org: `SUPABASE_*`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `SENTRY_DSN`, `STRIPE_SECRET`, `RAILWAY_TOKEN`

### Fase 2 — Railway: nuevos servicios ⬜

**No borrar servicios existentes.** Solo añadir:

#### 2.1 AI API

1. Railway → proyecto **Dakinis Platform** → **New Service** → conectar repo `dakinis-ai`
2. Root directory: `/` (monorepo si aplica)
3. Start command: `npm start` (puerto `4020`)
4. Dominio custom: `ai.dakinissystems.com`
5. Variables compartidas + específicas (ver [§ 5 Railway](#5-playbook-railway-por-servicio))
6. **No** exponer Redis ni Worker públicamente

#### 2.2 AI Worker (segundo deployment del mismo repo)

1. **New Service** → mismo repo `dakinis-ai`
2. Start command: `npm run worker` (crear script)
3. Sin dominio público
4. Mismas variables + `WORKER_MODE=true`

#### 2.3 Hub

1. **New Service** → repo `dakinis-hub`
2. Build: Vite/React o SSR según stack elegido
3. Dominio: `hub.dakinissystems.com`
4. Variables: `VITE_DAKINIS_AUTH_URL`, `VITE_GATEWAY_URL`, `VITE_*_URL` por producto

#### 2.4 Eliminar PostgreSQL Railway ⬜

1. Verificar **todos** los servicios usan `DATABASE_URL` → Supabase pooler `:6543`
2. Smoke test Core + Auth + SA contra Supabase
3. Eliminar servicio/volumen `postgres-volume` en Railway
4. Actualizar `docs/railway.env.example` y este roadmap → ✅

### Fase 3 — Gateway ⬜

Archivo: `gateway/routes/default.conf`

| Prefijo | Upstream | Estado |
|---------|----------|--------|
| `/auth/` | Auth | ✅ |
| `/core/` | Core | ✅ |
| `/ai/` | AI API | 🔄 ruta existe · falta upstream prod |
| `/hub/` | Hub | ⬜ |
| `/streamautomator/` | SA | ✅ |
| `/akoenet/` | AkoeNet | ✅ |
| `/billing/` | Billing | ⬜ futuro |

**Pasos:**

- [ ] Añadir `set $u_hub hub-production.up.railway.app` (o custom domain)
- [ ] Bloque `location /hub/` → proxy al Hub
- [ ] Confirmar `/ai/` apunta a servicio AI desplegado (no solo `ai.railway.internal` en dev)
- [ ] Redeploy gateway en Railway
- [ ] Smoke: `curl https://api.dakinissystems.com/ai/health`

### Fase 4 — Hub (MVP) ⬜

Repo `dakinis-hub` — **sin lógica de negocio**, solo consume APIs.

**Estructura inicial:**

```
dakinis-hub/
├── src/
│   ├── pages/       Dashboard, Login, Perfil, Launcher
│   ├── components/  Layout, widgets shell
│   ├── services/    auth, core, ai, stream, akoenet clients
│   └── widgets/     registro local → migrar a @dakinis/shared-ux
├── public/
└── .github/workflows/deploy-railway.yml
```

**MVP (semana 3):**

- [ ] Login vía Auth central (JWT)
- [ ] Dashboard con launcher «Mis aplicaciones»
- [ ] Perfil básico
- [ ] 1 widget placeholder por producto (Core ventas, LifeFlow score, SA calendario, AkoeNet usuarios)

### Fase 5 — Dakinis AI ⬜

Código fuente hoy: `platform/ai/` (local en `dakinis-systems`). **Migrar** a repo `dakinis-ai`.

**Estructura objetivo:**

```
dakinis-ai/
├── src/
│   ├── gateway/      routing, auth service key
│   ├── providers/    OpenAI, stub
│   ├── agents/       core-advisor, lifeflow-coach…
│   ├── workers/      OCR, embeddings, RAG, moderation
│   ├── analytics/    usage
│   ├── routes/       /v1/*
│   └── prompts/      versionados
├── tests/
├── Dockerfile
└── docker-compose.yml
```

**MVP deploy (semana 2):**

- [x] `GET /health` (local)
- [x] Agents registry + prompts versionados (local)
- [x] `POST /v1/core/advisor`, `/v1/agents/*` (local)
- [ ] Push código a repo `dakinis-ai`
- [ ] CI GitHub Actions → deploy Railway
- [ ] Core prod: `DAKINIS_AI_BASE_URL=https://ai.dakinissystems.com` (o vía gateway `/ai/`)

**Worker (separado del API):**

- [ ] Colas BullMQ: `ocr`, `embeddings`, `rag-ingest`, `moderation`
- [ ] OCR / embeddings **nunca** en el proceso HTTP del API

### Fase 6 — Redis como centro ⬜

Un solo Redis Railway para:

| Uso | Cola / prefijo |
|-----|----------------|
| BullMQ jobs | `ocr`, `embeddings`, `scheduler`, `stripe`, `webhooks` |
| AI cache | `ai:cache:*` |
| Rate limit | `rl:*` |
| Session cache | `sess:*` |
| AkoeNet presence | `presence:*` |
| Notifications | `notifications` |

**Pasos:**

- [ ] Documentar prefijos en `docs/contracts/redis-queues.json` (crear)
- [ ] Crear colas vacías (infra only, sin cambiar apps aún)
- [ ] Migrar StreamAutomator scheduler a colas compartidas (gradual)

### Fase 7 — Supabase: schemas (sin mover tablas aún) ⬜

Ejecutar en SQL Editor del proyecto **Dakinis Production**:

```sql
-- Extensiones (una vez)
CREATE EXTENSION IF NOT EXISTS vector;

-- Schemas lógicos (nuevo naming)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS stream;
CREATE SCHEMA IF NOT EXISTS akoenet;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS hub;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS lifeflow;

COMMENT ON SCHEMA core IS 'Dakinis One — migración desde dakinis_core_prod';
```

- [ ] Ejecutar bootstrap ampliado (script `docs/supabase/schemas/00-bootstrap-schemas-v2.sql` — crear)
- [ ] **No** mover tablas todavía
- [ ] Actualizar `POSTGRES_SCHEMA` en servicios solo cuando cada migración esté lista

### Fase 8 — Supabase: migración gradual de tablas ⬜

Orden recomendado (menor riesgo primero):

| Orden | Origen | Destino | Notas |
|-------|--------|---------|-------|
| 1 | `dakinis_auth.*` | `auth.*` | views + rename o `ALTER SCHEMA` |
| 2 | `dakinis_core_prod.*` | `core.*` | Core API: dual-read period |
| 3 | tablas SA en `public` | `stream.*` | SA cambia `search_path` |
| 4 | tablas AkoeNet en `public` | `akoenet.*` | resolver duplicados `Users`/`users` |
| 5 | nuevas tablas IA | `ai.*` | documents, chunks, embeddings… |
| 6 | hub widgets prefs | `hub.*` | post-MVP Hub |
| 7 | Stripe customers/subscriptions | `billing.*` | post-servicio Billing |

**Por cada migración:**

1. Crear tablas en schema nuevo
2. Backfill + trigger sync (opcional)
3. Dual-write en app
4. Cutover lecturas
5. Drop legacy / dejar view compat

### Fase 9 — Supabase Storage ⬜

Buckets (no archivos en Railway):

| Bucket | Uso |
|--------|-----|
| `avatars` | Perfil usuario |
| `media` | AkoeNet, SA |
| `receipts` | LifeFlow OCR |
| `documents` | Core CRM adjuntos |
| `thumbnails` | previews |
| `ocr` | temp OCR |
| `exports` | CSV/PDF export |
| `logos` / `banners` | tenant branding |

- [ ] Crear buckets + políticas RLS por tenant
- [ ] Core: subir adjuntos CRM → Storage (sustituir local si existe)
- [ ] LifeFlow: recibos → `receipts/`

### Fase 10 — Supabase pgvector (schema `ai`) ⬜

```sql
CREATE TABLE ai.documents (...);
CREATE TABLE ai.chunks (...);
CREATE TABLE ai.embeddings (
  id UUID PRIMARY KEY,
  chunk_id UUID REFERENCES ai.chunks(id),
  embedding vector(1536)
);
CREATE TABLE ai.conversations (...);
CREATE TABLE ai.messages (...);
CREATE TABLE ai.agents (...);
CREATE TABLE ai.usage (...);
```

- [ ] SQL en `docs/supabase/schemas/13-ai-pgvector.sql` (crear)
- [ ] Worker embeddings escribe aquí
- [ ] RAG ingest desde `docs/knowledge/`

### Fase 11 — Shared / DES ⬜

Reorganizar `dakinis-shared` (y paquetes en `dakinis-systems/packages/`):

```
packages/
├── shared-brand/
├── shared-ux/
├── shared-ai/
├── shared-loading/
├── shared-icons/
├── shared-illustrations/
├── design-audit/
└── sdk/          ← @dakinis/sdk (CoreClient, AuthClient, DakinisAI)
```

- [x] Paquetes DES creados en repo control (may 2026)
- [ ] Publicar `@dakinis/sdk` en npm privado o GitHub Packages
- [ ] Hub + AI + Core consumen SDK unificado

### Fase 12 — Core deja de llamar OpenAI directo ⬜

- [x] Copilot Core → Dakinis AI HTTP (local)
- [ ] Verificar prod: Core **nunca** tiene `OPENAI_API_KEY` (solo AI service)
- [ ] LifeFlow → AI Gateway
- [ ] StreamAutomator generación posts → AI
- [ ] AkoeNet resúmenes → AI

### Fase 13 — Billing separado ⬜

- [ ] Repo `dakinis-billing` (futuro, no crear aún)
- [ ] Mover webhooks Stripe Core → Billing
- [ ] Hub muestra facturación vía Billing API
- [ ] Schema `billing` en Supabase

### Fase 14 — Event bus (Redis + BullMQ) ⬜

- [ ] Core publica eventos a Redis (extender `event-bus.js`)
- [ ] AI Worker consume `DAKINIS_EVENTS` de `@dakinis/shared-ai`
- [ ] Hub recibe notificaciones vía cola
- [ ] Deprecar HTTP directo Core→AI para jobs largos

### Fase 15 — Hub widgets reales ⬜

| Producto | Widget | API fuente |
|----------|--------|------------|
| Core | Ventas / pedidos hoy | `/api/tenant/restaurant/orders` |
| LifeFlow | Score financiero | LifeFlow API |
| Stream | Próximo stream | SA API |
| AkoeNet | Usuarios online | AkoeNet API |

- [ ] Cada producto registra en `HUB_WIDGET_REGISTRY` (`shared-ux`)
- [ ] Hub hace fetch paralelo con JWT del usuario

### Fase 16 — Marketplace Hub ⬜

WhatsApp · Stripe · Discord · Google · Meta · Telegram — instalación + config desde Hub.

### Fase 17 — LifeFlow / DND ⬜

- LifeFlow: schema `lifeflow` o Supabase proyecto independiente si SaaS autónomo
- DND: sin backend (localStorage)

---

## 4. Calendario sugerido (6 semanas)

| Semana | Entregables | Estado |
|--------|-------------|--------|
| **S1** | Backup · schemas Supabase vacíos · Redis colas · eliminar PG Railway | ⬜ |
| **S2** | Push `dakinis-ai` · deploy AI API · Core→AI prod · SDK | 🔄 AI local OK |
| **S3** | Scaffold `dakinis-hub` · deploy · gateway `/hub/` · MVP dashboard | ⬜ |
| **S4** | Shared/DES publish · CI/CD todos repos · design-audit en CI | 🔄 DES local OK |
| **S5** | Billing plan · AI Worker · pgvector · Knowledge ingest | ⬜ |
| **S6** | Marketplace · migración tablas `core`/`stream` · LifeFlow tile Hub | ⬜ |

---

## 5. Playbook Railway por servicio

### Variables compartidas (Railway Shared Variables)

Crear en proyecto **Dakinis Platform** → Shared Variables:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
REDIS_URL
JWT_SECRET
SENTRY_DSN
STRIPE_SECRET_KEY
OPENAI_API_KEY
```

Cada servicio referencia `${{shared.VAR}}` y añade solo las propias.

### AI API (`dakinis-ai`)

```env
NODE_ENV=production
PORT=4020
DATABASE_URL=${{shared.SUPABASE_URL}}   # pooler :6543
POSTGRES_SCHEMA=ai
REDIS_URL=${{shared.REDIS_URL}}
OPENAI_API_KEY=${{shared.OPENAI_API_KEY}}
DAKINIS_AI_SERVICE_KEY=<generar 32+ chars>
CORS_ORIGIN=https://core.dakinissystems.com,https://hub.dakinissystems.com
SENTRY_DSN=${{shared.SENTRY_DSN}}
```

**Networking:** solo Gateway y Core internos. Dominio público opcional `ai.dakinissystems.com` para debug; preferir `/ai/` vía gateway.

### AI Worker

```env
WORKER_MODE=true
REDIS_URL=${{shared.REDIS_URL}}
DATABASE_URL=...
OPENAI_API_KEY=...
DAKINIS_AI_SERVICE_KEY=...
# Sin PORT público
```

### Hub (`dakinis-hub`)

```env
VITE_DAKINIS_AUTH_URL=https://auth.dakinissystems.com/auth
VITE_GATEWAY_URL=https://api.dakinissystems.com
VITE_CORE_URL=https://core.dakinissystems.com
VITE_HUB_URL=https://hub.dakinissystems.com
VITE_STREAM_URL=https://streamautomator.com
VITE_AKOENET_URL=https://akoenet.dakinissystems.com
VITE_SENTRY_DSN=...
```

### Core Back (actualizar)

```env
DAKINIS_AI_BASE_URL=https://api.dakinissystems.com/ai
# o https://ai.dakinissystems.com
DAKINIS_AI_SERVICE_KEY=<mismo que AI API>
# Eliminar OPENAI_API_KEY de Core cuando AI prod esté estable
```

### Servicios que NO deben ser públicos

- Redis
- AI Worker
- Stream Worker / Scheduler (solo internos o vía gateway autenticado)

### Servicios públicos (Cloudflare → Gateway)

- Landing · Hub · Gateway · Auth (login) · Core Web

---

## 6. Playbook Supabase

### Proyecto único por entorno

| Entorno | Proyecto Supabase |
|---------|-------------------|
| Production | Dakinis Production |
| Staging | Dakinis Staging (opcional) |
| Dev local | SQLite (Core) + Supabase dev project |

### Orden de ejecución SQL (nuevas migraciones)

1. `00-bootstrap-schemas-v2.sql` — schemas lógicos + `vector`
2. Scripts producto en su schema (`core/`, `ai/`, …)
3. `004-rls-lockdown-all.sql` (adaptar por schema)
4. `006b-rls-policies-missing-tables.sql`
5. `99-verify-all-tables.sql`

### Connection string (todos los servicios Node)

```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
```

- **Runtime app:** puerto **6543** (pooler)
- **Backups / migraciones:** puerto **5432** (directo)

### RLS

- API accede con `service_role` desde Railway (sin PostgREST público)
- RLS deny-by-default (`004`, `006`) — mantener por schema al migrar

---

## 7. CI/CD (todos los repos)

Plantilla GitHub Actions:

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc' }
      - run: npm ci
      - run: npm test
      - run: npm run build
```

Deploy Railway (rama `main`):

```yaml
# .github/workflows/deploy-railway.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: berviantoleo/railway-deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: <nombre-servicio-railway>
```

---

## 8. Dominios finales

| Dominio | Servicio |
|---------|----------|
| `dakinissystems.com` | Landing |
| `hub.dakinissystems.com` | Hub |
| `auth.dakinissystems.com` | Auth |
| `core.dakinissystems.com` | Core Web |
| `api.dakinissystems.com` | Gateway |
| `ai.dakinissystems.com` | AI API (opcional; preferir gateway) |
| `billing.dakinissystems.com` | Billing (futuro) |
| `streamautomator.com` | StreamAutomator |
| `akoenet.dakinissystems.com` | AkoeNet |

---

## 9. Próximos pasos inmediatos (esta semana)

1. **Fase 0** — backup repos + variables Railway + pg_dump Supabase
2. **Fase 0.5** — CI base en `dakinis-ai` y `dakinis-hub` (repos vacíos → scaffold)
3. **Migrar** `platform/ai/` → push inicial a `dakinis-ai` con Dockerfile + Railway service
4. **Core Back Railway** — añadir `DAKINIS_AI_BASE_URL` + `DAKINIS_AI_SERVICE_KEY`
5. **Supabase** — ejecutar schemas vacíos (`auth`, `core`, `ai`, …) sin mover tablas
6. **Gateway** — verificar upstream `/ai/` apunta al servicio desplegado

---

## Registro de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-05-19 | Documento creado. Repos `dakinis-ai` y `dakinis-hub` existen en GitHub. AI modular local (`platform/ai`, 18 tests). WhatsApp inbox API en Core. DES paquetes en repo control. |
| | |
| | |

*Añade filas arriba al completar hitos.*

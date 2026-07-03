# Dakinis Systems — Arquitectura

> **Estado vigente** · julio 2026 · decisiones de arquitectura y capas.  
> Estado operativo → [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md) · Productos → [`PRODUCTS.md`](./PRODUCTS.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md)

---

## Tres capas

No mezclar **Infrastructure**, **Platform** ni **Products**. Tabla de estado: [PLATFORM-STATUS § Ecosistema](./PLATFORM-STATUS.md#estado-del-ecosistema).

```mermaid
flowchart TB
  subgraph infra [Infrastructure]
    GW[Gateway]
    REDIS[(Redis)]
    SB[(Supabase)]
    RAIL[Railway]
    STOR[Storage]
    OBS[Observability]
  end

  subgraph platform [Platform]
    AUTH[Auth]
    HUB[Hub]
    AI[AI Platform]
    BILL[Billing]
    NOTIF[Notifications]
    SRCH[Search]
    KNOW[Knowledge]
    EVT[Events]
  end

  subgraph products [Products]
    CORE[Core]
    LF[LifeFlow]
    SA[StreamAutomator]
    AN[AkoeNet]
    TT[Tabletop]
    LAND[Landing]
  end

  infra --> platform
  platform --> products
```

| Capa | Qué incluye | Qué no incluye |
|------|-------------|----------------|
| **Infrastructure** | Gateway, Redis, Supabase, Railway, Storage, Observability | Lógica de negocio de productos |
| **Platform** | Auth, Hub, AI, Billing, Notifications, Search, Knowledge, Events, DES, SDK | Core, LifeFlow, SA… |
| **Products** | Core (Business OS), LifeFlow, StreamAutomator, AkoeNet, Tabletop, Landing | Auth, Billing, AI engine |

**Reglas:**

1. **Core es producto**, no plataforma.
2. Los productos **solo consumen** platform vía Gateway o Internal API — nunca cross-DB.
3. **Billing es plataforma en prod** (v0.2.0) — no roadmap.
4. **Knowledge es servicio aparte** — AI lo consume; no al revés.

---

## Infrastructure

### Gateway — ✅

`api.dakinissystems.com` · Nginx · JWT (`/_auth_check`) · rate limit · CORS.

Prefijos: `/auth/` · `/core/` · `/finance/` · `/billing/` · `/notifications/` · `/search/` · `/ai/` · `/internal/` · SA · AkoeNet

Config: [`gateway/routes/default.conf`](../gateway/routes/default.conf) · reglas: [`rules.md`](./rules.md)

### Redis — ✅

Cache · colas · event bus (lists → BullMQ roadmap). Referencia: `${{Redis.REDIS_URL}}`.

### Supabase — 🔄

PostgreSQL multi-schema · pooler `:6543` · identidad `dakinis_auth`.

Schema `meta`: `function_versions` ✅ · `schema_versions` · `migration_history` · `feature_flags` ⬜

Orden SQL: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md)

### Railway — ✅

Contenedores · mapa 22 servicios: [PLATFORM-STATUS § Railway](./PLATFORM-STATUS.md#railway--mapa-de-servicios)

### Storage — ⬜

```
Storage → Supabase Storage / Cloudflare R2
         → Assets · Media · Documents · Exports
```

Prioridad: LifeFlow · Tabletop · Core · Knowledge

### Observability — 🔄

Logs · metrics · tracing (Sentry) · queue health · costes IA · `/health` por servicio.

---

## Platform

### Consumo desde productos

```
Product
    ↓
Gateway (api.dakinissystems.com)
    ↓
Auth · Billing · Notifications · Search · Knowledge · Storage
    ↓
Internal API (/internal/) — proxy opcional · mirror [`internal/`](../internal/)
```

Contrato: [`contracts/internal-api.json`](./contracts/internal-api.json)

### Auth — ✅

`dakinis-auth` · `auth.dakinissystems.com` · schema `dakinis_auth` · JWT central.

### Hub — 🔄

`dakinis-hub` · `hub.dakinissystems.com` · schema `hub`.

**Hoy:** launcher + widgets. **Objetivo:** Mi día → Actividad → IA → Notificaciones → Widgets → Apps.

Registries: `HUB_DASHBOARD_SECTIONS` · `HUB_WIDGET_REGISTRY` en `@dakinis/shared-ux`.

### AI Platform — 🔄

`dakinis-ai` · `:4020` · `/ai/` · schema `ai`.

```
AI Platform
├── LLM · Agents
├── Knowledge (consume RAG sources)
├── Vision · Speech · OCR
├── Forecast · Recommendations · Automation · Planner
└── Embeddings (pgvector · AI Worker)
```

Contrato: [`contracts/dakinis-ai.json`](./contracts/dakinis-ai.json)

Agents: `@dakinis/shared-ai/agents.js` — `core-advisor`, `lifeflow-coach`, `support-agent`, `knowledge-agent`, etc.

### Knowledge — 🔄 scaffold

Servicio **independiente** de AI y Search.

```
Knowledge
├── Documents · Policies · FAQ · Wiki
├── Product docs · User docs
├── RAG sources
└── Embeddings → Search semantic
```

Mirror local: `knowledge/` · puerto **4084** · repo [`dakinis-knowledge`](https://github.com/dakinissystems/dakinis-knowledge) · layout `api/` + `workers/` · schema `knowledge` ([025](./supabase/migrations/025_knowledge_schema.sql))

Contrato: [`contracts/knowledge.json`](./contracts/knowledge.json)

### Billing — ✅ prod

`dakinis-billing` · v0.2.0 · `/billing/` · schema `billing` · Stripe Live.

Planes · suscripciones · checkout · portal · webhooks · Redis events → Core `business.plan`.

Core **no** tiene SDK Stripe — proxy `/api/public/stripe/*` hacia Billing.

Contrato: [`contracts/billing.json`](./contracts/billing.json)

### Notifications — 🔄 scaffold

`dakinis-notifications` · `/notifications/` · puerto 4081.

Canales objetivo: Email · Push · Discord · Slack · WhatsApp · SMS · In-App.

Catálogo: `NOTIFICATION_CHANNELS` en `@dakinis/shared-ai`. Contrato: [`contracts/notifications.json`](./contracts/notifications.json)

### Search — 🔄 scaffold

`dakinis-search` · `/search/` · puerto 4082.

Global Search · Index · Autocomplete · Semantic · Knowledge Search · AI Search.

Scopes UI: `SEARCH_SCOPES` en `@dakinis/shared-ux/command-palette.js`.

### Events — 🔄

```
Events → Redis → BullMQ → Queues → Workers → Retries → DLQ
```

Hoy: Redis lists + `event-bus.js` Core · tipos `DAKINIS_EVENTS` en `@dakinis/shared-ai/events.js`.

### DES — ✅

Monorepo [`dakinis-shared`](https://github.com/dakinissystems/dakinis-shared) · mirror `packages/`.

Foundations → Tokens → Components → Patterns → Layouts → Animations · A11y · Icons · Charts · Copywriting.

No se despliega en Railway. Ver [`GITHUB-ORG.md`](./GITHUB-ORG.md).

### SDK — 🔄

`@dakinis/sdk` — Auth · Billing · Notifications · Hub · AI · Storage ⬜ · Search · Knowledge 🔄

Implementado: `ai`, `core`, `lifeflow`, `platform-services` · mirror [`packages/sdk/`](../packages/sdk/)

---

## Products

Detalle funcional por producto: [`PRODUCTS.md`](./PRODUCTS.md).

| Producto | Repo | BD | Consume platform |
|----------|------|-----|------------------|
| **Core** (Business OS) | `dakinis-core` | `dakinis_core_prod` | Auth, AI, Billing, Notifications |
| **LifeFlow** | `lifeflow` | SQLite → `lifeflow` | Auth, AI |
| **StreamAutomator** | `dakinis-streamautomator` | `stream` | Auth (Stripe propio) |
| **AkoeNet** | `akoenet-*` | `akoenet` | Auth, Notifications |
| **Tabletop** | `dakinis-tabletop` | SQLite → ⬜ | Auth, AI (roadmap) |
| **Landing** | `dakinis-landing` | — | — |

**Regla BD:** sin queries cross-schema desde apps producto. Sync vía HTTP + eventos.

---

## Bases de datos por schema

| Schema | Capa | Notas |
|--------|------|-------|
| `dakinis_auth` | Platform | Identidad |
| `billing` | Platform | Billing prod |
| `ai` | Platform | AI + embeddings |
| `hub` | Platform | Hub prefs, widgets |
| `knowledge` | Platform | ⬜ |
| `meta` | Infra/governance | function_versions, flags |
| `dakinis_core_prod` → `core` | Product | Core ERP |
| `stream` | Product | StreamAutomator |
| `akoenet` | Product | AkoeNet |
| `lifeflow` | Product | ⬜ |
| `audit` | Platform | Logs, jobs |

Tabletop hoy: SQLite volume · schema Supabase ⬜

---

## LifeFlow Engine (arquitectura)

Motor **independiente de UI** — el producto real de LifeFlow:

```
Engine (Score · Forecast · Scenario · Risk · Retirement · Investment)
    ↑
API · Web · Mobile · Hub widgets
```

---

## Marketplace (capacidad platform)

Apps · Plugins · Templates · Automations · AI Agents · Themes — UI Hub ⬜

---

## Contratos HTTP

Índice: [`contracts/README.md`](./contracts/README.md)

| Contrato | Prefijo | Capa |
|----------|---------|------|
| auth.json | `/auth/` | Platform |
| billing.json | `/billing/` | Platform |
| dakinis-ai.json | `/ai/` | Platform |
| notifications.json | `/notifications/` | Platform |
| search.json | `/search/` | Platform |
| knowledge.json | `/knowledge/` | Platform |
| internal-api.json | `/internal/` | Platform |
| core-api.json | `/core/` | Product |
| finance-api.json | `/finance/` | Product |
| streamautomator-api.json | SA | Product |
| akoenet-backend.json | AkoeNet | Product |

---

## Repos y carpetas locales

| Capa | Repos GitHub | Mirror local (gitignored) |
|------|--------------|---------------------------|
| Orquestación | `dakinis-systems` | — |
| Platform | auth, ai, hub, billing, notifications, search, shared | `platform/`, `billing/`, … |
| Products | core, lifeflow, streamautomator, akoenet-*, tabletop, landing | `platform/core`, `apps/`, `finanzas/`, `DND/` |

Carpeta `DND/` = desarrollo local **Tabletop** (repo `dakinis-tabletop`). En documentación usar siempre **Tabletop**.

---

## Diagrama de despliegue (Railway)

```
Gateway → Auth → AI (+ Worker) → Hub → Core (API + Web)
              → Billing · Notifications · Search (platform)
              → LifeFlow · Tabletop · SA (+ workers) · AkoeNet · Landing
              → Redis · Supabase (externo)
```

Mapa completo: [PLATFORM-STATUS § Railway](./PLATFORM-STATUS.md#railway--mapa-de-servicios)

---

*Actualizar al añadir servicios platform, cambiar gateway o schemas Supabase.*

# Dakinis Systems — Arquitectura

> **Estado vigente** · mayo 2026 · Solo arquitectura actual + objetivo de plataforma.  
> Operaciones → [`OPERATIONS.md`](./OPERATIONS.md) · Roadmap → [`ROADMAP.md`](./ROADMAP.md) · Productos → [`PRODUCTS.md`](./PRODUCTS.md)

---

## Valoración global (mayo 2026)

| Área | Nota | Comentario |
|------|------|------------|
| Arquitectura | 9.9/10 | Platform vs Products bien separados en repos y BD |
| Escalabilidad | 9.8/10 | AI Gateway, schemas Supabase, workers roadmap |
| Organización Git | 10/10 | Un repo por servicio/producto |
| Separación productos | 10/10 | Sin BD compartida entre productos |
| Railway | 9.8/10 | Mapa Fase 1 definido; workers transversales pendientes |
| Supabase | 9.7/10 | Multi-schema 000–019; cutover core/stream pendiente |
| IA | 9.5/10 | Agents + gateway; Knowledge y capacidades ampliadas en roadmap |
| UX / DES | 9.6/10 | DES maduro; Hub aún launcher-first en UI |
| Documentación | 10/10 | Contratos, legal, SQL, docs divididos |

**Conclusión:** la arquitectura ya se parece a una plataforma SaaS multi-producto. El trabajo principal es **ejecutar** el roadmap (Hub centro, cutover Supabase, servicios transversales).

---

## Modelo mental: Platform ≠ Products

**Core no es plataforma. Core es un producto** (Business Operating System).

```
┌─────────────────────────────────────────────────────────────┐
│  PLATFORM (servicios transversales)                         │
│  Auth · Gateway · AI · Hub · DES · Billing* · Notifications*      │
│  Events* · Search* · Knowledge* · Storage* · Observability*         │
└─────────────────────────────────────────────────────────────┘
         │ HTTP / Internal API / Event bus (nunca cross-DB)
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTS (negocio independiente)                           │
│  Core · LifeFlow · StreamAutomator · AkoeNet · Tabletop     │
└─────────────────────────────────────────────────────────────┘

* = diseñado / schema parcial — ver ROADMAP.md
```

### Repos GitHub

| Capa | Repos |
|------|-------|
| **Platform** | `dakinis-auth`, `dakinis-ai`, `dakinis-hub`, [`dakinis-billing`](https://github.com/dakinissystems/dakinis-billing), [`dakinis-notifications`](https://github.com/dakinissystems/dakinis-notifications), [`dakinis-search`](https://github.com/dakinissystems/dakinis-search) |
| **DES (platform)** | `dakinis-shared` — monorepo npm (`shared-des`, `shared-brand`, `shared-layouts`…). Fuente dev: `dakinis-systems/packages/` |
| **Products** | `dakinis-core`, `lifeflow`, `dakinis-streamautomator`, `akoenet-*`, `dakinis-tabletop` |
| **Marketing** | `dakinis-landing` |
| **Orquestación** | `dakinis-systems` (gateway, Docker, SQL, contratos, legal) |

Carpetas locales ignoradas: `apps/`, `platform/`, `finanzas/`, `DND/` (repo `dakinis-tabletop`).

---

## Hub — centro del ecosistema (objetivo)

**Hoy:** launcher de apps + widgets.  
**Objetivo:** home del usuario — las apps son secundarias.

```
Hub (hub.dakinissystems.com)
├── Mi día              ← agenda, tareas, resumen IA
├── Actividad           ← timeline cross-producto
├── IA                  ← resumen + recomendaciones
├── Notificaciones      ← in-app (+ canales vía servicio Notifications)
├── Widgets             ← salud financiera, ventas, streams…
└── Aplicaciones        ← launcher (último, no primero)
```

Implementación parcial: `HUB_DASHBOARD_SECTIONS` y `HUB_WIDGET_REGISTRY` en `@dakinis/shared-ux`.

---

## Internal API (regla de integración)

Los productos **no hablan entre sí**. Hablan con **Internal API** (platform):

```
Product (Core | LifeFlow | SA | AkoeNet)
    │
    ▼
Internal API  (/internal/* — auth service-to-service)
    ├── /internal/users
    ├── /internal/profile
    ├── /internal/events
    ├── /internal/storage
    ├── /internal/search
    ├── /internal/knowledge
    └── /internal/notifications
```

Contrato esqueleto: [`docs/contracts/internal-api.json`](./contracts/internal-api.json).

---

## Servicios de plataforma

### Auth — ✅ vigente

`auth.dakinissystems.com` · JWT central · gateway `/_auth_check`.

### Gateway — ✅ vigente

`api.dakinissystems.com` · Nginx · rate limit · CORS · proxy a todos los upstreams.  
Ver [`gateway/routes/default.conf`](../gateway/routes/default.conf) · [`docs/rules.md`](./rules.md).

### AI — 🔄 en progreso

`platform/ai` · puerto `:4020` · Gateway `/ai/`.

```
AI Platform
├── LLM (chat, agents)
├── OCR
├── Embeddings
├── RAG (consulta Knowledge)
├── Vision / Speech / Transcription  ← roadmap
└── Prompt Registry / Agent Registry ← agents.js en shared-ai
```

**Knowledge es servicio separado** (no mezclado con AI):

```
Knowledge                    AI consulta Knowledge
├── PDF / Wiki               ──────────────────────► RAG
├── Documentos / FAQ
├── Policies / Productos
└── schema `ai` + futuro schema `knowledge`
```

### Billing — ⬜ producto interno (Fase 8)

Dominio objetivo: `billing.dakinissystems.com` · schema `billing`.

| Dominio | Entidades |
|---------|-----------|
| Planes | Starter, Growth, Pro, Lite, Premium… |
| Suscripciones | Stripe Customer Portal |
| Facturas | invoices |
| Licencias | SA, marketplace |
| Uso | consumo IA, storage |
| Cupones | promos |
| Marketplace | comisiones plugins |

Hoy: lógica Stripe parcial en **Core** → migrar a repo `dakinis-billing`.

### Notifications — ⬜ diseñado

Servicio transversal. Canales: `email`, `push`, `sms`, `whatsapp`, `discord`, `slack`, `webhooks`, `in-app`.

```
Core / LifeFlow / SA / AkoeNet
    │  evento (ej. invoice.created)
    ▼
Notifications Service
    ├── Email (SendGrid / Resend)
    ├── Push (Web Push / FCM)
    └── In-app (Hub + productos)
```

Catálogo canales: `@dakinis/shared-ai` → `NOTIFICATION_CHANNELS`.  
Contrato: [`docs/contracts/notifications.json`](./contracts/notifications.json).

### Search — ⬜ diseñado

Hub search global (Ctrl+K ampliado):

```
Buscar → Clientes · Facturas · Mensajes · Eventos · Documentación · Chats · IA
```

Backend objetivo: índice + embeddings · schema `hub` + worker Search.

Scopes UI: `SEARCH_SCOPES` en `@dakinis/shared-ux/command-palette.js`.

### Events — 🔄 parcial

Hoy: `event-bus.js` en Core (in-process) + tipos `DAKINIS_EVENTS` en `@dakinis/shared-ai`.

Objetivo platform:

```
Events
├── Redis
├── BullMQ
├── Queues + Workers
├── Dead Letter Queue
└── Retries
```

Ver `EVENT_BUS_QUEUES` en `@dakinis/shared-ai/events.js`.

### Storage — ⬜ diseñado

Objetivo: imágenes, documentos, videos, OCR input, exports, backups.

Opciones: Supabase Storage · Cloudflare R2 · S3.  
SDK stub: `@dakinis/sdk/storage`.

### Observability — ⬜ crítico en roadmap

```
Observability
├── Logs (structured)
├── Metrics (tokens, latencia, colas)
├── Tracing (requestId cross-service)
├── Errors (Sentry)
├── Costs (OpenAI, Railway, Supabase)
└── Queues / Redis / Railway health
```

---

## Bases de datos (aisladas)

| Servicio | BD | Schema / notas |
|----------|-----|----------------|
| Core | Supabase PostgreSQL | `dakinis_core_prod` → cutover `core` |
| Auth | Supabase | `dakinis_auth` |
| Billing | Supabase | `billing` (004 migración) |
| StreamAutomator | Supabase / propia | `stream` |
| AkoeNet | Supabase / propia | `akoenet` |
| LifeFlow | SQLite prod · PostgreSQL futuro | `lifeflow` (007) |
| AI | Supabase | `ai` (008) |
| Hub | Supabase | `hub` (009) |
| Audit | Supabase | `audit` (010) |
| Tabletop | SQLite + JWT (`dakinis-tabletop`) | `tabletop-api.dakinissystems.com` |

**Regla:** sincronización solo vía HTTP + eventos. No queries cross-schema desde apps producto.

---

## SDK — estructura objetivo

```
@dakinis/sdk
├── auth        → tokens, refresh, verify
├── billing     → planes, suscripciones, usage
├── hub         → widgets, dashboard, timeline
├── ai          → DakinisAI, agents (✅ parcial)
├── storage     → upload, signed URLs
├── notifications → subscribe, preferences
├── events      → publish, subscribe
└── search      → query, scopes
```

Implementación actual: `ai`, `core`, `lifeflow` · stubs en `sdk/src/modules/`.

---

## AI Agents (no solo prompts)

Registro canónico en `@dakinis/shared-ai/agents.js`:

| Agent | Producto | Rol |
|-------|----------|-----|
| `core-advisor` | Core | Copilot BOS |
| `sales-advisor` | Core | CRM / pipeline |
| `restaurant-advisor` | Core | Restaurante vertical |
| `inventory-coach` | Core | Stock / caducidad |
| `lifeflow-coach` | LifeFlow | Coach financiero |
| `finance-coach` | LifeFlow | alias roadmap |
| `support-agent` | Platform | Soporte + RAG |
| `knowledge-agent` | Platform | Knowledge Hub |
| `marketplace-agent` | Hub | Plugins / apps |

---

## LifeFlow Engine (arquitectura objetivo)

Motor de simulación **independiente de la UI**:

```
LifeFlow Engine
├── Score Engine
├── Forecast Engine
├── Scenario Engine
├── Risk Engine
├── Retirement Engine
└── Investment Engine
         ▲
    Web · Android · API · Hub widgets
```

API objetivo: `POST /v1/score` · `/v1/coach` · `/v1/scenario` · `GET /v1/cities/compare`.

---

## Marketplace (estructura objetivo)

```
Marketplace (Hub)
├── Apps
├── Plugins
├── Themes
├── Templates
├── Automations
└── AI Agents
```

---

## Design System (DES) — capas

```
DES (@dakinis/shared-des + monorepo dakinis-shared)
├── Foundations     ✅ shared-brand — surfaces, spacing, motion, themes
├── Components      🔄 shared-ux — Card, Timeline, 8 AI components
├── Patterns        ✅ registries + empty/loading/errors
├── Layouts         ✅ shared-layouts — AppShell, DashboardTemplate
├── Charts          🔄 shared-charts — catálogo
├── Product Themes  ✅ acento por producto
└── Audit           ✅ design-audit
```

DES no se despliega en Railway. Es **platform en GitHub** — ver [`GITHUB-ORG.md`](./GITHUB-ORG.md).

---

## Diagrama de despliegue (Railway Fase 1)

Ver detalle operativo en [`OPERATIONS.md`](./OPERATIONS.md).

```
Gateway → Auth → AI API → AI Worker → Hub → Core API → Core Web
                              ↓
                    (roadmap: Notifications, Search, Media workers)
                              ↓
         LifeFlow API/Web · Stream* · AkoeNet* · Landing · Redis
```

---

## Contratos HTTP

Índice: [`docs/contracts/README.md`](./contracts/README.md).

| Contrato | Prefijo |
|----------|---------|
| auth.json | `/auth/` |
| core-api.json | `/core/` |
| dakinis-ai.json | `/ai/` |
| finance-api.json | `/finance/` |
| streamautomator-api.json | `/streamautomator/` |
| akoenet-backend.json | `/akoenet/` |
| internal-api.json | `/internal/` (objetivo) |
| notifications.json | `/notifications/` (objetivo) |

---

*Mantener este archivo alineado con cambios de gateway, schemas Supabase y nuevos servicios platform.*

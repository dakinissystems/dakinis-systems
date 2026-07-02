# Dakinis Systems — Roadmap

> Fases, prioridades y servicios futuros. Arquitectura vigente → [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Prioridad ejecutiva (mayo 2026)

El mayor trabajo ya **no** es rediseñar arquitectura. Es **ejecutar**:

1. **Hub como centro** — Mi día, actividad, IA, notificaciones antes que launcher
2. **Cutover Supabase** — schemas 016–019, core + stream
3. **AI service completo** — workers OCR/RAG + agent registry en prod
4. **Servicios transversales** — Billing, Notifications, Observability

---

## Fases de plataforma

### Fase 1 — Railway ✅ en progreso

- Mapa servicios §18 OPERATIONS
- LifeFlow Web + API en prod ✅
- Eliminar `postgres-volume` cuando todo use Supabase pooler

### Fase 2 — Supabase

| Schema | Acción | Estado |
|--------|--------|--------|
| `dakinis_auth` | Solo identidad; sin datos negocio | 🔄 |
| `core` | Cutover `dakinis_core_prod` → `core` | ⬜ |
| `billing` | plans, subscriptions, invoices, usage | ⬜ repo |
| `stream` | campaigns, metrics, jobs… | 🔄 |
| `akoenet` | servers, channels, messages… | ⬜ |
| `lifeflow` | accounts, goals, scenarios… | ⬜ empezar |
| `ai` | embeddings, conversations, agents | 🔄 |
| `hub` | widgets, timeline, notifications, search_index | 🔄 |
| `audit` | security_events, api_logs | ⬜ |

Scripts pendientes prod: `016`–`019` → [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md).

### Fase 3 — AI Platform

| Capacidad | Estado |
|-----------|--------|
| Chat / Agents | ✅ gateway + registry |
| OCR | ✅ parcial LifeFlow/Core |
| RAG | 🔄 consulta Knowledge |
| Embeddings batch | ⬜ AI Worker |
| Vision / Speech / Transcription | ⬜ |
| Summaries / Recommendations | ⬜ |
| Classification / Extraction / Forecast | ⬜ |
| Planner / Automation | ⬜ |
| Prompt Registry versionado | ✅ prompts/ en repo |

### Fase 4 — Hub (no launcher)

| Entregable | Estado |
|------------|--------|
| Dashboard «Mi día» | ⬜ UI; secciones definidas en shared-ux |
| Activity timeline | 🔄 tipos evento |
| Notificaciones cross-producto | ⬜ servicio |
| Command Palette + Search global | 🔄 scopes ampliados |
| Widgets por producto | 🔄 registry ampliado |
| Marketplace UI | ⬜ |
| Knowledge Hub UI | ⬜ |

### Fase 5 — Event bus platform

```
Redis → BullMQ → Workers → DLQ → Retries
```

- Publicación desde Core, Billing, AI
- Consumo: Notifications, Search index, Analytics
- Tipos: `DAKINIS_EVENTS` + `EVENT_BUS_QUEUES`

### Fase 6 — Servicios transversales

| Servicio | Fase | Repo |
|----------|------|------|
| **Billing** | 8 | `dakinis-billing` |
| **Notifications** | 5–6 | nuevo worker + API |
| **Search** | 6 | worker + hub API |
| **Knowledge** | 3–4 | ingest + UI |
| **Storage** | 5 | Supabase Storage / R2 |
| **Observability** | 5 | Sentry + métricas + costes IA |

### Fase 7 — LifeFlow producto completo

```
lifeflow/
├── api/       finance-api.dakinissystems.com
├── web/       finance.dakinissystems.com
├── mobile/    misma API
├── engine/    Score · Forecast · Scenario · Risk · Retirement · Investment
└── shared/
```

Integraciones: Hub widgets · AI coach · SSO `dakinis_auth` · schema `lifeflow`.

### Fase 8 — Billing separado

Stripe fuera de Core → `billing.dakinissystems.com`.

### Fase 9 — Event bus async (no HTTP largo)

Core → Redis → BullMQ → Workers → AI → Notifications → Hub.

---

## Railway — workers roadmap

| Worker | Rol | Cuándo |
|--------|-----|--------|
| AI Worker | OCR, embeddings, RAG batch | Fase 3 ✅ planificado |
| Notifications Worker | email, push, webhooks | Fase 5–6 |
| Scheduler Worker | cron, recordatorios | Fase 5 |
| Media Worker | resize, transcode | Fase 5 |
| Search Worker | index, reindex | Fase 6 |

No crear todos ahora — documentar en despliegue antes de escalar.

---

## Calendario 6 semanas (referencia)

| Semana | Entregables |
|--------|-------------|
| **S1** | Cutover Supabase stream/core · LifeFlow Railway ✅ · onboarding + responsive ✅ |
| **S2** | AI Worker prod · schema `ai` · BullMQ + Redis |
| **S3** | Hub «Mi día» + widgets reales · schema `hub` |
| **S4** | Schema `lifeflow` · SSO auth · LifeFlow Engine API v1 |
| **S5** | Billing repo · schema `billing` |
| **S6** | Notifications v1 · Observability baseline · AkoeNet schema |

---

## Core — posicionamiento producto

Vender como **Business Operating System**, no «ERP genérico»:

| Módulo | Estado |
|--------|--------|
| CRM | ✅ |
| Inventory | ✅ |
| Restaurant | ✅ vertical |
| Bookings / Appointments | ✅ |
| Invoices | ✅ |
| Messages / WhatsApp | 🔄 |
| AI Copilot | ✅ |
| Analytics | 🔄 |
| Marketplace plugins | ⬜ |

---

## Marketplace — estructura objetivo

- **Apps** — integraciones completas
- **Plugins** — módulos Core
- **Themes** — SA / AkoeNet
- **Templates** — workflows
- **Automations** — triggers + acciones
- **AI Agents** — agentes publicables

---

## Post-pilotos (no bloquean go-live)

- RAG PDF masivo (tras 30 días telemetría)
- Calendario global Core
- Dakinis Network comercial
- SSO Hub → AkoeNet / SA
- Stripe metered + Customer Portal
- Event bus SA / AkoeNet
- Observability module (`dakinis-observability` si escala)

---

## LifeFlow — pendientes producto

Ver [`OPERATIONS.md`](./OPERATIONS.md) § LifeFlow.

**Próximo código:** LifeFlow Engine API · tier Pro gates · PostgreSQL prod · Hub tile + SSO.

**Fuera de alcance MVP:** contabilidad como mensaje principal · PSD2 real · sync offline API.

---

*Actualizar al cerrar cada fase o al cambiar prioridades de negocio.*

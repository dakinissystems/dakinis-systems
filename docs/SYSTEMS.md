# Sistemas — mapa Dakinis

> Una pantalla · detalle capas → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · dominios Core → [`architecture/README.md`](./architecture/README.md) · deploy → [`OPERATIONS.md`](./OPERATIONS.md)

## Vista rápida

```mermaid
flowchart TB
  subgraph edge [Edge]
    CF[Cloudflare]
    GW[Gateway]
  end
  subgraph id [Identidad]
    Auth[Auth IdP]
  end
  subgraph shell [Experiencia]
    Hub[Hub]
  end
  subgraph products [Productos]
    Core[Core / One]
    LF[LifeFlow]
    SA[StreamAutomator]
    AN[AkoeNet]
    TT[Tabletop]
  end
  subgraph platform [Platform]
    Bill[Billing]
    Int[Internal API]
    AI[AI]
    Know[Knowledge]
    Search[Search]
    Notif[Notifications]
  end
  CF --> GW
  GW --> Auth
  GW --> Hub
  GW --> Core
  GW --> Bill
  GW --> Int
  GW --> AI
  Hub --> Core
  Hub --> LF
  Hub --> SA
  Hub --> AN
  Int --> AI
  AN --> Int
```

### Core / Dakinis One — bounded contexts

```mermaid
flowchart LR
  CP[Core Platform]
  HS[Hospitality Shell]
  HM[Hospitality Modules]
  CRM[CRM]
  CON[Connectors]
  SH[System Health]
  CP --> HS
  HS --> HM
  HM --> CON
  HM --> CRM
  CP --> CRM
  SH --> HM
  SH --> CON
```

| Contexto | Doc |
|----------|-----|
| Core Platform | [`platform/core.md`](./platform/core.md) |
| Hospitality UX / Shell | [`domains/hospitality/ux.md`](./domains/hospitality/ux.md) |
| Delivery / Channel Bus | [`domains/hospitality/delivery.md`](./domains/hospitality/delivery.md) |
| CRM | [`domains/crm/overview.md`](./domains/crm/overview.md) |
| Connectors SDK | [`architecture/connector-sdk.md`](./architecture/connector-sdk.md) |
| System Health | [`architecture/system-health.md`](./architecture/system-health.md) |
| Principios | [`architecture/principles.md`](./architecture/principles.md) |

### Login (SSO)

```mermaid
sequenceDiagram
  participant U as Usuario
  participant Hub
  participant Auth
  participant Prod as Producto
  U->>Hub: Abre Hub
  Hub->>Auth: Login / OAuth
  Auth-->>Hub: JWT
  Hub->>Prod: Deep-link + token
  Prod->>Auth: /auth/me o verify
  Auth-->>Prod: OK
```

### Billing (alto nivel)

```mermaid
flowchart LR
  Checkout[Checkout Stripe] --> WH[Webhook /billing/]
  WH --> Sub[(billing.subscriptions)]
  Sub --> Core[Core plan / access]
  Sub --> Hub[Hub /admin]
```

---

## Catálogo

| Sistema | Rol | Dominio / ruta |
|---------|-----|----------------|
| **Hub** | Escritorio workspace · Mi día · admin | `hub.dakinissystems.com` |
| **Core** (Dakinis One) | ERP + Platform embebida (Hospitality, CRM, Connectors) | `core.dakinissystems.com` · `/core/` |
| **LifeFlow** | Finanzas personales | `finance.dakinissystems.com` · `finance-api…` |
| **AkoeNet** | Comunidad / chat · `@AI` | `api.akoenet.dakinissystems.com` |
| **StreamAutomator** (SA) | Automatización streams | `api.streamautomator.com` |
| **Tabletop** | Juegos de mesa | `tabletop.dakinissystems.com` |
| **Billing** | Stripe · suscripciones | `/billing/` vía Gateway |
| **Internal API** | Orquestación Hub / invites / eventos | `/internal/` |
| **Gateway** | Edge nginx · routing · rate limits | `api.dakinissystems.com` |
| **Auth** | IdP · OAuth · JWT | `auth.dakinissystems.com` |
| **AI** | Copilot / inferencia | `ai.dakinissystems.com` · `/ai/` |
| **Knowledge** | RAG / documentos tenant | `/knowledge/` |
| **Search** | Índice / pgvector | `/search/` |
| **Notifications** | Email / in-app | `/notifications/` |
| **Landing** | Marketing | `dakinissystems.com` |

**Datos:** Supabase (Postgres multi-schema) · Redis/BullMQ (colas).  
**AkoeNet Assistant (módulos):** [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md)  
**Estado hoy:** [`STATUS.md`](./STATUS.md) · **Plan:** [`ROADMAP.md`](./ROADMAP.md).

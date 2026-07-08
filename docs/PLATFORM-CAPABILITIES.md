# Dakinis Platform — Capacidades

> **Julio 2026** · Vista de **capacidades** (qué ofrece la plataforma), no de servicios Railway.  
> Técnico por servicio → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Estrategia → [`company/STRATEGY.md`](./company/STRATEGY.md)

La plataforma no se explica solo con nombres de microservicios. Un CEO, inversor o socio entiende mejor **qué puede hacer Dakinis** a través de estas capacidades transversales.

---

## Mapa de capacidades

```
Dakinis Platform
├── Identity        — login, SSO, workspace, roles
├── Billing         — planes, Stripe, facturas, degraded
├── Storage         — documentos, media, exports (roadmap)
├── AI              — copilot, agents, OCR, embeddings
├── Search          — índice cross-product, Ctrl+K
├── Knowledge       — RAG, memoria de la empresa
├── Notifications   — email, in-app, push (roadmap)
├── Automation      — eventos, colas, webhooks
├── Events          — bus Redis/BullMQ
├── Observability   — health, logs, costes IA
├── Integrations    — conectores externos (roadmap)
└── Marketplace     — apps, plantillas, agents (roadmap)
```

Cada producto (Dakinis One, LifeFlow, AkoeNet…) **consume** estas capacidades vía Gateway o Internal API — no las reimplementa.

---

## Capacidades por área

| Capacidad | Qué resuelve | Estado | Consumidores |
|-----------|--------------|--------|--------------|
| **Identity** | Un login, JWT, SSO entre productos, workspace y roles | ✅ Auth · 🔄 workspace cutover | Hub, todos los productos |
| **Billing** | Suscripciones, checkout, portal, webhooks, plan por tenant | ✅ API · 🔴 E2E live | Hub Admin, Dakinis One |
| **Storage** | Assets, PDFs, exports, backups | ⬜ | LifeFlow, Knowledge, Tabletop |
| **AI** | Chat, agents, moderación contextual, coach | ✅ OpenAI prod | Core, LifeFlow, AkoeNet Assistant |
| **Search** | Búsqueda unificada, indexación | ✅ API · 🔄 worker | Hub Ctrl+K, Knowledge |
| **Knowledge** | Ingest docs, chunks, RAG | ✅ API · 🔄 ingest masivo | Copilot, Ctrl+K |
| **Notifications** | Email, in-app, alertas sistema | ✅ API scaffold | Hub, Billing, invitaciones |
| **Automation** | Triggers → acciones, colas | 🔄 BullMQ parcial | AkoeNet Assistant, Billing events |
| **Events** | Bus interno service-to-service | ✅ Redis/BullMQ | Billing→Core, Assistant |
| **Observability** | Health, métricas, costes | 🔄 parcial | Ops, Super Admin |
| **Integrations** | Google, Slack, Zapier, banca… | ⬜ diseño | Hub `/admin/integrations` |
| **Marketplace** | Apps, templates, connectors | ⬜ diseño | Hub futuro |

---

## Banking (capacidad platform — roadmap)

Agregación bancaria multi-país y multi-banco como **servicio de plataforma**, no solo feature de LifeFlow.

LifeFlow la usa para planificación personal; Dakinis One podría usarla después para conciliación y tesorería.

→ Detalle completo: [`BANKING-PLATFORM.md`](./BANKING-PLATFORM.md)

---

## Reglas de uso

1. **Los productos no duplican capacidades** — Auth en un sitio, Billing en un sitio, IA en un sitio.
2. **Hub expone la experiencia** — el cliente ve identidad, plan, productos e integraciones desde el escritorio.
3. **Internal API orquesta** — workspace admin, assistant AkoeNet, dashboard Hub.
4. **Nueva capacidad = evaluar si mejora el customer journey** antes de implementar → [`company/CUSTOMER-JOURNEY.md`](./company/CUSTOMER-JOURNEY.md).

---

## Comparación conceptual (no comercial)

| Referencia | Qué compartimos en **concepto** | Dónde nos diferenciamos |
|------------|--------------------------------|-------------------------|
| Microsoft 365 / Zoho One | Hub + workspace + SSO + suite | IA compartida entre productos · vertical restaurante · AkoeNet Assistant |
| Atlassian Cloud | Workspace, marketplace, flags | Operaciones de negocio, no solo dev/tools |
| Odoo | Módulos ERP | ERP es **un producto**, no toda la plataforma |

*Inspirados en la experiencia de suites empresariales; comercialmente somos una plataforma PYME española en fase piloto.*

---

*Actualizar al lanzar una capacidad nueva o al pasar de ⬜ a ✅ en prod.*

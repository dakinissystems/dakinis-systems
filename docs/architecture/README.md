# Architecture — Dakinis Platform

> Índice de arquitectura por dominios · **ago 2026**  
> Capas globales → [`ARCHITECTURE.md`](../ARCHITECTURE.md) · Sistemas → [`SYSTEMS.md`](../SYSTEMS.md) · ADRs → [`../adr/`](../adr/)

Este índice es el punto de entrada para entender **Dakinis Platform** de arriba abajo (~1 h).

```
Dakinis Platform
  ├── Core Platform
  ├── Hospitality
  ├── CRM
  ├── Connectors
  ├── System Health
  ├── Analytics* / Automation*
  └── ADRs · Principles · Events
```

\* roadmap

---

## Empezar aquí

| Área | Documento |
|------|-----------|
| **Principios** (reglas, no implementación) | [`principles.md`](./principles.md) |
| **Core Platform** (dentro de Dakinis One) | [`../platform/core.md`](../platform/core.md) |
| **Hospitality UX / Shell** | [`../domains/hospitality/ux.md`](../domains/hospitality/ux.md) |
| **Hospitality Delivery / Channel Bus** | [`../domains/hospitality/delivery.md`](../domains/hospitality/delivery.md) |
| **CRM** | [`../domains/crm/overview.md`](../domains/crm/overview.md) |
| **Connectors (contrato)** | [`connector-sdk.md`](./connector-sdk.md) |
| **System Health** | [`system-health.md`](./system-health.md) |
| **Command Palette** (infra transversal) | [`command-palette.md`](./command-palette.md) |
| **Event Bus hospitality** | [ADR-014](../adr/ADR-014-hospitality-event-bus.md) |
| **Changelog técnico** (bugs / fixes — no ADR) | [`changelog/`](./changelog/) |

---

## Bounded contexts

| Contexto | Responsabilidad | Dependencias permitidas |
|----------|-----------------|-------------------------|
| **Core Platform** | Auth tenant, multi-tenant, permisos, telemetría, config, Command Palette | — |
| **Hospitality** | Sala, Cocina, Inventario, Delivery UI, Caja, Shell ops | Core · Events · Connectors · CRM (consume) |
| **CRM** | Contactos, empresas, timeline, actividades | Core · Events (escucha) |
| **Connectors** | Providers externos (Delivery hoy; Payments/Commerce mañana) | Core · Registry · Telemetry |
| **System Health** | Estado de API, DB, Redis, Printer, WhatsApp, Payments, Delivery | Todos consultan; nadie embebe health ad-hoc |

**Regla de dependencia CRM:** Hospitality puede consumir CRM. CRM **nunca** depende de Hospitality.

---

## ADR Index (dominio Platform / Core)

ADRs de plataforma global (Gateway, Billing, Redis…): [`../adr/README.md`](../adr/README.md)

| ADR | Decisión |
|-----|----------|
| [ADR-012](../adr/ADR-012-hospitality-shell.md) | Shell separado del dominio (Task Dock reusable) |
| [ADR-013](../adr/ADR-013-connectors.md) | Integration Platform · Channel Bus · Registry |
| [ADR-014](../adr/ADR-014-hospitality-event-bus.md) | Event Bus de dominio hospitality |
| [ADR-015](../adr/ADR-015-price-resolver.md) | PriceResolver como strategy |

---

## Separación ADR vs Estado

| Tipo | Responde | Vive en |
|------|----------|---------|
| **ADR** | ¿Por qué esta decisión? | `docs/adr/` |
| **Domain doc** | ¿Cómo está organizado el dominio hoy? | `docs/domains/` · `docs/platform/` |
| **Changelog técnico** | ¿Qué bug / fix ocurrió? | `docs/architecture/changelog/` |
| **STATUS** | ¿Qué está vivo / bloqueado ahora? | [`STATUS.md`](../STATUS.md) |

Los ADR **no** documentan incidentes del día (429, emails CRITICAL, etc.).

---

## Roadmap de plataforma (visión)

```
Fase actual     TPV · Delivery Channel Bus · CRM v1 · Shell por tareas
Próxima         Printer real · Escandallo · KDS · Glovo partner
Plataforma      Realtime (SSE→WS) · más Connectors · Analytics · Automation
```

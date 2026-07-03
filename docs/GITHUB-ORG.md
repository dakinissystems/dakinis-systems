# GitHub — organización y descripciones

> Guía para alinear repos GitHub con [PLATFORM-STATUS.md](./PLATFORM-STATUS.md) y [ARCHITECTURE.md](./ARCHITECTURE.md).  
> **No cambiar Railway** por servicios futuros; solo documentar huecos reservados → [OPERATIONS.md](./OPERATIONS.md).

---

## Modelo objetivo

```
Platform (GitHub org dakinissystems)
├── dakinis-systems     ← gateway, Docker, contratos, legal, SQL
├── dakinis-auth
├── dakinis-ai          ← Shared AI Platform
├── dakinis-hub         ← Unified workspace (centro del ecosistema)
├── dakinis-shared      ← monorepo DES (npm packages)
│   └── packages/
│       ├── shared-des
│       ├── shared-brand
│       ├── shared-ux
│       ├── shared-layouts
│       ├── shared-charts
│       ├── shared-ai
│       ├── shared-loading
│       ├── shared-icons
│       ├── shared-illustrations
│       ├── sdk
│       └── design-audit
└── Platform services ✅ repos creados
    ├── [dakinis-billing](https://github.com/dakinissystems/dakinis-billing)
    ├── [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications)
    └── [dakinis-search](https://github.com/dakinissystems/dakinis-search)

Products
├── dakinis-core
├── lifeflow
├── dakinis-streamautomator
├── akoenet-backend + akoenet-client
├── dakinis-tabletop
└── dakinis-landing      ← marketing (no confundir con platform)
```

**DES** no es un servicio en Railway. Es un **ciudadano de plataforma en GitHub** (`dakinis-shared`), igual que AI o Auth en responsabilidad organizacional.

---

## dakinis-shared → monorepo de paquetes

**Hoy:** `dakinis-shared` pequeño; paquetes DES viven en `dakinis-systems/packages/` (fuente de verdad local).

**Objetivo:** un solo repo monorepo (estilo Radix / Chakra), **sin** crear 8 repos separados.

### Estructura target

```
dakinis-shared/
├── README.md              ← índice DES (copiar de packages/README.md)
├── package.json           ← workspaces npm/pnpm
├── packages/
│   ├── shared-des/
│   ├── shared-brand/
│   ├── shared-ux/
│   ├── shared-layouts/
│   ├── shared-charts/
│   ├── shared-ai/
│   ├── shared-loading/
│   ├── shared-icons/
│   ├── shared-illustrations/
│   ├── sdk/
│   └── design-audit/
└── experience-system/     ← docs DES (opcional, o enlace a README principal)
```

### Migración (cuando decidas mover)

Ver pasos completos: [`packages/MIGRATION.md`](../packages/MIGRATION.md).

---

## Platform repos (billing, notifications, search, knowledge, internal)

Repos **creados** en GitHub (excepto Knowledge — scaffold local). Mirror local en control repo + push con script.

| Repo GitHub | Mirror local | Railway |
|-------------|--------------|---------|
| [dakinis-billing](https://github.com/dakinissystems/dakinis-billing) | `billing/` | ⬜ Fase 8 |
| [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications) | `notifications/` | ⬜ Fase 5–6 |
| [dakinis-search](https://github.com/dakinissystems/dakinis-search) | `search/` | ⬜ roadmap |
| [dakinis-knowledge](https://github.com/dakinissystems/dakinis-knowledge) | `knowledge/` | ⬜ Fase 6 |
| [dakinis-internal-api](https://github.com/dakinissystems/dakinis-internal-api) | `internal/` | ⬜ no deploy |

```powershell
.\scripts\push-platform-scaffolds.ps1
# .\scripts\push-platform-scaffolds.ps1 -Repo knowledge
# .\scripts\push-platform-scaffolds.ps1 -ScaffoldOnly   # solo api/ workers/ docs/ sin push
```

Layout estándar (todos los repos platform): `api/` · `workers/` · `packages/` · `docs/` · `tests/` · `.github/` · `Dockerfile` · `docker-compose.yml` · `railway.toml`

---

## Descripciones GitHub (canónico — inglés)

Todas las descripciones cortas del repo en **inglés**, formato uniforme: `[Product] — [role in one line]`.

| Repo | Descripción GitHub |
|------|-------------------|
| **dakinis-systems** | Control repo — API gateway, contracts, legal, SQL schemas for the Dakinis ecosystem. |
| **dakinis-shared** | Dakinis Experience System (DES) — monorepo of shared UI packages, tokens, AppShell, SDK. |
| **dakinis-core** | Multi-tenant Business Operating System (BOS) — CRM, inventory, restaurant, AI Copilot and business modules. |
| **dakinis-hub** | Unified application shell, launcher and cross-product workspace for the Dakinis ecosystem. |
| **dakinis-ai** | Shared AI platform — agents, RAG, chat gateway for all Dakinis products. |
| **dakinis-auth** | Central authentication service — JWT, multi-tenant identity for the Dakinis platform. |
| **dakinis-landing** | Corporate website and acquisition funnel for the Dakinis Systems ecosystem. |
| **lifeflow** | Personal finance platform — 90-day financial radar and LifeFlow Score. |
| **dakinis-streamautomator** | Social streaming scheduler — Twitch, X, Instagram and Discord automation. |
| **akoenet-backend** | Real-time communication platform — API, WebRTC, Socket.IO backend. |
| **akoenet-client** | Real-time communication platform — web, desktop and mobile clients. |
| **dakinis-tabletop** | Modern tabletop RPG platform — D&D 5e sheets, combat and shared campaigns. |
| **dakinis-billing** | Platform billing service — Stripe subscriptions, plans, invoices and usage metering. |
| **dakinis-notifications** | Cross-product notifications platform — email, push, in-app inbox and webhooks. |
| **dakinis-search** | Global search platform — Hub Ctrl+K and cross-product index API. |
| **dakinis-knowledge** | Knowledge platform for Dakinis Systems with document ingestion, RAG and semantic search. |

### Aplicar con GitHub CLI

Requiere [GitHub CLI](https://cli.github.com/) y permisos en la org `dakinissystems`:

```powershell
.\scripts\github-descriptions.ps1
```

O manualmente por repo:

```bash
gh repo edit dakinissystems/dakinis-core --description "Multi-tenant Business Operating System (BOS) — CRM, inventory, restaurant, AI Copilot and business modules."
gh repo edit dakinissystems/dakinis-hub --description "Unified application shell, launcher and cross-product workspace for the Dakinis ecosystem."
gh repo edit dakinissystems/dakinis-ai --description "Shared AI platform — agents, RAG, chat gateway for all Dakinis products."
gh repo edit dakinissystems/dakinis-landing --description "Corporate website and acquisition funnel for the Dakinis Systems ecosystem."
gh repo edit dakinissystems/dakinis-shared --description "Dakinis Experience System (DES) — monorepo of shared UI packages, tokens, AppShell, SDK."
gh repo edit dakinissystems/lifeflow --description "Personal finance platform — 90-day financial radar and LifeFlow Score."
gh repo edit dakinissystems/dakinis-streamautomator --description "Social streaming scheduler — Twitch, X, Instagram and Discord automation."
gh repo edit dakinissystems/akoenet-backend --description "Real-time communication platform — API, WebRTC, Socket.IO backend."
gh repo edit dakinissystems/akoenet-client --description "Real-time communication platform — web, desktop and mobile clients."
gh repo edit dakinissystems/dakinis-tabletop --description "Modern tabletop RPG platform — D&D 5e sheets, combat and shared campaigns."
gh repo edit dakinissystems/dakinis-billing --description "Platform billing service — Stripe subscriptions, plans, invoices and usage metering."
gh repo edit dakinissystems/dakinis-notifications --description "Cross-product notifications platform — email, push, in-app inbox and webhooks."
gh repo edit dakinissystems/dakinis-search --description "Global search platform — Hub Ctrl+K and cross-product index API."
gh repo edit dakinissystems/dakinis-knowledge --description "Knowledge platform for Dakinis Systems with document ingestion, RAG and semantic search."
```

---

## README por repo

Cada repo mantiene su README en GitHub. DES local: [`../packages/README.md`](../packages/README.md) · estado plataforma: [PLATFORM-STATUS.md](./PLATFORM-STATUS.md).

---

## Qué no hacer

- **No** crear repos vacíos en Railway/GitHub para Billing, Notifications, Search, Storage u Observability hasta implementarlos.
- **No** fragmentar DES en muchos repos npm — un monorepo `dakinis-shared` es suficiente.
- **No** mezclar idiomas en descripciones GitHub (español/inglés en la misma org).

---

## Checklist de alineación

| Acción | Prioridad | Estado |
|--------|-----------|--------|
| Descriptions GitHub (inglés uniforme) | Alta | ⬜ ejecutar script |
| README `dakinis-shared` (monorepo DES) | Alta | ✅ vía `push-dakinis-shared.ps1` |
| README Hub / Core / Landing / AI | Media | ✅ en cada repo GitHub |
| Migrar `packages/` → repo `dakinis-shared` | Media | ✅ [dakinis-shared](https://github.com/dakinissystems/dakinis-shared) · `push-dakinis-shared.ps1` |
| Scaffolds billing/notifications/search | Media | ✅ repos GitHub · push con `push-platform-scaffolds.ps1` |
| Railway servicios futuros | Baja | ✅ solo docs (OPERATIONS) |

---

*Actualizar al renombrar repos o mover el monorepo DES.*

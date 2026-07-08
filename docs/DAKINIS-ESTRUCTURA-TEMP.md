# Dakinis Systems — Mapa temporal (julio 2026)

> **Documento temporal** de funcionalidades, estructura y roadmaps pendientes.  
> Referencia estable: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`PRODUCTS.md`](./PRODUCTS.md) · [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md)

---

## 1. Repositorios y clones locales

| Área | Repo GitHub | Carpeta local | En control repo |
|------|-------------|---------------|-----------------|
| Control / monorepo ops | `dakinissystems/dakinis-systems` | `d:\dakinis-systems` | ✅ |
| LifeFlow (finanzas) | `dakinissystems/lifeflow` | `finanzas/` | gitignored |
| Hub | `dakinissystems/dakinis-hub` | `hub/` | gitignored |
| AkoeNet | `dakinissystems/akoenet-client` + server | `apps/akoenet/` | gitignored |
| StreamAutomator | `dakinissystems/streamautomator` | `apps/streamautomator/` | gitignored |
| Platform Auth/Core/AI | varios | `platform/` | gitignored |
| Billing, Internal, Search, Notifications | en control repo | `billing/`, `internal/`, … | ✅ |
| Tabletop (D&D) | en control repo | `DND/` | ✅ |
| Landing | `dakinissystems/dakinis-landing` | `apps/landing/` | gitignored |

**Higiene:** [`WORKSPACE-HYGIENE.md`](./WORKSPACE-HYGIENE.md) — clones, sync de packages, CI.

---

## 2. Plataforma (prod)

| Servicio | Dominio / ruta | Estado | Función |
|----------|----------------|--------|---------|
| Gateway | `api.dakinissystems.com` | ✅ | Nginx, rutas por producto |
| Auth (IdP) | `/auth/` | ✅ | SSO, usuarios `dakinis_auth` |
| Hub | `hub.dakinissystems.com` | ✅ v0.2.1 | Mi día, widgets, SSO a productos |
| Billing | `/billing/` | ✅ v0.2.0 | Stripe, planes — **E2E live pendiente** |
| Notifications | `/notifications/` | ✅ v0.3.1 | Email/in-app scaffold |
| Search | `/search/` | ✅ | Índice platform |
| Knowledge | `/knowledge/` | ✅ | Docs RAG |
| AI Platform | `/ai/` | ✅ OpenAI prod | Copilot cross-product |
| Internal API | `/internal/` | ✅ | Hub dashboard, ops |

### Roadmap plataforma (faltante)

| Prioridad | Hito |
|-----------|------|
| 🔴 | Billing E2E live (webhook Stripe → `business.plan`) |
| 🔴 | Hub SSO E2E automatizado |
| 🔴 | Primer cliente piloto |
| 🟠 | Internal API vars Core · Resend live |
| 🟠 | Hub Mi día DB (migr. 027–029) |
| 🟠 | Screenshot Hub real en landing |
| 🟡 | Knowledge ingest masivo |
| 🟡 | Search pgvector |
| 🟡 | WhatsApp Meta |
| 🔵 | Marketplace · R2 · multi-AI · Playwright E2E |

---

## 3. Productos

### Dakinis One (Core)

- **Qué es:** Business OS multi-tenant (CRM, inventario, restaurante, facturas, copilot).
- **Estado:** Prod; copilot y módulos parciales.
- **Roadmap:** UX vendible, `/precios`, copilot E2E, cutover BD `core`.

### LifeFlow (Dakinis Finanzas)

- **Qué es:** Planificación de vida personal (score, escenarios, nómina, metas).
- **Stack:** Vite + React 19, API Express, SQLite (`/data`).
- **Estado:** Perfil con sidebar, CI + Railway; **React Doctor 100/100** en `finanzas/web`.
- **Roadmap:** SQLite → PostgreSQL/Supabase, migr. `030_lifeflow_app_links`, mobile.

### StreamAutomator

- **Qué es:** Programación multi-plataforma para creadores (Twitch, YouTube, Discord, overlays).
- **Stack:** CRA/Vite web + API Node, Supabase storage, BullMQ.
- **Estado:** Prod; React Doctor **61/100** (~98 avisos; giant components + a11y).
- **Roadmap:** Refactor páginas grandes, métricas, event bus platform, BaaS chunk audit.

### AkoeNet

- **Qué es:** Comunidad / voz / mensajería.
- **Estado:** Desktop Tauri 1.5.19, Railway `build:ci`, firmas updater OK.
- **Roadmap:** Schema Supabase `akoenet`, migración datos, SSO E2E — [`MIGRATE-AKOENET.md`](./supabase/MIGRATE-AKOENET.md).

### Tabletop (D&D)

- **Qué es:** Campañas, dados, hechizos (web + API SQLite).
- **Estado:** React Doctor **100/100** en `DND/web`.
- **Roadmap:** SQLite → Supabase.

### Landing

- **Qué es:** Marketing, SEM `/empieza`, narrativa plataforma.
- **Estado:** Prod.

### Fitness Platform

- **Local:** `apps/fitness-platform/` — demo JWT propio.

---

## 4. Foundation compartida

| Package canónico | Destinos (sync) |
|------------------|-----------------|
| `shared-brand`, `shared-layouts` | landing, core, finanzas, hub |
| `shared-ux`, `shared-loading`, `shared-icons`, `shared-illustrations` | core, finanzas, hub |
| `shared-ai` | internal, billing, search, notifications |

Scripts: `node scripts/sync-all-packages.mjs` · `node scripts/verify-package-drift.mjs`

Contratos gateway: [`docs/contracts/`](./contracts/)

Migraciones Supabase: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) (hasta **030** LifeFlow links).

---

## 5. React Doctor — estado por app (esta sesión)

| App | Score | Top issues restantes |
|-----|-------|----------------------|
| LifeFlow `finanzas/web` | **100/100** | — |
| Tabletop `DND/web` | **100/100** | — |
| StreamAutomator `apps/web` | **61/100** | 11 giant components, 1 no-event-handler (Stripe return URL), a11y |

### Fixes aplicados (jul 2026)

1. **LifeFlow ConfigPage** — componente dividido + scroll sin `useState` fantasma.
2. **Tabletop CampaignDetailView** — sin `useEffect` para sincronizar nombre; focus manual en rename.
3. **StreamAutomator** — 11/12 `no-event-handler` resueltos (fetch guards, Settings `key`, OAuth).

---

## 6. Smokes y ops

```powershell
.\scripts\smoke-prod-suite.ps1          # probes + -E2E con creds
.\scripts\smoke-billing-e2e.ps1
.\scripts\smoke-billing-degraded.ps1
```

Deploy: Railway (Hub Dockerfile, LifeFlow static, AkoeNet `build:ci`).

---

## 7. Pregunta guía

*¿Qué necesita un cliente para pagar por Dakinis este mes?*

→ Billing E2E + Hub demo + Dakinis One vendible. El resto es deuda técnica o escala post-piloto.

---

*Borrar o fusionar en ARCHITECTURE/PRODUCTS cuando deje de ser útil.*

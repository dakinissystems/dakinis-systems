# Dakinis Systems — Mapa temporal (julio 2026)

> **Documento temporal** de funcionalidades, estructura y roadmaps pendientes.  
> Referencia estable: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`PRODUCTS.md`](./PRODUCTS.md) · [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md) · Hub Admin → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md)  
> **Estrategia / GTM:** [`company/STRATEGY.md`](./company/STRATEGY.md) · [`company/CUSTOMER-JOURNEY.md`](./company/CUSTOMER-JOURNEY.md) · [`WHY.md`](./WHY.md)

---

## 0. Documentación estratégica (jul 2026)

Separación **técnica vs estratégica** — salto de arquitectura a visión de producto.

| Doc | Audiencia | Contenido |
|-----|-----------|-----------|
| [`company/STRATEGY.md`](./company/STRATEGY.md) | CEO · ventas | Competencia · FODA · posicionamiento |
| [`company/CUSTOMER-JOURNEY.md`](./company/CUSTOMER-JOURNEY.md) | Producto · GTM | Landing → workspace → pago |
| [`WORKSPACE-LIFECYCLE.md`](./WORKSPACE-LIFECYCLE.md) | Producto | Crear → invitar → plan → expandir |
| [`PLATFORM-CAPABILITIES.md`](./PLATFORM-CAPABILITIES.md) | Todos | Identity · AI · Banking… (no Redis/Railway) |
| [`WHY.md`](./WHY.md) | Devs nuevos | Por qué Hub, Core separado, sin bots |
| [`PLATFORM-INTEGRATIONS.md`](./PLATFORM-INTEGRATIONS.md) | Producto | Catálogo conectores roadmap |
| [`MARKETPLACE.md`](./MARKETPLACE.md) | Futuro | Apps · templates · agents |
| [`BANKING-PLATFORM.md`](./BANKING-PLATFORM.md) | LifeFlow · Core | Agregación multi-banco global |

**Tesis jul 2026:** arquitectura por delante del producto comercial — priorizar ciclo cliente completo, no nuevos componentes.

---

## 1. Repositorios y clones locales

| Área | Repo GitHub | Carpeta local | En control repo |
|------|-------------|---------------|-----------------|
| Control / monorepo ops | `dakinissystems/dakinis-systems` | `d:\dakinis-systems` | ✅ |
| LifeFlow (finanzas) | `dakinissystems/lifeflow` | `finanzas/` | gitignored |
| Hub | `dakinissystems/dakinis-hub` | `hub/` | gitignored |
| AkoeNet | `dakinissystems/akoenet-client` + `akoenet-backend` | `apps/akoenet/` | gitignored |
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
| Hub | `hub.dakinissystems.com` | ✅ v0.2.1+ | Escritorio workspace · Mi día · SSO · **Admin `/admin`** |
| Billing | `/billing/` | ✅ v0.2.0 | Stripe, planes — **E2E live pendiente** |
| Notifications | `/notifications/` | ✅ v0.3.1 | Email/in-app scaffold |
| Search | `/search/` | ✅ | Índice platform |
| Knowledge | `/knowledge/` | ✅ | Docs RAG |
| AI Platform | `/ai/` | ✅ OpenAI prod | Copilot cross-product |
| Internal API | `/internal/` | ✅ v0.3.1+ | Hub dashboard · **workspace admin** · **AkoeNet assistant** |

### Hub como sistema operativo (estrategia jul 2026)

El Hub deja de ser "usuario individual" y pasa a ser **identidad de workspace**:

| Módulo Hub | Estado | Prioridad |
|------------|--------|-----------|
| Mi día + widgets + launcher SSO | ✅ parcial | — |
| Workspace Admin (miembros, plan, productos) | ✅ UI `/admin` · API · migr. `031` ✅ prod | 🟠 piloto |
| Centro notificaciones global | ⬜ | 🟠 |
| Centro ayuda + estado sistema | ⬜ | 🟡 |
| Workspace Health | ⬜ | 🟡 |
| Centro IA (conversaciones, consumo) | ⬜ | 🟡 |
| Integraciones (Coming Soon) | ⬜ | 🔵 |
| Marketplace | ⬜ | 🔵 |

Detalle: [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) · Setup: [`PLATFORM-SETUP-STEPS.md`](./PLATFORM-SETUP-STEPS.md)

### Super Admin (equipo Dakinis)

| Módulo | Estado | Cuándo |
|--------|--------|--------|
| Workspaces + suspender/activar | ✅ API + UI scaffold | piloto |
| Revenue dashboard (MRR/ARR) | ⬜ tras Billing E2E | post-piloto |
| Auditoría timeline | ⬜ migr. `031` tablas | post-piloto |
| Feature flags global + workspace | ⬜ extiende `024` | post-piloto |
| Customer Success + health scores | ⬜ migr. `031` | escala |
| Jobs/BullMQ monitor | 🔄 parcial `/events/bus` | — |
| Costes infra por workspace | ⬜ | 🔵 |
| Impersonación soporte | ⬜ | post-piloto |

UI futura: `admin.dakinissystems.com` · Hoy: Hub `/admin` + Supabase Studio + Stripe + Railway.

### Roadmap plataforma (faltante)

| Prioridad | Hito |
|-----------|------|
| 🔴 | Billing E2E live (webhook Stripe → `business.plan`) |
| 🔴 | Hub SSO E2E automatizado |
| 🔴 | Primer cliente piloto |
| 🟠 | Backfill workspace resto tenants (post-031) |
| 🟠 | Internal API vars Core · Resend live |
| 🟠 | Hub Mi día DB (migr. `027`–`029`) |
| 🟠 | AkoeNet Assistant migr. `032`–`033` prod + E2E |
| 🟠 | Screenshot Hub real en landing |
| 🟡 | Centro notificaciones + ayuda unificados |
| 🟡 | Knowledge ingest masivo |
| 🟡 | Search pgvector |
| 🟡 | WhatsApp Meta |
| 🔵 | Marketplace · Centro IA · Integraciones · R2 · Playwright E2E |

---

## 3. Productos — posicionamiento vs mercado

### LifeFlow vs Fintonic / Finizens / ProjectionLab

| Ventaja Dakinis | Riesgo |
|-----------------|--------|
| Gemelo financiero + 6 escenarios paralelos | Sin PSD2 = datos manuales hoy |
| Comparador ciudades (ES) | Fintonic tiene agregación bancaria |
| Coach IA Pro | Mercado financiero competido |
| Banking Platform diseñada | Implementación post-piloto |

**Mensaje:** "El ProjectionLab español" — planificación de vida, no solo agregador. Banca → [`BANKING-PLATFORM.md`](./BANKING-PLATFORM.md)

### Dakinis One vs Holded / Odoo

| Ventaja Dakinis | Riesgo |
|-----------------|--------|
| Copilot IA integrado | Holded 3 años ventaja + PSD2 |
| Vertical restaurante | Nicho debe ser explícito en ventas |

**Mensaje:** "ERP con IA para PYMES y restaurantes".

### StreamAutomator vs Buffer / Streamlabs

| Ventaja Dakinis | Riesgo |
|-----------------|--------|
| Nicho streaming (Twitch/YouTube/Discord) | React Doctor 61/100 |
| Stream mode + overlays | UI menos pulida que competencia |

### Tabletop vs D&D Beyond / Roll20

| Ventaja Dakinis | Riesgo |
|-----------------|--------|
| Cuenta opcional + offline | D&D Beyond estándar de facto |
| AI GM roadmap | Sin licencia Wizards |

---

## 4. Productos — estado técnico

### Dakinis One (Core)

- **Estado:** Prod; copilot y módulos parciales.
- **Roadmap:** UX vendible, `/precios`, copilot E2E, cutover BD `core`.

### LifeFlow

- **Estado:** React Doctor **100/100** · Railway CI · layout footer corregido.
- **Roadmap:** SQLite → PostgreSQL, migr. `030`, mobile.

### StreamAutomator

- **Estado:** Prod; React Doctor **61/100**.
- **Roadmap:** Refactor giant components, métricas, event bus.

### AkoeNet

- **Estado:** Prod (`akoenet.dakinissystems.com`) · voz WebRTC · IdP Dakinis Auth ✅ · cliente **v1.5.19**.
- **Assistant (jul 2026):** arquitectura modular en monorepo — no bots externos.
  - `packages/akoenet-orchestrator` — catálogo, orchestrator, context, permissions, events
  - `packages/akoenet-modules` — handlers Fase 1 (Guardian, Welcome, AI, Streamer, Knowledge…)
  - Internal API `internal/src/services/akoenet-assistant.js` — rutas `/akoenet/assistant/*`
  - Cliente: panel **Assistant** + **i18n EN/ES** (`assistantModuleI18n.js`, 20 módulos)
  - Backend: proxy módulos + **event bridge** (`assistant-events.service.js`)
  - Migr. SQL: `032` (módulos) · `033` (event log + catálogo ampliado) — ⬜ prod
- **UX cliente (local):** controles voz en sidebar · export historial en menú de perfil.
- **Roadmap:** migr. `032`–`033` · workers BullMQ · `@AI` respuesta real · StreamAutomator webhook · cutover schema `akoenet`.

→ [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md) · [`PRODUCTS.md`](./PRODUCTS.md)

### Tabletop · Landing

Sin cambios respecto a [`PRODUCTS.md`](./PRODUCTS.md).

---

## 5. Foundation compartida

Scripts: `node scripts/sync-all-packages.mjs` · `node scripts/sync-akoenet-packages.mjs` · `node scripts/verify-package-drift.mjs`

Migraciones Supabase: hasta **033** AkoeNet Assistant (diseño listo; `031` ✅ prod jul 2026; `032`–`033` ⬜).

Packages monorepo nuevos:

| Package | Función |
|---------|---------|
| `packages/akoenet-orchestrator` | Routing módulos, contexto, permisos |
| `packages/akoenet-modules` | Handlers por capability |
| `internal/packages/akoenet-*` | Vendored para deploy Railway |

Contratos: [`contracts/admin-api.json`](./contracts/admin-api.json) · [`contracts/akoenet-assistant.json`](./contracts/akoenet-assistant.json)

Scripts ops: [`supabase/scripts/provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql) · [`supabase/scripts/akoenet_backend_schema_check.sql`](./supabase/scripts/akoenet_backend_schema_check.sql)

---

## 6. React Doctor — estado por app

| App | Score | Top issues restantes |
|-----|-------|----------------------|
| LifeFlow `finanzas/web` | **100/100** | — |
| Tabletop `DND/web` | **100/100** | — |
| StreamAutomator `apps/web` | **61/100** | 11 giant components, a11y |

---

## 7. FODA resumido

Detalle y comparativas → [`company/STRATEGY.md`](./company/STRATEGY.md)

| | |
|--|--|
| **Fortalezas** | Arquitectura 4 capas · LifeFlow único en ES · IA cross-product · multi-tenant · Hub Admin + AkoeNet Assistant diferenciador |
| **Debilidades** | Billing E2E ⬜ · sin piloto de pago · SQLite prod LF/TT · Assistant sin E2E prod |
| **Oportunidades** | Vertical restaurante · ecosistema Hub · AkoeNet vs Discord bots · Tabletop offline |
| **Amenazas** | Holded/Fintonic ventaja · tiempo sin validación mercado |

---

## 8. Pregunta guía

*¿Qué necesita un cliente para pagar por Dakinis este mes?*

1. Ver valor en 5 min → Hub SSO E2E + demo
2. Poder pagar → Billing E2E live
3. Usar con equipo → Hub Admin Nivel 1 (miembros + plan) — **UI lista, falta piloto**
4. Problema resuelto → Core restaurante o LifeFlow planificación

**No desarrollar más productos** hasta piloto. Prioridad: Billing E2E + primer cliente.

---

*Borrar o fusionar en ARCHITECTURE/PRODUCTS/HUB-WORKSPACE cuando deje de ser útil.*

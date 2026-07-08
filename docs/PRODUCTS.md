# Dakinis Systems — Productos

> **Productos** (capa Products) — consumen **Platform**. Entrada usuario: **Hub** → elige producto.

**Platform** (Auth, Hub, AI, Billing, Knowledge…) → [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
**Pendientes** → [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md)  
**Mensaje** → [`company/MESSAGING.md`](./company/MESSAGING.md)

**Core es Dakinis One** — un producto principal, no el nombre de toda la plataforma.

---

## Core — Dakinis One (Business OS)

**Repo:** `dakinis-core` · **Local:** `platform/core`  
**Dominio:** [core.dakinissystems.com](https://core.dakinissystems.com) · gateway `/core/`  
**BD:** Supabase `dakinis_core_prod` → cutover `core`

No es «un ERP». Es el **Business Operating System** multi-tenant de Dakinis.

```
Business OS
├── CRM · Inventory · Bookings
├── Restaurant (vertical)
├── Messages / WhatsApp
├── Invoices · Analytics
├── AI Copilot → AI Platform
└── Marketplace plugins ⬜
```

### Módulos

| Módulo | Rutas / API | Plan |
|--------|-------------|------|
| CRM | contactos, pipeline | Growth+ |
| Inventory | stock, lotes, alertas | Growth+ |
| Restaurant | cocina, menú, pedidos, alérgenos públicos | vertical |
| Bookings | citas / appointments | Pro |
| Invoices | facturas | Growth+ |
| Messages | mensajería interna | Growth+ |
| WhatsApp | Meta integration | Pro · 🔄 |
| AI Copilot | `POST /api/v1/tenant/copilot` → AI Platform | Pro |
| Analytics | telemetría tenant | 🔄 |
| Marketplace | plugins | ⬜ |

### Copilot B2B

UI: `BusinessNavHeroAskAi`, `DakinisCopilotPanel`  
Agent: `core-advisor` · Intents: stock, caducidad, CRM, catálogo.

### Planes comerciales

Starter · Growth · Pro — gating en API.

**Billing:** suscripciones vía **platform Billing** (`dakinis-billing` v0.2.0). Core expone proxy `/api/public/stripe/*` — sin SDK Stripe en Core.

### Platform consumida

Auth · AI · Billing · Notifications (roadmap) · Events (Redis)

---

## LifeFlow — Dakinis Finanzas

**Repo:** `lifeflow` · **Local:** `finanzas/`  
**Marca UI:** **Dakinis Finanzas**  
**Web:** `finance.dakinissystems.com` · **API:** `finance-api.dakinissystems.com`  
**BD hoy:** SQLite volume `/data` · **objetivo:** Supabase `lifeflow`

App de **planificación de vida** — no contabilidad como mensaje principal.

### Arquitectura producto

```
LifeFlow
├── Engine ← producto core (Score · Forecast · Scenario · Risk · Retirement · Investment)
├── API
├── Web
├── Mobile ⬜
└── Widgets (Hub)
```

El **Engine** es independiente de la UI. Consumido por Web, Android (roadmap) y Hub widgets.

### Diferenciales

| Feature | Descripción |
|---------|-------------|
| LifeFlow Score | 0–1000 + delta + historial |
| Coach | Reglas deterministas + IA Pro (`CoachHero`) |
| Gemelo financiero | 6 variantes paralelas |
| Escenarios 10 años | `life_scenarios` |
| Modo mudanza | Málaga · Lugo · Madrid · Valencia |

### 5 pilares UX

| Pilar | Ruta |
|-------|------|
| Hoy | `/` |
| Futuro | `/planificacion/mi-plan` |
| Objetivos | `/planificacion/metas` |
| Escenarios | `/lifeflow` |
| Patrimonio | `/finanzas/patrimonio` |

### Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| Lite | Gratis | Radar 90d, OCR ticket, import básico |
| Premium | 9 €/mes | Escenarios, coach, score, logros, gemelo |
| Pro | 19 €/mes | + IA avanzada, comparador ciudades, PSD2 roadmap |

### Platform consumida

AI (`/v1/lifeflow/coach`) · Auth (SSO roadmap) · Storage (documentos roadmap)

**Arranque local:** `cd finanzas && npm run dev`

---

## StreamAutomator

**Repo:** `dakinis-streamautomator` · **Local:** `apps/streamautomator`  
**Dominio:** [streamautomator.com](https://streamautomator.com) · API `api.streamautomator.com`  
**BD:** Supabase `stream`

SaaS scheduler multi-plataforma: Twitch, X, Instagram, Discord.

- API · Web React · OAuth · **Stripe propio** (independiente de Billing Core)
- Workers + Scheduler en Railway ✅
- Tema claro/oscuro/auto · stream mode · PWA

### Platform consumida

Auth (roadmap SSO) · Notifications (roadmap) · Events

---

## AkoeNet

**Repo:** [`akoenet-backend`](https://github.com/dakinissystems/akoenet-backend) + [`akoenet-client`](https://github.com/dakinissystems/akoenet-client)  
**Local (único):** `apps/akoenet/Server` (API) · `apps/akoenet/Client` (web) — clonar con `.\scripts\clone-akoenet.ps1`  
**Dominio:** [akoenet.dakinissystems.com](https://akoenet.dakinissystems.com)  
**BD:** Supabase `akoenet` (🔄)

Comunidad + voz: servidores, canales, DMs, WebRTC, Capacitor/Tauri.

**AkoeNet Assistant** (diferenciador): un asistente modular nativo — no bots Discord externos. Cinco categorías (moderación, comunidad, stream, IA, automation) + módulos Business/Developer. Arquitectura: `@dakinis/akoenet-orchestrator` + Internal API `/akoenet/assistant/*`. → [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md)

Shell tipo Discord · bottom nav móvil `≤720px` · IdP Dakinis Auth ✅

### Platform consumida

Auth · Notifications (email, push VAPID) · Storage (uploads)

---

## Tabletop

| Concepto | Valor |
|----------|-------|
| **Repo GitHub** | [`dakinis-tabletop`](https://github.com/dakinissystems/dakinis-tabletop) |
| **Carpeta local** | `DND/` (legacy interno — en docs usar **Tabletop**) |
| **Marca** | **Tabletop** 🎲 |
| **Web** | `tabletop.dakinissystems.com` |
| **API** | `tabletop-api.dakinissystems.com` |
| **Estado** | 🟡 MVP (SRD 5e) |
| **BD** | SQLite volume → Supabase ⬜ |

```
Tabletop
├── Characters · Campaigns · Compendium
├── Dice · Maps · Inventory · Combat
├── AI GM ⬜ → AI Platform
└── Offline (PWA roadmap)
```

Plataforma de rol de mesa — PWA móvil-first, cuenta opcional, sync en nube, campañas compartidas.

### Stack

| Capa | Tecnología |
|------|------------|
| Web | React 19 + TypeScript + Vite (`:5174`) |
| API | Express 5 + SQLite (`:4200`) |
| Auth | JWT propio (`TABLETOP_JWT_SECRET`) |

**Arranque local:** `cd DND && npm run dev`

### Funcionalidad

| Área | Detalle |
|------|---------|
| Cuenta | Registro / login · personajes en nube |
| Offline | «Continuar sin cuenta» — `localStorage` |
| Ficha | Wizard 4d6 · combate · magia · compendio SRD |
| Campañas | Código 8 chars · notas y botín compartidos |
| Backup | Export / import JSON · PDF |

### Platform consumida

Auth (SSO roadmap) · AI GM (roadmap) · Storage (assets roadmap)

---

## Landing corporativa

**Repo:** `dakinis-landing` · **Local:** `apps/landing`  
**Dominio:** [dakinissystems.com](https://dakinissystems.com)

Marketing · precios · legal · funnel hacia Core (Dakinis One).

GA4 + Meta Pixel ✅ · CTA → `core.dakinissystems.com`

No consume platform services directamente (sitio estático/marketing).

---

## Fitness Platform (demo local)

**Local:** `apps/fitness-platform` · gateway `/fitness/`  
Demo multi-tenant — sin prod · sin marca DES completa.

---

## Suite Hub (launcher visual)

El **Hub es platform**, no producto. Los tiles enlazan productos:

```
🏠 Hub · 📊 Core · 💰 Finanzas · 📺 StreamAutomator · 💬 AkoeNet · 🎲 Tabletop · 🤖 AI
```

Tile Finanzas → gateway `/finance/` → LifeFlow Web.

Objetivo Hub: «Mi día» primero, launcher secundario — ver [ARCHITECTURE § Hub](./ARCHITECTURE.md#hub--).

---

## Qué no está aquí (es Platform)

| Servicio | Doc |
|----------|-----|
| Auth, Billing, AI, Notifications, Search, Knowledge | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Hub (centro ecosistema) | [ARCHITECTURE.md § Hub](./ARCHITECTURE.md#hub--) |
| Gateway, Redis, Supabase, DES, SDK | [ARCHITECTURE.md § Infrastructure / Platform](./ARCHITECTURE.md) |
| Estado operativo y roadmap | [PLATFORM-STATUS.md](./PLATFORM-STATUS.md) |

---

*Legal por producto: [`legal/README.md`](./legal/README.md)*

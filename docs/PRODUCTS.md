# Dakinis Systems — Productos

> Resumen por producto. Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Roadmap → [`ROADMAP.md`](./ROADMAP.md).

---

## Dakinis One — Business Operating System

**Repo:** `dakinis-core` · **Local:** `platform/core`  
**Dominio:** [core.dakinissystems.com](https://core.dakinissystems.com) · gateway `/core/`

No es «un ERP». Es el **BOS** multi-tenant de Dakinis.

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
| AI Copilot | `POST /api/v1/tenant/copilot` → Dakinis AI | Pro |
| Analytics | telemetría tenant | 🔄 |
| Marketplace | plugins | ⬜ roadmap |

### Copilot B2B

UI: `BusinessNavHeroAskAi`, `DakinisCopilotPanel`  
Agent: `core-advisor` · Intents: stock, caducidad, CRM, catálogo.

### Planes comerciales

Starter · Growth · Pro — gating en API. Stripe en Core hoy → migrar a Billing (Fase 8).

### BD

Supabase `dakinis_core_prod` → cutover `core`.

---

## LifeFlow — Dakinis Finanzas

**Repo:** `lifeflow` · **Local:** `finanzas/`  
**Marca UI:** **Dakinis Finanzas**  
**Web:** `finance.dakinissystems.com` · **API:** `finance-api.dakinissystems.com`

App de **planificación de vida** — no contabilidad como mensaje principal.

### Diferenciales

| Feature | Descripción |
|---------|-------------|
| LifeFlow Score | 0–1000 + delta + historial |
| Coach | Reglas + IA Pro (`CoachHero`) |
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

### LifeFlow Engine (roadmap)

Motor independiente de UI:

- Score · Forecast · Scenario · Risk · Retirement · Investment

Consumido por Web, Android y Hub widgets.

### Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| Lite | Gratis | Radar 90d, OCR ticket, import básico |
| Premium | 9 €/mes | Escenarios, coach, score, logros, gemelo |
| Pro | 19 €/mes | + IA avanzada, comparador ciudades, PSD2 roadmap |

### Versión actual

**v6.8.1 (may 2026):** onboarding moneda/fechas, formato miles espacio, responsive móvil, auth prod, SW v3.

### BD

SQLite prod (ephemeral sin volume) · PostgreSQL futuro schema `lifeflow`.

**Arranque local:** `cd finanzas && npm run dev` · 87 tests shared.

---

## StreamAutomator

**Repo:** `dakinis-streamautomator` · **Local:** `apps/streamautomator`  
**Dominio:** [streamautomator.com](https://streamautomator.com)

SaaS scheduler multi-plataforma: Twitch, X, Instagram, Discord.

- API `:4002` · Web React · OAuth · Stripe · PWA
- Tema claro/oscuro/auto · stream mode

---

## AkoeNet

**Repo:** `akoenet-client` + `akoenet-backend` · **Local:** `apps/akoenet`  
**Dominio:** [akoenet.dakinissystems.com](https://akoenet.dakinissystems.com)

Comunidad + voz: servidores, canales, DMs, WebRTC, Capacitor/Tauri.

Shell tipo Discord · bottom nav móvil `≤720px`.

---

## Dakinis Hub

**Repo:** `dakinis-hub` · **Dominio:** `hub.dakinissystems.com`

**Posicionamiento objetivo:** home del usuario, no launcher.

| Sección | Contenido |
|---------|-----------|
| Mi día | agenda, resumen |
| Actividad | timeline cross-producto |
| IA | resumen + recomendaciones |
| Notificaciones | in-app (+ servicio platform) |
| Widgets | score LifeFlow, ventas Core, próximo stream… |
| Aplicaciones | launcher (secundario) |

Widgets registry: `@dakinis/shared-ux` → `HUB_WIDGET_REGISTRY`, `HUB_DASHBOARD_SECTIONS`.

BD: schema `hub` — prefs, widgets, timeline, notifications (futuro).

---

## Dakinis AI

**Repo:** `dakinis-ai` · **Local:** `platform/ai` · **Puerto:** `:4020`

Servicio platform — no producto de usuario final.

| Ruta | Función |
|------|---------|
| `POST /v1/agents/:id` | Agentes unificados |
| `POST /v1/chat` | Chat genérico |
| `POST /v1/rag` | Consulta Knowledge |
| `POST /v1/ocr` | OCR |
| `GET /v1/analytics/usage` | Métricas coste/tokens |

Agents: ver `AGENT_REGISTRY` en `@dakinis/shared-ai/agents.js`.

Knowledge separado — AI consulta, no almacena corpus mezclado.

---

## Dakinis Tabletop

| Concepto | Valor |
|----------|-------|
| **Repo GitHub** | [`dakinis-tabletop`](https://github.com/dakinissystems/dakinis-tabletop) |
| **Carpeta local** | `DND/` (nombre interno, gitignored en orquestación) |
| **Marca UI / Hub** | **Tabletop** (🎲) |
| **Web** | `tabletop.dakinissystems.com` |
| **API** | `tabletop-api.dakinissystems.com` |
| **Estado** | MVP (ruleset SRD 5e) |

Plataforma de rol de mesa — PWA móvil-first con cuenta opcional, sync en nube y campañas compartidas. Misma convención que LifeFlow: repo técnico + marca pública + subdominio funcional.

### Stack

| Capa | Tecnología |
|------|------------|
| Web | React 19 + TypeScript + Vite (`:5174`) |
| API | Express 5 + SQLite (`@dakinis/tabletop-api`, `:4200`) |
| Auth | JWT propio (`TABLETOP_JWT_SECRET`) · patrón LifeFlow |
| BD | SQLite `api/data/tabletop.db` · `TABLETOP_DB_PATH` en prod |

**Arranque local:** `cd DND && npm run dev` · proxy Vite `/api` → `:4200`.

### Funcionalidad

| Área | Detalle |
|------|---------|
| Cuenta | Registro / login · personajes en nube · merge con local al autenticar |
| Offline | «Continuar sin cuenta» — solo `localStorage` en el dispositivo |
| Ficha | Wizard (4d6, trasfondos PHB) · combate · magia · arsenal · compendio SRD |
| Sesión | Notas por personaje · tirador de dados (d4–d100, ventaja) |
| Campañas | Crear / unirse por código 8 chars · notas y botín compartidos |
| Backup | Export / import JSON · PDF · migrador legacy Flask |

### API (resumen)

```
POST   /api/auth/register | login     GET  /api/auth/me
GET    /api/characters                  PUT  /api/characters/sync
DELETE /api/characters/:id
GET    /api/campaigns                   POST /api/campaigns
POST   /api/campaigns/join
GET/POST/DELETE  /api/campaigns/:id/notes | items
GET    /health
```

### Prod (pendiente deploy)

Env: `TABLETOP_JWT_SECRET`, `TABLETOP_DB_PATH` (volume), `TABLETOP_CORS_ORIGINS`.  
Supabase roadmap: schema `tabletop` · auth en `dakinis_auth`.

---

## Landing corporativa

**Repo:** `dakinis-landing` · **Local:** `apps/landing`  
**Dominio:** [dakinissystems.com](https://dakinissystems.com)

Marketing · precios · legal · portfolio. Puerto dev 5173.

---

## Fitness Platform (demo)

**Local:** `apps/fitness-platform` · gateway `/fitness/`  
Demo multi-tenant — UX básica, sin marca DES completa.

---

## Suite Hub (launcher visual)

```
🏠 Hub · 📊 Core · 💰 Finanzas · 📺 StreamAutomator · 💬 AkoeNet · 🎲 Tabletop · 🤖 AI
```

Tile Finanzas → gateway `/finance/` → SPA LifeFlow.

---

*Detalle legal por producto: [`docs/legal/README.md`](./legal/README.md)*

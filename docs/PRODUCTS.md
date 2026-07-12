# Dakinis Systems — Productos

> **Productos** (capa Products) consumen **Platform**. Entrada usuario: **Hub** → elige producto.

| Referencia | Doc |
|------------|-----|
| Platform (Auth, Hub, AI, Billing…) | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Estado operativo | [`STATUS.md`](./STATUS.md) |
| Mensaje de marca | [`company/MESSAGING.md`](./company/MESSAGING.md) |

**Core = Dakinis One** — un producto, no el nombre de toda la plataforma.

---

## Mapa del ecosistema

```
                         Dakinis Systems
                               │
                          Platform
    ─────────────────────────────────────────────────────
    Auth │ AI │ Billing │ Notifications │ Knowledge │ Hub
                               │
         ┌─────────┬───────────┼───────────┬──────────┐
         │         │           │           │          │
    Dakinis    LifeFlow   StreamAuto-   AkoeNet   Tabletop
      One                  mator
```

**Flujo:** Infrastructure → Platform → Products → cada producto con una función clara → servicios compartidos.

---

## Leyenda de estado

| Icono | Significado |
|-------|-------------|
| ✅ | Disponible en producción |
| 🚧 | En desarrollo (usable parcialmente) |
| 📅 | Roadmap (diseñado, no prioritario ahora) |

---

## Plantilla de ficha (todos los productos)

Cada producto sigue el mismo orden: **Por qué existe** → **Ficha** → **Qué ofrece** → **Arquitectura** → **Platform** → **Local**.

---

## Dakinis One (Core)

**Por qué existe:** Gestiona la operación diaria de una empresa — CRM, stock, reservas, facturación — en un solo tenant multi-usuario.

| Campo | Valor |
|-------|-------|
| **Nombre** | Dakinis One · Business OS |
| **Estado** | ✅ Producción |
| **Cliente** | B2B · PYME · restaurantes · retail |
| **Modelo** | SaaS · Starter / Growth / Pro |
| **Repo** | [`dakinis-core`](https://github.com/dakinissystems/dakinis-core) |
| **Local** | `platform/core` |
| **Web** | [core.dakinissystems.com](https://core.dakinissystems.com) |
| **API** | Gateway `/core/` |
| **BD** | Supabase `dakinis_core_prod` → cutover `core` |

No es «un ERP». Es el **Business Operating System** multi-tenant.

### Qué ofrece

| Módulo | Plan | Estado |
|--------|------|--------|
| CRM (contactos, pipeline) | Growth+ | ✅ |
| Inventory (stock, lotes, alertas) | Growth+ | ✅ |
| Restaurant (cocina, menú, pedidos) | Vertical | ✅ |
| Bookings (citas) | Pro | ✅ |
| Invoices | Growth+ | ✅ |
| Messages (interna) | Growth+ | ✅ |
| WhatsApp (Meta) | Pro | 🚧 |
| AI Copilot → AI Platform | Pro | ✅ |
| Analytics tenant | — | 🚧 |
| Marketplace plugins | — | 📅 |

**Copilot B2B:** `BusinessNavHeroAskAi`, `DakinisCopilotPanel` · agent `core-advisor` · intents stock, caducidad, CRM.

**Billing:** suscripciones vía platform Billing (`dakinis-billing`). Core proxy `/api/public/stripe/*` — sin SDK Stripe en Core.

### Arquitectura

```
Business OS
├── CRM · Inventory · Bookings
├── Restaurant (vertical)
├── Messages / WhatsApp
├── Invoices · Analytics
├── AI Copilot → AI Platform
└── Marketplace plugins
```

### Platform consumida

Auth · AI · Billing · Notifications 📅 · Events (Redis)

---

## LifeFlow — Dakinis Finanzas

**Por qué existe:** Ayuda a tomar mejores decisiones financieras a largo plazo — patrimonio, jubilación, escenarios — no solo registrar gastos.

| Campo | Valor |
|-------|-------|
| **Nombre** | Dakinis Finanzas (LifeFlow) |
| **Estado** | ✅ Producción |
| **Cliente** | B2C |
| **Modelo** | Freemium · Lite / Premium / Pro |
| **Repo** | [`lifeflow`](https://github.com/dakinissystems/lifeflow) |
| **Local** | `finanzas/` |
| **Web** | [finance.dakinissystems.com](https://finance.dakinissystems.com) |
| **API** | [finance-api.dakinissystems.com](https://finance-api.dakinissystems.com) |
| **BD** | SQLite `/data` hoy · objetivo Supabase `lifeflow` |
| **Stack** | React · Express · Engine TS |

### Qué ofrece

| Feature | Descripción |
|---------|-------------|
| LifeFlow Score | 0–1000 + delta + historial |
| Coach | Reglas + IA Pro (`CoachHero`) |
| Gemelo financiero | 6 variantes paralelas |
| Escenarios 10 años | `life_scenarios` |
| Modo mudanza | Málaga · Lugo · Madrid · Valencia |

**5 pilares UX:** Hoy `/` · Futuro `/planificacion/mi-plan` · Objetivos `/planificacion/metas` · Escenarios `/lifeflow` · Patrimonio `/finanzas/patrimonio`

| Plan | Precio | Incluye |
|------|--------|---------|
| Lite | Gratis | Radar 90d, OCR ticket, import básico |
| Premium | 9 €/mes | Escenarios, coach, score, gemelo |
| Pro | 19 €/mes | IA avanzada, comparador ciudades, Open Banking 📅 |

**Open Banking:** consumirá **Dakinis Banking Platform** (GoCardless, Plaid, Belvo). Hoy: manual + CSV.

### Arquitectura

```
LifeFlow
├── Engine (Score · Forecast · Scenario · Risk · Retirement · Investment)
├── API · Web · Widgets (Hub)
└── Mobile 📅
```

El **Engine** es independiente de la UI.

### Platform consumida

AI (`/v1/lifeflow/coach`) · Auth SSO 📅 · Storage documentos 📅

**Local:** `cd finanzas && npm run dev`

---

## StreamAutomator

**Por qué existe:** Automatiza la presencia online de un creador — programar streams en Twitch, X, Instagram, Discord desde un solo sitio.

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Producción |
| **Cliente** | B2C · streamers · creadores |
| **Modelo** | SaaS · Stripe propio (independiente Billing Core) |
| **Repo** | [`dakinis-streamautomator`](https://github.com/dakinissystems/dakinis-streamautomator) |
| **Local** | `apps/streamautomator` |
| **Web** | [streamautomator.com](https://streamautomator.com) |
| **API** | api.streamautomator.com |
| **BD** | Supabase `stream` |

### Qué ofrece

Scheduler multi-plataforma · OAuth · Workers + Scheduler Railway ✅ · tema claro/oscuro · PWA · stream mode.

Integración nativa con **AkoeNet** (comandos `!schedule`, widget streams).

### Platform consumida

Auth SSO 📅 · Notifications 📅 · Events

---

## AkoeNet

**Por qué existe:** Comunidad y comunicación en tiempo real — servidores, voz, DMs — con identidad Dakinis (Assistant nativo, no bots Discord).

| Campo | Valor |
|-------|-------|
| **Estado** | 🚧 Beta (core social ✅ · Assistant scaffold · Media Player MVP) |
| **Cliente** | B2C · comunidades · gaming · streamers |
| **Modelo** | Freemium + addons 📅 |
| **Repos** | [`akoenet-client`](https://github.com/dakinissystems/akoenet-client) · [`akoenet-backend`](https://github.com/dakinissystems/akoenet-backend) |
| **Local** | `apps/akoenet/Client` + `Server` — `.\scripts\clone-akoenet.ps1` |
| **Web** | [akoenet.dakinissystems.com](https://akoenet.dakinissystems.com) |
| **API** | [api.akoenet.dakinissystems.com](https://api.akoenet.dakinissystems.com) |
| **BD** | Supabase `akoenet` 🚧 cutover |
| **Stack** | React 19 · Express · Socket.IO · WebRTC · Tauri · Capacitor |
| **Versiones** | Client v1.5.21 · Backend v1.5.12 |

### Qué ofrece

| Área | Estado |
|------|--------|
| Servidores, canales, roles, chat, DMs | ✅ |
| Voz WebRTC (mesh) | ✅ |
| Auth IdP + Google + Twitch + Steam | ✅ |
| Desktop Tauri + Android Capacitor | ✅ |
| StreamAutomator integration | ✅ |
| **AkoeNet Assistant** (módulos nativos) | 🚧 |
| **Dakinis Media Player** (`/media`) | 🚧 MVP |
| Listen together / presence musical | 📅 |

**Diferenciador:** [AkoeNet Assistant](./AKOENET-ASSISTANT.md) — `@dakinis/akoenet-orchestrator` + Internal API `/akoenet/assistant/*`.

**Media Player:** mini-app con ventanas flotantes — valida el futuro **Dakinis Desktop** (`@dakinis/window-manager`). → [`AKOENET-ESTADO.md`](./AKOENET-ESTADO.md)

### Arquitectura

```
AkoeNet
├── Client (SPA + Tauri + Capacitor)
├── Backend (REST + Socket.IO)
├── Assistant (orchestrator + modules)
└── Addons: Media Player, …
```

### Platform consumida

Auth · Notifications (email, push VAPID) · Storage (uploads) · Internal API · AI 📅

---

## Tabletop

**Por qué existe:** Plataforma moderna para campañas de rol de mesa — ficha, dados, compendio SRD, campañas compartidas.

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ MVP usable (SRD 5e) |
| **Cliente** | B2C · jugadores de rol |
| **Modelo** | Freemium 📅 |
| **Repo** | [`dakinis-tabletop`](https://github.com/dakinissystems/dakinis-tabletop) |
| **Local** | `DND/` (carpeta legacy; marca **Tabletop**) |
| **Web** | [tabletop.dakinissystems.com](https://tabletop.dakinissystems.com) |
| **API** | tabletop-api.dakinissystems.com |
| **BD** | SQLite volume · Supabase 📅 |
| **Stack** | React 19 + TS · Express 5 · JWT propio |

### Qué ofrece (MVP hoy)

| Área | Detalle |
|------|---------|
| Cuenta | Registro / login · personajes en nube |
| Offline | «Continuar sin cuenta» — localStorage |
| Ficha | Wizard 4d6 · combate · magia · compendio SRD |
| Campañas | Código 8 chars · notas y botín compartidos |
| Backup | Export / import JSON · PDF |

### Arquitectura

```
Tabletop
├── Characters · Campaigns · Compendium
├── Dice · Maps · Inventory · Combat
├── AI GM 📅
└── Offline PWA 📅
```

### Platform consumida

Auth SSO 📅 · AI GM 📅 · Storage assets 📅

**Local:** `cd DND && npm run dev`

---

## Landing corporativa

**Por qué existe:** Marketing, precios, legal y funnel hacia Dakinis One.

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ |
| **Repo** | `dakinis-landing` |
| **Local** | `apps/landing` |
| **Web** | [dakinissystems.com](https://dakinissystems.com) |

GA4 + Meta Pixel ✅ · CTA → Core. No consume Platform directamente.

---

## Fitness Platform

| Campo | Valor |
|-------|-------|
| **Estado** | 📅 Demo local |
| **Local** | `apps/fitness-platform` · gateway `/fitness/` |

Multi-tenant demo — sin prod.

---

## Hub (Platform, no producto)

**Por qué existe:** Punto de entrada — «Mi día» primero, launcher de productos segundo (como Microsoft 365 / Google Workspace).

```
🏠 Hub · 📊 Core · 💰 Finanzas · 📺 StreamAutomator · 💬 AkoeNet · 🎲 Tabletop · 🤖 AI
```

Tile Finanzas → `/finance/` → LifeFlow Web. → [ARCHITECTURE § Hub](./ARCHITECTURE.md#hub--)

---

## Propósito MVP por producto

| Producto | Rol en el ecosistema |
|----------|------------------------|
| **Dakinis One** | Producto B2B principal |
| **LifeFlow** | Producto B2C principal |
| **AkoeNet** | Comunidad y comunicación |
| **StreamAutomator** | Nicho creadores |
| **Tabletop** | Producto independiente (rol) |
| **Media Player** | Demo Window Manager + base mini-apps |

---

## Qué no está aquí (Platform)

| Servicio | Doc |
|----------|-----|
| Auth, Billing, AI, Notifications, Search, Knowledge | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Gateway, Redis, Supabase, DES, SDK | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Roadmap global | [ROADMAP.md](./ROADMAP.md) |

---

*Legal por producto: [`legal/README.md`](./legal/README.md)*

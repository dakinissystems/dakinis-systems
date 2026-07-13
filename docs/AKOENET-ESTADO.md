# AkoeNet - Compilacion de documentacion

> Indice maestro para analizar cada documento por separado.
> Regenerar: ``.\scripts\build-akoenet-estado.ps1``

## Como usar

- Cada seccion empieza con ``# >> nombre-del-archivo``
- Busca ``>>`` en el editor para saltar entre documentos
- Los originales no se modifican; solo se copian aqui

## Indice

1. [AKOENET-ASSISTANT.md](#akoenet-assistant-md)
2. [PRODUCTS.md](#products-md)
3. [DAKINIS-WORKSPACE.md](#dakinis-workspace-md)
4. [workspace/CAPABILITIES.md](#workspace-capabilities-md)
5. [workspace/DESKTOP-RUNTIME.md](#workspace-desktop-runtime-md)
6. [workspace/ARCHITECTURE.md](#workspace-architecture-md)
7. [PLATFORM-SETUP-STEPS.md](#platform-setup-steps-md)
8. [MIGRATE-AKOENET.md](#migrate-akoenet-md)
9. [akoenet-backend README.md](#akoenet-backend-readme-md)
10. [services/media/README.md](#services-media-readme-md)
11. [services/media/skins/classic/README.md](#services-media-skins-classic-readme-md)
12. [projects/media-player/README.md](#projects-media-player-readme-md)
13. [projects/media-player/docs/ARCHITECTURE.md](#projects-media-player-docs-architecture-md)
14. [projects/media-player/docs/AUDIO-ENGINE.md](#projects-media-player-docs-audio-engine-md)
15. [projects/media-player/docs/DATABASE.md](#projects-media-player-docs-database-md)
16. [projects/media-player/docs/INTEGRATION-AKOENET.md](#projects-media-player-docs-integration-akoenet-md)
17. [projects/media-player/docs/MARKETPLACE.md](#projects-media-player-docs-marketplace-md)
18. [projects/media-player/docs/ROADMAP.md](#projects-media-player-docs-roadmap-md)
19. [projects/media-player/docs/SKINS.md](#projects-media-player-docs-skins-md)
20. [projects/media-player/docs/WINDOW-MANAGER.md](#projects-media-player-docs-window-manager-md)
21. [projects/media-player/scaffold/README.md](#projects-media-player-scaffold-readme-md)
22. [projects/media-player/scaffold/frontend/README.md](#projects-media-player-scaffold-frontend-readme-md)
23. [projects/media-player/scaffold/backend/README.md](#projects-media-player-scaffold-backend-readme-md)
24. [projects/media-player/examples/skin-classic/README.md](#projects-media-player-examples-skin-classic-readme-md)
25. [projects/akoenet-media-player/README.md](#projects-akoenet-media-player-readme-md)
26. [projects/akoenet-media-player/backend/README.md](#projects-akoenet-media-player-backend-readme-md)
27. [projects/akoenet-media-player/frontend/README.md](#projects-akoenet-media-player-frontend-readme-md)
28. [projects/akoenet-media-player/docs/API.md](#projects-akoenet-media-player-docs-api-md)
29. [projects/akoenet-media-player/docs/ARCHITECTURE.md](#projects-akoenet-media-player-docs-architecture-md)
30. [projects/akoenet-media-player/docs/DATABASE.md](#projects-akoenet-media-player-docs-database-md)
31. [projects/akoenet-media-player/docs/INTEGRATION-AKOENET.md](#projects-akoenet-media-player-docs-integration-akoenet-md)
32. [projects/akoenet-media-player/docs/ROADMAP.md](#projects-akoenet-media-player-docs-roadmap-md)
33. [projects/akoenet-media-player/docs/SKINS.md](#projects-akoenet-media-player-docs-skins-md)
34. [projects/akoenet-media-player/docs/WINDOW-MANAGER.md](#projects-akoenet-media-player-docs-window-manager-md)
35. [projects/akoenet-media-player/packages/window-manager/README.md](#projects-akoenet-media-player-packages-window-manager-readme-md)
36. [projects/akoenet-media-player/skins/classic/README.md](#projects-akoenet-media-player-skins-classic-readme-md)

---

<a id="akoenet-assistant-md"></a>

# >> AKOENET-ASSISTANT.md

**Ruta:** `docs/AKOENET-ASSISTANT.md`

# AkoeNet Assistant — Arquitectura modular

> **Julio 2026** · Los bots no son apps externas: son módulos nativos de Dakinis AI Platform con contexto del servidor.  
> SQL → [`032`](./supabase/migrations/032_akoenet_assistant_modules.sql) · [`033`](./supabase/migrations/033_akoenet_assistant_expansion.sql)  
> Contrato → [`contracts/akoenet-assistant.json`](./contracts/akoenet-assistant.json)  
> Setup → [`PLATFORM-SETUP-STEPS.md`](./PLATFORM-SETUP-STEPS.md)

**Mensaje:** *"Discord tiene bots. AkoeNet tiene un asistente."*

---

## Opinión estratégica

La propuesta es **correcta y es la única forma de competir sin copiar Discord**. No invitas diez bots (Dyno + MEE6 + Carl + StreamElements…). Activas módulos en un panel:

```
AkoeNet Assistant
├── 🛡 Moderation      (Guardian)
├── 🤖 AI Assistant    (Copilot + Knowledge)
├── 👋 Community       (Welcome, Reaction Roles, Niveles)
├── 📺 Stream          (StreamAutomator nativo)
├── 🎵 Music           (solo status — sin player DMCA)
├── 💼 Business        (CRM, tickets — Core)
├── 👨‍💻 Developer       (GitHub, Railway, Supabase)
├── 🎫 Tickets         (Support)
├── 📅 Events
├── ⚙️ Automation      (Cuando X → haz Y)
└── 🧠 Knowledge
```

**Ventajas insuperables vs Discord:**

| | Discord | AkoeNet |
|--|---------|---------|
| Arquitectura | Bot externo | Nativo + contexto servidor |
| IA | OpenAI caro por bot | Dakinis AI Platform |
| Streaming | StreamElements bot | StreamAutomator integrado |
| Empresas | Casi nada | Core + Billing + tickets |
| Moderación | Reglas estáticas | Reglas + **IA contextual** |

**Evitar:** música con reproducción (DMCA). **Priorizar Fase 1:** Guardian + Welcome + AI + Streamer + Knowledge.

---

## Arquitectura técnica

```mermaid
flowchart TB
  subgraph client [AkoeNet Client]
    UI[Panel Assistant — toggles módulos]
    CHAT[Mensajes / slash / eventos]
  end

  subgraph akoenet_api [AkoeNet Server]
    API[REST + WebSocket]
    ORCH[Module Orchestrator]
    CTX[Context Engine]
    PERM[Permissions Engine]
  end

  subgraph internal [Internal API]
    ASST["/akoenet/assistant/*"]
    SVC[akoenet-assistant service]
  end

  subgraph modules [packages/akoenet-modules]
    G[Guardian]
    W[Welcome]
    AI[Assistant + Guardian AI]
    ST[Streamer]
    K[Knowledge]
    AU[Automation]
  end

  subgraph platform [Dakinis Platform]
    AIP[AI /ai/]
    SA[StreamAutomator]
    KB[Knowledge]
    BUS[BullMQ Redis]
    DB[(Supabase akoenet.*)]
  end

  UI --> API
  CHAT --> API
  API --> ASST
  ASST --> SVC
  SVC --> ORCH
  ORCH --> CTX
  ORCH --> PERM
  ORCH --> G
  ORCH --> W
  ORCH --> AI
  ORCH --> ST
  ORCH --> K
  ORCH --> AU
  AI --> AIP
  ST --> SA
  K --> KB
  G --> BUS
  AU --> BUS
  SVC --> DB
```

### Componentes implementados

| Componente | Ubicación | Responsabilidad |
|------------|-----------|-----------------|
| **Catálogo módulos** | `packages/akoenet-orchestrator/src/catalog.js` | 5 categorías + system bots |
| **Module Orchestrator** | `packages/akoenet-orchestrator/src/orchestrator.js` | Routing por `capability`, enrich context |
| **Context Engine** | `packages/akoenet-orchestrator/src/context.js` | Cache Redis + contexto IA |
| **Permissions Engine** | `packages/akoenet-orchestrator/src/permissions.js` | RBAC owner / super admin / roles |
| **Event Bus contract** | `packages/akoenet-orchestrator/src/events.js` | Tipos evento + dispatch |
| **Module handlers** | `packages/akoenet-modules/src/handlers.js` | Scaffolds Fase 1 (event-aware) |
| **Internal API** | `internal/src/services/akoenet-assistant.js` | DB + route command/event |
| **AkoeNet backend proxy** | `apps/akoenet/Server/src/services/assistant-modules.service.js` | Toggles `GET/PUT /servers/:id/assistant/modules` |
| **Event bridge** | `apps/akoenet/Server/src/services/assistant-events.service.js` | `message.created` / `member.joined` → Internal API; `@AI` → `ai.ask` |
| **Cliente UI** | `apps/akoenet/Client/src/components/ServerSettingsAssistantPanel.jsx` | Toggles + i18n EN/ES (`serverAssistant.modules.*`) |
| **Vendored (deploy)** | `internal/packages/akoenet-*` | Sync: `node scripts/sync-akoenet-packages.mjs` |

---

## Categorías de módulos

### 1. Moderación — Guardian (MVP 🔴)

Equivalente Carl-bot / Dyno / MEE6. **Imprescindible para lanzar.**

| Capability | Función |
|------------|---------|
| `moderation.automod` | Spam, flood, links, invites |
| `moderation.anti_raid` | Join threshold + captcha |
| `moderation.ban/kick/mute/warn` | Comandos slash |
| `moderation.logs` | Canales: usuarios, roles, mensajes, voz |

### 2. Comunidad (MVP + Growth)

| Módulo | Capability | Fase |
|--------|------------|------|
| Welcome | `community.welcome`, `community.captcha` | MVP |
| Reaction Roles | `community.reaction_roles` | Growth |
| Niveles | `community.xp`, `community.leaderboard` | Growth |
| Economy | `games.economy` | Future |
| Polls | `community.poll`, `community.giveaway` | Growth |

### 3. Entretenimiento (selectivo)

- **Polls/sorteos** → Growth (alto uso, bajo coste)
- **Juegos** → Future
- **Music** → Future, solo `music.spotify_status` (sin player)

### 4. Streamers — Streamer (MVP 🔴 ventaja clave)

Integración nativa **StreamAutomator**:

```
stream.started → POST /internal/akoenet/servers/:id/assistant/events
              → módulo streamer → anuncio canal + ping rol
```

Capabilities: `stream.notify`, `stream.schedule`, `stream.clip`, alertas Twitch/YouTube.

### 5. IA — Dakinis AI Platform (MVP 🔴 diferenciador)

| Módulo | Capability | Diferencia |
|--------|------------|------------|
| Assistant | `ai.ask`, `ai.summarize`, `ai.translate` | @AI copilot |
| Guardian AI | `ai.moderate` | Contexto, no solo palabras |
| Knowledge | `knowledge.search`, `knowledge.faq` | Docs del servidor |
| Translator | `ai.translate_auto` | Growth |
| Meeting AI | `ai.meeting_summary` | Future (voz) |
| Developer AI | `ai.code`, `ai.logs` | Growth |

**Killer feature:** moderación contextual — "este puto juego" = frustración, no insulto.

### 6–8. Business, Developer, Automation

| Categoría | Módulos | Integración |
|-----------|---------|-------------|
| Business | business, support | Core CRM, Billing |
| Developer | developer | GitHub, Railway, Supabase webhooks |
| Automation | automation | `akoenet.automations` — trigger → actions |

---

## API Internal (service-to-service)

Autenticación: `Authorization: Bearer <DAKINIS_INTERNAL_SERVICE_KEY>`

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/akoenet/assistant/modules` | Catálogo global |
| GET | `/akoenet/servers/:serverId/modules` | Módulos del servidor |
| PUT | `/akoenet/servers/:serverId/modules/:moduleKey` | `{ "enabled": true, "config": {} }` |
| POST | `/akoenet/servers/:serverId/assistant/command` | `{ "action": "ai.ask", "userId", "payload" }` |
| POST | `/akoenet/servers/:serverId/assistant/events` | `{ "type": "stream.started", "payload" }` |

### Ejemplo: StreamAutomator → AkoeNet

```http
POST https://api.dakinissystems.com/internal/akoenet/servers/42/assistant/events
Authorization: Bearer <INTERNAL_SERVICE_KEY>
Content-Type: application/json

{
  "type": "stream.started",
  "source": "streamautomator",
  "payload": {
    "platform": "twitch",
    "username": "christiandvillar",
    "title": "Building AkoeNet",
    "url": "https://twitch.tv/..."
  }
}
```

### Ejemplo: @AI en canal

```http
POST /internal/akoenet/servers/42/assistant/command
{
  "action": "ai.ask",
  "userId": "uuid",
  "channelId": "123",
  "payload": { "message": "¿Cómo configuro reaction roles?" }
}
```

Respuesta encola worker `akoenet:assistant` → `POST /ai/v1/chat` con metadata `serverId`, `module: assistant`.

---

## Schema Supabase

| Tabla | Uso |
|-------|-----|
| `akoenet.assistant_modules` | Catálogo global |
| `akoenet.server_modules` | ON/OFF + config por servidor |
| `akoenet.automations` | Flujos Cuando → Entonces |
| `akoenet.automation_runs` | Ejecuciones |
| `akoenet.moderation_logs` | Auditoría moderación |
| `akoenet.assistant_usage` | Tokens IA / billing |
| `akoenet.assistant_events` | Log eventos (033) |

---

## Flujos detallados

### Slash `/ban`

1. AkoeNet valida permiso `server:moderate`
2. Internal API `routeAssistantCommand` → capability `moderation.ban`
3. Orchestrator → módulo `guardian`
4. Guardian ejecuta + `moderation_logs`
5. Evento `moderation.action` → canal logs

### AutoMod (mensaje)

1. AkoeNet publica `message.created` → `/assistant/events`
2. `resolveModulesForEvent` → `guardian`, `guardian_ai`
3. Guardian: reglas (spam, flood, links)
4. Guardian AI: cola `akoenet:moderation-ai` si enabled

### Member join

1. `member.joined` → `welcome` (mensaje + rol) + `guardian` (anti-raid)

---

## Plan de implementación

### Fase 1 — MVP (~16 días)

| 🔴 | Entregable |
|----|------------|
| Guardian | AutoMod + /ban /kick /mute /warn + logs |
| Welcome | Mensaje + canal + rol |
| Assistant | @AI + resúmenes |
| Guardian AI | Toxicidad contextual |
| Streamer | Webhook StreamAutomator |
| Knowledge | FAQ search |

### Fase 2 — Growth

Automation visual · Developer webhooks · Niveles/XP · Events/RSVP · Reaction roles UI · Traductor

### Fase 3 — Escala

Business (CRM/tickets) · Meeting AI · Games/economía

---

## Uso en código

```javascript
import { createDefaultOrchestrator } from "@dakinis/akoenet-orchestrator";
import { invokeModule } from "@dakinis/akoenet-modules";

const orchestrator = createDefaultOrchestrator();
orchestrator.setActiveModules(["guardian", "assistant", "streamer"]);

const result = await orchestrator.route(
  {
    action: "ai.ask",
    serverId: "42",
    userId: "uuid",
    payload: { message: "¿Cómo invito miembros?" },
  },
  invokeModule
);
```

---

## Próximos pasos (Fase 1 MVP)

| Estado | Entregable |
|--------|------------|
| ✅ | Panel UI servidor — toggles `server_modules` (cliente + proxy backend) |
| ✅ | i18n módulos EN/ES en cliente (`assistantModuleI18n.js`) |
| ✅ | Event bridge — `message.created` / `member.joined` → Internal API |
| ✅ | Trigger `@AI` en chat → `POST .../assistant/command` (`ai.ask`) |
| ✅ | Migr. `032`–`033` en Supabase prod (jul 2026) |
| ⬜ | Worker Railway cola `akoenet:assistant` (respuesta real vía AI Platform) |
| ⬜ | Worker `akoenet:moderation-ai` (Guardian AI) |
| ⬜ | `AI_PLATFORM_URL` + service key en akoenet-backend / workers |
| ⬜ | Webhook StreamAutomator → eventos `stream.*` |
| ⬜ | Slash commands → `assistant/command` |
| ⬜ | AutoMod con acción real (no solo scaffold `allowed: true`) |

---

*Actualizar al cerrar Fase 1 MVP en `akoenet-backend`.*

---

<a id="products-md"></a>

# >> PRODUCTS.md

**Ruta:** `docs/PRODUCTS.md`

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
| **Versiones** | Client v1.5.26 · Backend v1.5.13 |

### Qué ofrece

| Área | Estado |
|------|--------|
| Servidores, canales, roles, chat, DMs | ✅ |
| Voz WebRTC (mesh) | ✅ |
| Auth IdP + Google + Twitch + Steam | ✅ |
| Desktop Tauri + Android Capacitor | ✅ |
| StreamAutomator integration | ✅ |
| **Dakinis Desktop** (`/workspace`) | 🚧 26 addons · 5 capabilities · solo Media Player live |
| **AkoeNet Assistant** (módulos nativos) | 🚧 |
| **Dakinis Media Player** (`/media`) | 🚧 MVP |
| Listen together / presence musical | 📅 |

**Diferenciador:** [AkoeNet Assistant](./AKOENET-ASSISTANT.md) — `@dakinis/akoenet-orchestrator` + Internal API `/akoenet/assistant/*`.

**Dakinis Desktop:** [`DAKINIS-WORKSPACE.md`](./DAKINIS-WORKSPACE.md) — Platform Services → Capabilities → **Desktop Runtime** → Addons. Kernel: [`DESKTOP-RUNTIME.md`](../projects/workspace/docs/DESKTOP-RUNTIME.md).

**Media Player:** mini-app con ventanas flotantes — valida el futuro **Dakinis Desktop** (`@dakinis/window-manager`). → [`AKOENET-ESTADO.md`](./AKOENET-ESTADO.md)

### Arquitectura

```
AkoeNet
├── Client (SPA + Tauri + Capacitor)
├── Backend (REST + Socket.IO)
├── Assistant (orchestrator + modules)
├── Dakinis Desktop (capabilities → 26 addons)
└── Widgets cross-product (Hub · AkoeNet · Core)
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

---

<a id="dakinis-workspace-md"></a>

# >> DAKINIS-WORKSPACE.md

**Ruta:** `docs/DAKINIS-WORKSPACE.md`

# Dakinis Workspace

> **Julio 2026** — Plataforma con SO propio: **Platform Services → Capabilities → Desktop Runtime → Addons → Widgets**  
> Kernel → [`projects/workspace/docs/DESKTOP-RUNTIME.md`](../projects/workspace/docs/DESKTOP-RUNTIME.md)

---

## Visión

Dakinis Desktop es un **framework**, no un listado de apps.

```
Platform Services    Auth · AI · Storage · Billing · Events · Metrics…
        ↓
Capabilities         Window Manager · Addon SDK · Widgets · Command Palette · Marketplace
        ↓
Desktop Runtime      lifecycle · event bus · permisos · layouts
        ↓
Addons (26)          mini-apps ensambladas
        ↓
Widgets              tiles en Hub · Workspace · AkoeNet · Core
```

**Media Player** = Hello World. El producto real: Runtime + Window Manager + SDK + Marketplace + Widget Framework.

---

## Platform Services ≠ Capabilities

| Capa | Qué es | Ejemplo |
|------|--------|---------|
| **Platform Service** | Backend compartido | `auth`, `storage`, `ai` |
| **Capability** | API de escritorio versionada | `window-manager@v1` |
| **Addon** | App instalable | Media Player, Terminal |

Terminal usa Platform `auth` + Capability `window-manager` — conceptos distintos.

---

## Desktop Runtime (kernel)

Orquesta el escritorio:

- Carga capabilities versionadas
- Registra addons (contrato `WorkspaceAddon`)
- **Event Bus** — `media.play`, `layout.changed`, `stream.started`, `voice.connected`…
- **Lifecycle** — `onInstall` → `onStart` → `onWorkspaceLoaded` → `onStop`
- Restaura layouts (Gaming, Developer, Office…)
- Permission Gate para Platform Services

Doc completa → [`DESKTOP-RUNTIME.md`](../projects/workspace/docs/DESKTOP-RUNTIME.md)

---

## Capabilities (5)

| Capability | Core addon (si aplica) |
|------------|------------------------|
| Window Manager | — |
| Addon SDK | — |
| Widget Framework | — |
| **Command Palette** | **Command Center** (`command-palette`) |
| Marketplace | Marketplace addon |

**Naming:** Command Palette = capability. Command Center = addon Core.

Versiones → [`catalog/capability-versions.json`](../projects/workspace/catalog/capability-versions.json)

---

## Contrato WorkspaceAddon

```typescript
interface WorkspaceAddon {
  id, version, tier
  permissions      // Platform Services
  capabilities     // { id, version }
  widgets, commands, windows, routes, settings
  lifecycle        // onInstall … onWorkspaceClosed
  dependencies     // required · optional · conflicts
}
```

→ [`ADDON-SDK.md`](../projects/workspace/docs/ADDON-SDK.md)

---

## Tiers (26 addons)

| Tier | Addons |
|------|--------|
| **Core** | Command Center, Activity Center, Dashboard, Marketplace, Settings |
| **Productivity** | Calendar, Notes, Kanban, AI Workspace, AI Actions… |
| **Developer** | Terminal, DevOps, Monitor, Code, Automation |
| **Stream / Media / Entertainment** | OBS, Stream Deck, Media Player, Soundboard… |
| **System** | File Explorer, Theme Studio, Downloads |

---

## Dependencias entre addons

| Tipo | Ejemplo |
|------|---------|
| `required` | OBS Companion → Stream Deck |
| `optional` | OBS → Media Player, Soundboard |
| `conflicts` | (reservado) |

→ [`catalog/addon-dependencies.json`](../projects/workspace/catalog/addon-dependencies.json)

---

## Marketplace

Addons · skins · widgets · themes · layouts · AI prompts · automation packs · sound packs

→ [`catalog/marketplace-types.json`](../projects/workspace/catalog/marketplace-types.json)

---

## Layouts y persistencia

Presets Gaming / Streaming / Developer / Office + perfiles Morning / Coding / Music

→ [`catalog/desktop-layouts.json`](../projects/workspace/catalog/desktop-layouts.json)

---

## Catálogos

| Archivo | Contenido |
|---------|-----------|
| `workspace-addons.json` | 26 addons, tiers, admission |
| `addon-dependencies.json` | Platform + capabilities + required/optional/conflicts |
| `capability-versions.json` | window-manager@v1… |
| `event-bus.json` | Eventos del Runtime |
| `desktop-layouts.json` | Presets + perfiles |
| `widgets.json` | Surfaces cross-product |

---

## Estado (jul 2026)

| Componente | Estado |
|------------|--------|
| DESKTOP-RUNTIME.md + contrato SDK | ✅ |
| Event bus + capability versioning | ✅ catálogo |
| Media Player Hello World | 🚧 AkoeNet live |
| `@dakinis/desktop-runtime` código | 📅 |
| SQL 034–036 (RLS, media, tiers) | ✅ prod jul 2026 |

---

## Relacionado

- [`CAPABILITIES.md`](../projects/workspace/docs/CAPABILITIES.md)
- [`ARCHITECTURE.md`](../projects/workspace/docs/ARCHITECTURE.md)
- SQL → [`035`](./supabase/migrations/035_dakinis_workspace_addons.sql) · [`036`](./supabase/migrations/036_dakinis_workspace_capabilities.sql)

---

<a id="workspace-capabilities-md"></a>

# >> workspace/CAPABILITIES.md

**Ruta:** `projects/workspace/docs/CAPABILITIES.md`

# Dakinis Desktop — Capabilities

> **Julio 2026** — Cinco capabilities reutilizables. Los addons las ensamblan; el **Desktop Runtime** las orquesta.  
> Kernel → [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

---

## Modelo mental

```
Platform Services     ← Auth, AI, Storage, Billing… (backend compartido)
        ↓
Capabilities          ← Window Manager, Widget Framework… (APIs de escritorio)
        ↓
Desktop Runtime       ← kernel: lifecycle, event bus, permisos, layouts
        ↓
Addons                ← Terminal, Media Player, Settings…
        ↓
Widgets               ← tiles cross-product
```

**Un Platform Service ≠ una Capability.**  
**Una Capability ≠ un Addon.**

| Concepto | Ejemplo |
|----------|---------|
| Platform Service | `auth`, `storage`, `ai` |
| Capability | `window-manager@v1` |
| Core addon | **Command Center** implementa capability **Command Palette** |
| Optional addon | Media Player — Hello World del ecosistema |

---

## Platform Services

Servicios de Dakinis Platform — los addons los solicitan en `permissions[]`:

| Service | Rol |
|---------|-----|
| Auth | Identidad, sesión |
| AI | Modelos, prompts |
| Storage | Archivos workspace |
| Billing | Suscripciones |
| Search | Búsqueda global |
| Knowledge | RAG |
| Events | Redis / dominio |
| Notifications | Alertas |
| Metrics | Railway, CPU, Supabase |

Lista completa → [`catalog/addon-dependencies.json`](../catalog/addon-dependencies.json) · `platformServices`

---

## Las cinco capabilities

Versionadas — [`catalog/capability-versions.json`](../catalog/capability-versions.json)

### 1. Window Manager (`@dakinis/window-manager` v1)

Ventanas flotantes, snap, z-index, layouts, persistencia.

Media Player demuestra que funciona. **No es el producto** — es la capability base.

### 2. Addon SDK (`@dakinis/addon-sdk` v1)

Contrato estricto `WorkspaceAddon` + lifecycle hooks.

→ [`ADDON-SDK.md`](./ADDON-SDK.md) · [`packages/addon-sdk/src/workspace-addon.contract.js`](../packages/addon-sdk/src/workspace-addon.contract.js)

### 3. Widget Framework (`@dakinis/widgets` v1)

Tiles en Hub, Workspace, AkoeNet, Core, Dashboard sin abrir el addon.

→ [`catalog/widgets.json`](../catalog/widgets.json)

### 4. Command Palette (`@dakinis/command-palette` v1)

**Capability:** acciones globales `Ctrl+K`.  
**Core addon:** **Command Center** (`id: command-palette`).

Usar **Command Palette** para la capability y **Command Center** para el addon en toda la documentación.

### 5. Marketplace (`@dakinis/marketplace` v1)

Distribución: addons, skins, themes, layouts, prompts, packs.

→ [`catalog/marketplace-types.json`](../catalog/marketplace-types.json)

---

## Desktop Runtime

Capa entre capabilities y addons — el «kernel»:

- Carga capabilities versionadas
- Registra addons (contrato + admission + dependencias)
- Event Bus in-process
- Permission Gate (Platform Services)
- Layout Engine (presets + perfiles)

Doc completa → [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

---

## Jerarquía de addons (tiers)

| Tier | Core addons / ejemplos |
|------|------------------------|
| **Core** | Command Center, Activity Center, Dashboard, Marketplace, Settings |
| **Productivity** | Calendar, Notes, Kanban, AI Workspace, AI Actions |
| **Developer** | Terminal, DevOps, Monitor, Code Editor, Automation |
| **Stream / Media / Entertainment** | Stream Deck, OBS, Media Player, Soundboard… |
| **System** | File Explorer, Theme Studio, Downloads |

→ [`catalog/workspace-addons.json`](../catalog/workspace-addons.json)

---

## Dependencias entre addons

Además de Platform + Capabilities:

| Tipo | Comportamiento |
|------|----------------|
| `required` | No activar sin dependencia |
| `optional` | Features extra si está presente |
| `conflicts` | Mutuamente excluyentes |

Ejemplo: **OBS Companion** → `required: [stream-deck]`, `optional: [media-player, soundboard]`

---

## Regla de admisión

Todo addon nuevo debe cumplir **al menos una**: mejora AkoeNet · mejora producto · vendible · reutilizable.

---

## Relacionado

- [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md) — kernel
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — capas
- [`../../../docs/DAKINIS-WORKSPACE.md`](../../../docs/DAKINIS-WORKSPACE.md) — producto

---

<a id="workspace-desktop-runtime-md"></a>

# >> workspace/DESKTOP-RUNTIME.md

**Ruta:** `projects/workspace/docs/DESKTOP-RUNTIME.md`

# Dakinis Desktop Runtime

> **Julio 2026** — El «kernel» de Dakinis Desktop. Orquesta capabilities, addons, eventos, layouts y permisos.  
> Capabilities → [`CAPABILITIES.md`](./CAPABILITIES.md) · Contrato addon → [`ADDON-SDK.md`](./ADDON-SDK.md)

---

## Modelo completo

```
Platform Services          ← infra compartida (Auth, AI, Storage…)
        ↓
Capabilities               ← APIs estables del escritorio (Window Manager, Widgets…)
        ↓
Desktop Runtime            ← kernel: ciclo de vida, event bus, permisos, layouts
        ↓
Addons                     ← mini-apps ensambladas sobre el runtime
        ↓
Widgets                    ← tiles embebibles cross-product
```

**Un Platform Service no es una Capability.**  
**Una Capability no es un Addon.**

| Capa | Qué es | Ejemplo |
|------|--------|---------|
| Platform Service | Servicio backend compartido por toda Dakinis | `auth`, `storage`, `ai` |
| Capability | API de escritorio versionada y reutilizable | `window-manager@v1` |
| Desktop Runtime | Orquestador que carga capabilities y addons | `WorkspaceRuntime` |
| Addon | Aplicación instalable | Media Player, Terminal |
| Widget | Vista ligera de un addon o producto | LifeFlow Score |

---

## Platform Services vs Capabilities

### Platform Services

Servicios de **Dakinis Platform** — disponibles vía Internal API / SDK de producto:

| Service | Uso típico |
|---------|------------|
| `auth` | Identidad, sesión, OAuth |
| `ai` | Modelos, prompts, tokens |
| `storage` | Archivos, uploads, workspace files |
| `billing` | Suscripciones, Stripe |
| `search` | Búsqueda cross-product |
| `knowledge` | RAG, documentos |
| `events` | Eventos de dominio (Redis) |
| `notifications` | Push, in-app, email |
| `metrics` | CPU, Railway, Supabase health |

Los addons declaran **permissions** (Platform Services) en el manifest. El Runtime valida antes de conceder acceso.

### Capabilities

APIs de **Dakinis Desktop** — implementadas en `projects/workspace/packages/`:

| Capability | Paquete | Versión actual |
|------------|---------|----------------|
| Window Manager | `@dakinis/window-manager` | **v1** |
| Addon SDK | `@dakinis/addon-sdk` | **v1** |
| Widget Framework | `@dakinis/widgets` | **v1** |
| Command Palette | `@dakinis/command-palette` | **v1** |
| Marketplace | `@dakinis/marketplace` | **v1** |

Versionado → [`catalog/capability-versions.json`](../catalog/capability-versions.json)

**Naming:** la capability se llama **Command Palette**. El addon Core que la implementa se llama **Command Center** (`id: command-palette`).

---

## Responsabilidades del Runtime

El Desktop Runtime (`@dakinis/desktop-runtime` / `desktop/desktop-shell`) es quien:

| Responsabilidad | Detalle |
|-----------------|---------|
| Cargar capabilities | Resuelve versiones soportadas (`window-manager@v1`) |
| Registrar addons | Valida contrato `WorkspaceAddon`, tier, admission |
| Abrir ventanas | Delega en Window Manager |
| Restaurar layouts | Lee `meta.workspace_desktop_profiles` + presets |
| Sincronizar widgets | Registra tiles por surface (Hub, AkoeNet, Core…) |
| Permisos | Platform Services solicitados vs concedidos |
| Ciclo de vida | `onInstall` → `onStart` → `onStop` |
| Event Bus | Pub/sub entre addons sin acoplamiento directo |

```mermaid
flowchart TB
  subgraph runtime [Desktop Runtime]
    Loader[Capability Loader]
    Registry[Addon Registry]
    Bus[Event Bus]
    Perm[Permission Gate]
    Layout[Layout Engine]
  end

  subgraph caps [Capabilities v1]
    WM[window-manager]
    SDK[addon-sdk]
    WF[widgets]
    CP[command-palette]
    MP[marketplace]
  end

  subgraph addons [Addons]
    A1[media-player]
    A2[terminal]
    A3[command-palette addon]
  end

  Loader --> caps
  Registry --> addons
  addons --> Bus
  Bus --> addons
  runtime --> WM
  runtime --> Layout
  Perm --> Platform[(Platform Services)]
```

---

## Ciclo de vida del Workspace

### 1. Boot

```
1. Runtime inicia
2. Carga capability-versions.json → window-manager@v1, addon-sdk@v1…
3. Resuelve addons instalados (meta.workspace_addon_installs)
4. Core tier siempre ON — no desinstalable
5. Emite workspace.loading
```

### 2. Register addons

Por cada addon habilitado:

```
1. Validar contrato WorkspaceAddon (manifest + exports)
2. Comprobar admission rules
3. Resolver dependencias (required / optional / conflicts)
4. Conceder permissions (Platform Services)
5. Llamar lifecycle.onStart()
6. Registrar windows, widgets, commands, routes
```

### 3. Restore layout

```
1. Leer perfil activo (Morning, Coding, Streaming…)
2. O aplicar preset (gaming, developer, office)
3. Abrir ventanas vía Window Manager
4. Restaurar dock pins + widget grid
5. Emitir layout.restored
6. Emitir workspace.loaded
```

### 4. Shutdown

```
1. lifecycle.onWorkspaceClosed() en cada addon activo
2. lifecycle.onStop()
3. Persistir layout si dirty
4. Emitir workspace.closed
```

---

## Event Bus

Bus interno del Runtime — **no confundir** con Platform `events` (Redis).

```
Desktop Runtime
      ↓
  Event Bus (in-process)
      ↓
 Addon · Addon · Addon · Addon
```

Catálogo: [`catalog/event-bus.json`](../catalog/event-bus.json)

| Evento | Emisor | Consumidores típicos |
|--------|--------|----------------------|
| `workspace.loaded` | Runtime | Dashboard, Activity Center |
| `workspace.closed` | Runtime | Todos |
| `layout.changed` | Layout Engine | Settings, Dashboard |
| `layout.restored` | Layout Engine | Addons con ventanas abiertas |
| `theme.changed` | Settings addon | Todos (re-render) |
| `media.play` | media-player | Widgets, Command Center |
| `media.pause` | media-player | Widgets |
| `stream.started` | obs-companion / StreamAutomator | Activity Center, AkoeNet |
| `voice.connected` | AkoeNet | soundboard, live-dashboard |
| `addon.enabled` | Runtime | Marketplace |
| `addon.disabled` | Runtime | Marketplace |
| `command.executed` | Command Palette | Activity Center (audit) |

### API (addon)

```javascript
// Suscribirse
ctx.events.on('media.play', ({ trackId }) => { ... });

// Emitir (solo si el addon tiene permiso)
ctx.events.emit('media.play', { trackId, source: 'media-player' });

// Una vez
ctx.events.once('workspace.loaded', () => { ... });
```

Los addons **no se importan entre sí**. Se comunican por eventos o widgets compartidos.

---

## Contrato WorkspaceAddon

Contrato estricto — ver [`ADDON-SDK.md`](./ADDON-SDK.md) y [`packages/addon-sdk/src/workspace-addon.contract.js`](../packages/addon-sdk/src/workspace-addon.contract.js).

```typescript
interface WorkspaceAddon {
  id: string
  version: string
  tier: 'core' | 'productivity' | 'developer' | 'stream' | 'media' | 'entertainment' | 'system'
  permissions: PlatformService[]      // Platform Services
  capabilities: CapabilityRef[]       // ej. { id: 'window-manager', version: '1' }
  widgets: Record<string, WidgetDef>
  commands: CommandDef[]                // registradas en Command Palette
  windows: Record<string, WindowDef>
  routes: RouteDef[]
  settings?: SettingsSchema
  lifecycle: AddonLifecycle
  dependencies?: {
    required?: string[]
    optional?: string[]
    conflicts?: string[]
  }
}
```

El Runtime **rechaza** addons que no cumplan el contrato en build o registro.

---

## Lifecycle hooks

| Hook | Cuándo |
|------|--------|
| `onInstall()` | Primera instalación en workspace |
| `onEnable()` | Admin activa addon en Hub |
| `onDisable()` | Admin desactiva addon |
| `onStart(ctx)` | Runtime carga addon (sesión) |
| `onStop(ctx)` | Runtime descarga addon |
| `onWorkspaceLoaded(ctx)` | Tras `workspace.loaded` — restaurar estado UI |
| `onWorkspaceClosed(ctx)` | Antes de `workspace.closed` — persistir estado |

```javascript
export const lifecycle = {
  onStart(ctx) {
    ctx.windows.register('player', PlayerWindow);
    ctx.widgets.register('media.now-playing', NowPlayingTile);
    ctx.commands.register({ id: 'media.open', title: 'Open Media Player', run: () => ... });
  },
  onWorkspaceLoaded(ctx) {
    // re-abrir última ventana si el layout lo incluye
  },
  onStop(ctx) {
    ctx.events.offAll();
  },
};
```

---

## Permisos

Flujo:

```
1. Addon declara permissions[] en manifest (Platform Services)
2. Runtime consulta workspace policy + user role
3. Permission Gate concede o deniega
4. ctx.platform.auth, ctx.platform.storage… solo expone lo concedido
5. Intento no autorizado → error + log Activity Center
```

Capabilities no requieren permiso Platform — el Runtime las inyecta según `capabilities[]` del manifest.

---

## Layouts y persistencia

| Fuente | Uso |
|--------|-----|
| Presets | `catalog/desktop-layouts.json` — Gaming, Streaming, Developer, Office |
| Perfiles | `meta.workspace_desktop_profiles` — Morning, Coding, Music… |
| API | `desktop-api/v1/layouts` |

Layout Engine (parte del Runtime):

1. Resuelve preset o perfil
2. Para cada `{ addonId, windows[] }` → Window Manager.open
3. Aplica widget grid por surface
4. Emite `layout.restored`

Cambios manuales del usuario → debounce → `layout.changed` → persist.

---

## Widget sync

1. Addon registra widgets en `onStart`
2. Runtime publica en **Widget Registry** por surface
3. Hub / AkoeNet / Core consumen registry vía Internal API o embed SDK
4. Actualizaciones → Event Bus (`widget.updated`)

Media Player es el **Hello World**: demuestra windows + widgets + events. El producto real es Runtime + capabilities.

---

## Dependencias entre addons

Tres tipos — [`catalog/addon-dependencies.json`](../catalog/addon-dependencies.json):

| Tipo | Comportamiento |
|------|----------------|
| `required` | Runtime no activa addon sin dependencia instalada |
| `optional` | Features extra si está presente |
| `conflicts` | No pueden estar activos a la vez |

Ejemplo **OBS Companion**:

```json
"required": ["stream-deck"],
"optional": ["media-player", "soundboard"],
"conflicts": []
```

---

## Versionado de capabilities

Cuando Window Manager pase a v2:

```json
"window-manager": {
  "current": "2",
  "supported": ["1", "2"],
  "deprecated": ["1"]
}
```

Addons declaran `capabilities: [{ "id": "window-manager", "version": "1" }]`.  
Runtime carga adapter v1 o v2. Addons legacy siguen en v1 hasta migración.

---

## Estructura en repo

```
projects/workspace/
├── desktop/
│   └── desktop-shell/     # WorkspaceRuntime entry
├── packages/
│   ├── desktop-runtime/   # Kernel (loader, bus, permissions, layout)
│   ├── window-manager/
│   ├── addon-sdk/
│   └── widgets/
├── catalog/
│   ├── capability-versions.json
│   ├── event-bus.json
│   └── addon-dependencies.json
└── docs/
    └── DESKTOP-RUNTIME.md   ← este documento
```

---

## Estado de implementación

| Componente | Estado |
|------------|--------|
| Documento kernel + contrato | ✅ |
| Event bus catalog + lifecycle spec | ✅ |
| Capability versioning catalog | ✅ |
| `@dakinis/desktop-runtime` package | 📅 scaffold |
| Layout Engine wired | 📅 |
| Permission Gate E2E | 📅 |
| Media Player como Hello World | 🚧 live en AkoeNet |

---

## Relacionado

- [`CAPABILITIES.md`](./CAPABILITIES.md) — las cinco capabilities
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — vista de capas
- [`ADDON-SDK.md`](./ADDON-SDK.md) — contrato y scaffold
- [`../../../docs/DAKINIS-WORKSPACE.md`](../../../docs/DAKINIS-WORKSPACE.md) — doc producto

---

<a id="workspace-architecture-md"></a>

# >> workspace/ARCHITECTURE.md

**Ruta:** `projects/workspace/docs/ARCHITECTURE.md`

# Dakinis Workspace — Architecture

## Vision

**Dakinis Desktop** is a modular desktop OS — not a plugin marketplace. Addons are assembled from **capabilities** and orchestrated by the **Desktop Runtime**.

Read first: [`CAPABILITIES.md`](./CAPABILITIES.md) · Kernel: [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

```
Platform Services → Capabilities → Desktop Runtime → Addons → Widgets
```

Media Player is the **Hello World** — proof that Window Manager + Runtime + SDK work. The real product is the runtime stack.

---

## Three layers (do not mix)

| Layer | What | Example |
|-------|------|---------|
| **Platform Services** | Shared backend | `auth`, `storage`, `ai` |
| **Capabilities** | Versioned desktop APIs | `window-manager@v1` |
| **Addons** | Installable mini-apps | `media-player`, `terminal` |

Terminal needs Platform `auth` + Capability `window-manager` — different concepts.

---

## Stack diagram

```mermaid
flowchart TB
  subgraph platform [Platform Services]
    Auth
    AI
    Storage
    Events
    Notifications
    Metrics
  end

  subgraph capabilities [Capabilities v1]
    WM[window-manager]
    SDK[addon-sdk]
    WF[widget-framework]
    CP[command-palette]
    MPcap[marketplace]
  end

  subgraph runtime [Desktop Runtime]
    Loader
    Registry
    Bus[Event Bus]
    Perm[Permission Gate]
    Layout[Layout Engine]
  end

  subgraph addons [Addons]
    CC[Command Center]
    Media[media-player]
    Term[terminal]
  end

  platform --> Perm
  capabilities --> Loader
  Loader --> runtime
  runtime --> Registry
  Registry --> addons
  addons --> Bus
  Bus --> addons
  runtime --> WM
  runtime --> Layout
```

---

## Naming: Command Palette vs Command Center

| Term | Meaning |
|------|---------|
| **Command Palette** | Capability — global `Ctrl+K` action system |
| **Command Center** | Core addon (`id: command-palette`) that implements the capability |

Use consistently in docs, catalog and UI copy.

---

## Directory layout

```
projects/workspace/
├── desktop/
│   └── desktop-shell/       # Runtime entry
├── packages/
│   ├── desktop-runtime/     # Kernel (planned)
│   ├── window-manager/
│   ├── addon-sdk/           # WorkspaceAddon contract
│   └── widgets/
├── catalog/
│   ├── workspace-addons.json
│   ├── addon-dependencies.json   # platform + capabilities + required/optional/conflicts
│   ├── capability-versions.json
│   ├── event-bus.json
│   ├── desktop-layouts.json
│   └── widgets.json
└── docs/
    ├── DESKTOP-RUNTIME.md     # Kernel spec
    ├── CAPABILITIES.md
    ├── ARCHITECTURE.md
    └── ADDON-SDK.md
```

---

## Event Bus

Runtime-owned in-process bus — addons communicate without direct imports.

Examples: `workspace.loaded` · `layout.changed` · `media.play` · `stream.started` · `voice.connected`

→ [`catalog/event-bus.json`](../catalog/event-bus.json)

---

## Capability versioning

`window-manager` v1 today → v2 later with `supported: ["1","2"]`. Addons declare `{ id, version }` in manifest.

→ [`catalog/capability-versions.json`](../catalog/capability-versions.json)

---

## Database (Supabase `meta`)

| Table | Purpose |
|-------|---------|
| `meta.workspace_addons` | Global catalog |
| `meta.workspace_addon_installs` | Per-workspace ON/OFF |
| `meta.workspace_desktop_profiles` | Saved layouts |

---

## Implementation status

| Layer | Status |
|-------|--------|
| Docs: Runtime, contract, event bus, deps | ✅ |
| `@dakinis/desktop-runtime` code | 📅 |
| Media Player Hello World | 🚧 live AkoeNet |
| Layout persistence API | 📅 |

---

## Related

- [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)
- [`../../../docs/DAKINIS-WORKSPACE.md`](../../../docs/DAKINIS-WORKSPACE.md)

---

<a id="platform-setup-steps-md"></a>

# >> PLATFORM-SETUP-STEPS.md

**Ruta:** `docs/PLATFORM-SETUP-STEPS.md`

# Pasos operativos — Supabase y servicios

> Checklist para activar **Hub Workspace Admin** (031), **AkoeNet Assistant** (032–033) y validar deploys en producción.  
> Arquitectura → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) · [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md) · Estado → [`STATUS.md`](./STATUS.md)

---

## Orden recomendado

```
027–029 (Hub Mi día) → 031 (Workspace) → deploy Internal API + Hub
  → 032 (Assistant módulos) → 033 (Assistant expansión)
  → 034 (RLS + media schema) → 035 (Dakinis Desktop addons) → 036 (tiers + Settings/Monitor/AI Actions)
  → provision workspace addons (26)
  → deploy akoenet-backend + akoenet-client
```

Si 027–029 no están aplicadas, 031 puede ejecutarse igual; el backfill de productos usa `hub.tenant_product_access` si existe.

**Estado jul 2026:** `031` ✅ · `032`–`033` ✅ · `034`–`036` ✅ · cliente `/workspace` v1.5.30+ ✅ · modelo capabilities documentado ✅ · **siguiente:** re-provision addons (26) + workers Assistant.

---

## 1. Supabase — SQL Editor

Proyecto: **Dakinis Production** · [Supabase Dashboard](https://supabase.com/dashboard)

### Paso 1.1 — Migración 031 (Workspace + Super Admin) ✅

1. Pega [`supabase/migrations/031_workspace_super_admin.sql`](./supabase/migrations/031_workspace_super_admin.sql) → Run
2. Verifica:

```sql
SELECT count(*) FROM meta.workspaces;
SELECT count(*) FROM meta.workspace_members;
SELECT flag_key, enabled FROM meta.feature_flags WHERE flag_key LIKE 'hub.%';
```

3. **Provisioning completo** (super admin + tenant Core + workspace + productos):

[`supabase/scripts/provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql)

Idempotente — incluye `core.tenant_memberships` (sin fila = Hub muestra `no_workspace`).

Alternativa mínima solo flags: [`grant_super_admin_christiandvillar.sql`](./supabase/scripts/grant_super_admin_christiandvillar.sql)

### Paso 1.2 — Migración 032 (AkoeNet Assistant — módulos) ✅

**Requisito:** schema `akoenet` activo ([`006_akoenet.sql`](./supabase/migrations/006_akoenet.sql)).

1. Pega [`032_akoenet_assistant_modules.sql`](./supabase/migrations/032_akoenet_assistant_modules.sql) → Run
2. Verifica:

```sql
SELECT key, name, phase FROM akoenet.assistant_modules ORDER BY phase, key;
```

### Paso 1.3 — Migración 033 (AkoeNet Assistant — expansión) ✅

1. Pega [`033_akoenet_assistant_expansion.sql`](./supabase/migrations/033_akoenet_assistant_expansion.sql) → Run
2. Verifica:

```sql
SELECT count(*) FROM akoenet.assistant_events;
SELECT key FROM akoenet.assistant_modules WHERE key IN ('translator', 'support', 'events', 'levels');
```

### Paso 1.4 — Registrar migraciones (opcional)

```sql
INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES
  ('031_workspace_super_admin.sql', true, 'manual prod'),
  ('032_akoenet_assistant_modules.sql', true, 'manual prod'),
  ('033_akoenet_assistant_expansion.sql', true, 'manual prod'),
  ('034_rls_security_advisor_deny_policies.sql', true, 'manual prod'),
  ('034_akoenet_media_player.sql', true, 'manual prod'),
  ('035_dakinis_workspace_addons.sql', true, 'manual prod jul 2026'),
  ('036_dakinis_workspace_capabilities.sql', true, 'manual prod jul 2026')
ON CONFLICT (migration_file) DO NOTHING;
```

### Paso 1.5 — Migración 034 (RLS Security Advisor) ✅

Corrige **«RLS Enabled No Policy»** en `legacy_akoenet.*`, gaps `meta.*` y tablas nuevas post-006.

1. Pega [`034_rls_security_advisor_deny_policies.sql`](./supabase/migrations/034_rls_security_advisor_deny_policies.sql) → Run
2. La query final debe devolver **0 filas**
3. Refresca Security Advisor en Supabase Dashboard

**Media Player (misma fase 034):** [`034_akoenet_media_player.sql`](./supabase/migrations/034_akoenet_media_player.sql) — schema `media.*` + RLS base.

### Paso 1.6 — Migración 035 (Dakinis Desktop — catálogo addons) ✅

**Requisito:** schema `meta` + workspace `dakinis-platform` (031 + provisioning).

1. Pega [`035_dakinis_workspace_addons.sql`](./supabase/migrations/035_dakinis_workspace_addons.sql) → Run
2. Verifica:

```sql
SELECT count(*) FROM meta.workspace_addon_catalog;
```

3. **Provisioning addons** para super admin (26 installs activos tras 036):

[`supabase/scripts/provision_workspace_addons_christiandvillar.sql`](./supabase/scripts/provision_workspace_addons_christiandvillar.sql)

Verificar: `node scripts/verify-workspace-provisioning.mjs`

4. **Provisioning Assistant** (opcional — requiere `owner_id` del servidor = tu user auth):

[`supabase/scripts/provision_akoenet_assistant_christiandvillar.sql`](./supabase/scripts/provision_akoenet_assistant_christiandvillar.sql)

Scripts CLI: `node scripts/run-supabase-sql-files.mjs` · `.\scripts\provision-platform-workspace.ps1`

### Paso 1.7 — Migración 036 (Capabilities — tiers + addons nuevos) ✅

1. Pega [`036_dakinis_workspace_capabilities.sql`](./supabase/migrations/036_dakinis_workspace_capabilities.sql) → Run
2. Verifica:

```sql
SELECT key, tier FROM meta.workspace_addons WHERE key IN ('settings', 'monitor', 'ai-actions');
SELECT count(*) FROM meta.workspace_desktop_profiles;
```

3. **Re-ejecutar** [`provision_workspace_addons_christiandvillar.sql`](./supabase/scripts/provision_workspace_addons_christiandvillar.sql) para activar Settings, Monitor y AI Actions.

---

## 2. Railway — Internal API

Servicio: `dakinis-internal-api`

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Supabase pooler `:6543` |
| `DAKINIS_INTERNAL_SERVICE_KEY` | secreto fuerte |
| `REDIS_URL` | Redis Railway |

1. Deploy con cambios en `internal/` (rutas `/workspaces/*`, `/admin/v1/*`, `/akoenet/assistant/*`)
2. Health:

```powershell
curl https://api.dakinissystems.com/internal/health
```

3. Smoke workspace:

```powershell
$k = $env:DAKINIS_INTERNAL_SERVICE_KEY
$uid = "TU-USER-UUID"
curl -H "Authorization: Bearer $k" "https://api.dakinissystems.com/internal/workspaces/me/$uid"
```

4. Smoke assistant (catálogo):

```powershell
curl -H "Authorization: Bearer $k" "https://api.dakinissystems.com/internal/akoenet/assistant/modules"
```

**Commits referencia:** `9cb3f00` (workspace) · `5dfbdca` (assistant).

---

## 3. Railway — Hub (`dakinis-hub`)

| Variable | Valor |
|----------|--------|
| `HUB_INTERNAL_SERVICE_KEY` | mismo que Internal API |
| `HUB_INTERNAL_URL` | `http://dakinis-internal-api.railway.internal:4083` |
| `HUB_API_BASE` | `https://api.dakinissystems.com` |

1. Deploy Hub con panel `/admin`
2. Verifica (logueado IdP):
   - `https://hub.dakinissystems.com/admin`
   - Miembros · Plan · Productos · Configuración

**Commits referencia:** `8f42833` · `15dc18b`

### Dev local

```powershell
cd d:\dakinis-systems\hub
npm ci
# .env: VITE_INTERNAL_SERVICE_KEY, VITE_HUB_DEMO_USER_ID, VITE_API_BASE
npm run dev
```

Abre `http://localhost:5175/admin`

---

## 4. Billing E2E (para Plan en Hub Admin)

Sin esto, la pestaña **Plan** muestra datos pero el portal puede fallar.

1. [`scripts/smoke-billing-e2e.ps1`](../scripts/smoke-billing-e2e.ps1)
2. Stripe → Webhook → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`
3. `STRIPE_WEBHOOK_SECRET` en dakinis-billing
4. Checkout test → verificar `billing.subscriptions` y plan en Core

---

## 5. AkoeNet — Backend + Cliente

### 5.1 Repos

| Repo | Local | Rol |
|------|-------|-----|
| `akoenet-backend` | `apps/akoenet/Server` | API REST + Socket.IO + proxy assistant |
| `akoenet-client` | `apps/akoenet/Client` | Web · Tauri · Capacitor |

Clonar: `.\scripts\clone-akoenet.ps1`

### 5.2 Railway — akoenet-backend

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Postgres dedicado o Supabase (`public` schema legacy) |
| `DAKINIS_INTERNAL_SERVICE_KEY` | mismo que Internal API |
| `DAKINIS_INTERNAL_URL` | `http://dakinis-internal-api.railway.internal:4083` |
| `VITE_API_URL` / gateway | `https://api.akoenet.dakinissystems.com` (cliente) |

Sin `DAKINIS_INTERNAL_*` los toggles del panel Assistant **no persisten** (404 o error silencioso).

1. Deploy backend (`9015f7f2`+ — healthcheck OK)
2. Verificar:

```powershell
curl -s -o /dev/null -w "%{http_code}" https://api.akoenet.dakinissystems.com/health
```

### 5.3 Railway — akoenet-client

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://api.akoenet.dakinissystems.com` |

Panel **Assistant** en ajustes del servidor → `GET/PUT /servers/:id/assistant/modules`.

Ruta **Dakinis Desktop** → `/workspace` (launcher addons, Ctrl+K). Requiere Client **v1.5.26+** (fix build `e89d77a`).

**Commits referencia:** `eabcb95` (panel) · `8b8d91f` (apiBase fix) · `2c9fef9` (workspace) · `e89d77a` (build fix deploy).

### 5.4 Internal API — rutas Assistant

| Método | Ruta |
|--------|------|
| GET | `/internal/akoenet/assistant/modules` |
| GET | `/internal/akoenet/servers/:serverId/modules` |
| PUT | `/internal/akoenet/servers/:serverId/modules/:moduleKey` |
| POST | `/internal/akoenet/servers/:serverId/assistant/command` |
| POST | `/internal/akoenet/servers/:serverId/assistant/events` |

Backend expone proxy público (JWT usuario): `/servers/:serverId/assistant/modules`.

### 5.5 Event bridge (implementado en backend)

Con `DAKINIS_INTERNAL_*` configurado, **akoenet-backend** reenvía automáticamente:

| Evento local | Internal API |
|--------------|--------------|
| `message.created` (socket + REST) | `POST .../assistant/events` |
| `member.joined` (join / invite) | `POST .../assistant/events` |
| Mensaje con `@AI` en texto | `POST .../assistant/command` (`ai.ask`) |

Código: `apps/akoenet/Server/src/services/assistant-events.service.js` · registrado en `lib/register-domain-handlers.js`.

Los handlers de módulos siguen en **scaffold** hasta workers BullMQ + migr. prod.

### 5.6 StreamAutomator → AkoeNet (siguiente)

```
POST https://api.dakinissystems.com/internal/akoenet/servers/{serverId}/assistant/events
Authorization: Bearer <INTERNAL_SERVICE_KEY>

{ "type": "stream.started", "source": "streamautomator", "payload": { "platform": "twitch", "title": "...", "url": "..." } }
```

### 5.7 Workers BullMQ (Fase 1 — pendiente)

Colas: `akoenet:assistant`, `akoenet:moderation-ai`, `akoenet:knowledge`  
Conectar `AI_PLATFORM_URL` + service key para `@AI` y Guardian AI.

### 5.8 Sync packages antes de deploy Internal API

```powershell
cd d:\dakinis-systems
node scripts/sync-akoenet-packages.mjs
node scripts/verify-package-drift.mjs
```

Copia `packages/akoenet-*` → `internal/packages/` (lo que importa Railway).

---

## 6. Feature flags (opcional)

Tras 031:

```sql
UPDATE meta.feature_flags SET enabled = true WHERE flag_key = 'hub.workspace_admin';
```

O vía Internal API:

```powershell
curl -X PATCH -H "Authorization: Bearer $k" -H "Content-Type: application/json" `
  -d '{"enabled":true}' `
  "https://api.dakinissystems.com/internal/admin/v1/features/hub.workspace_admin"
```

---

## 7. Checklist final

### Hub Admin

- [x] Migr. **031** aplicada en Supabase
- [x] `meta.workspace_members` — script provisioning super admin
- [x] Internal API desplegada con rutas workspace
- [x] Hub desplegado — `/admin` accesible
- [ ] Invitar miembro de prueba funciona
- [ ] Productos on/off se reflejan en launcher
- [ ] Portal Billing abre (tras E2E)

### AkoeNet Assistant

- [x] Migr. **032** aplicada
- [x] Migr. **033** aplicada
- [x] Código orchestrator + Internal API + UI toggles + i18n EN/ES
- [x] Backend proxy módulos + event bridge (`message.created`, `member.joined`, `@AI`)
- [x] Sync script `scripts/sync-akoenet-packages.mjs`
- [ ] Toggles persisten E2E en prod
- [ ] Guardian AutoMod en canal test
- [ ] @AI responde vía AI Platform
- [ ] Stream live anuncia en AkoeNet
- [ ] `assistant_usage` registra tokens

### Dakinis Desktop (`/workspace`)

- [x] Migr. **035** aplicada + catálogo 23 addons
- [x] Provision addons `dakinis-platform` (christiandvillar)
- [x] Internal API + Hub `workspaceAddons` en dashboard
- [x] Client v1.5.26 desplegado — `/workspace` accesible
- [ ] Assistant modules provisionados (owner servidor alineado)
- [ ] UI real por addon (Terminal, AI, …) — hoy preview

---

## 8. AkoeNet login 503 `database_schema_outdated`

**Importante:** migr. **031/032/033** (platform `akoenet` schema) ≠ migraciones **akoenet-backend** (`node-pg-migrate` → tabla `public.users`).

El 503 en login = BD del servicio Railway **akoenet-backend** sin schema legacy.

### Diagnóstico Supabase

[`scripts/akoenet_backend_schema_check.sql`](./supabase/scripts/akoenet_backend_schema_check.sql)

### Fix Railway (akoenet-backend)

1. Confirma `DATABASE_URL` en Variables
2. Pooler Supabase: `?sslmode=no-verify` + `ALLOW_INSECURE_DB_SSL=true`
3. **Redeploy** — arranque ejecuta `runStartupMigrations()` → `npm run migrate`
4. O shell: `npm run migrate`

Login debe devolver **401** con credenciales malas, no **503**.

---

## 9. Super admin — christiandvillar@gmail.com

Ejecutar en Supabase (si no usaste el script completo):

[`scripts/provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql)

Redeploy **Hub** si no ves enlace **Admin** (hub v0.3.0+).

---

## 10. StreamAutomator build — `supabasePublicUrl`

Si el build falla con `Could not resolve ../../utils/supabasePublicUrl`:

```powershell
cd d:\dakinis-systems\apps\streamautomator
git add apps/web/src/utils/supabasePublicUrl.js
git commit -m "fix(web): add supabasePublicUrl util for Settings build"
git push
```

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| `/admin` dice "migración 031 pendiente" | Sin `meta.workspaces` / members | 031 + provisioning script |
| `/admin` `no_workspace` | Sin `core.tenant_memberships` | `provision_workspace_christiandvillar.sql` |
| 401 en `/api/hub/me/workspace` | JWT IdP no enviado | Login Hub con IdP |
| 503 `service_key` | Falta `HUB_INTERNAL_SERVICE_KEY` | Railway vars Hub |
| Portal billing error | Billing E2E incompleto | [`STATUS.md`](./STATUS.md) Prioridad 1 |
| Assistant 404 en toggles | Cliente usa `api.dakinissystems.com` sin host AkoeNet | `VITE_API_URL=https://api.akoenet.dakinissystems.com` |
| Assistant error con API correcta | Backend caído o sin `DAKINIS_INTERNAL_*` | Redeploy backend + vars |
| Módulos en inglés con UI en ES | Sin i18n cliente | `serverAssistant.modules.*` en `enServerUi.js` / `esServerUi.js` |
| `@AI` no responde | Workers BullMQ ⬜ | `akoenet:assistant` worker + AI Platform + vars Railway |
| Módulos no en DB | 032 no aplicada | Verificar `akoenet.assistant_modules` (032 ✅ jul 2026) |

---

*Actualizar al cerrar cada hito en prod.*

---

<a id="migrate-akoenet-md"></a>

# >> MIGRATE-AKOENET.md

**Ruta:** `docs/supabase/MIGRATE-AKOENET.md`

# Migrar AkoeNet → dakinis-platform (Supabase)

Guía para mover **datos y esquema** del proyecto Supabase **AkoeNet** al proyecto **dakinis-platform**, y dejar de pagar el proyecto independiente.

## Resumen

| Origen | Destino |
|--------|---------|
| Supabase **AkoeNet** (`public.users`, `servers`, `messages`…) | Supabase **dakinis-platform** |
| Esquema `public` solo AkoeNet | Esquema `akoenet.*` + `dakinis_auth.users` |

**No copies** el dump entero sobre `public` en dakinis-platform: ahí viven también StreamAutomator (`"Users"`, `"Contents"`…). Usamos staging `legacy_akoenet`.

## Requisitos

- [PostgreSQL client](https://www.postgresql.org/download/) (`psql`, `pg_dump`) en PATH
- Connection strings **directos** (puerto `5432`, no pooler) para `pg_dump`/`COPY`
- En dakinis-platform: migraciones `000`–`006` ya aplicadas (`akoenet` schema existe)
- Backup del proyecto AkoeNet antes de borrarlo

## Paso 1 — Variables

```powershell
# Origen: Supabase AkoeNet → Settings → Database → URI (Session mode, 5432)
$env:AKOENET_DATABASE_URL = "postgresql://postgres.[ref]:[pass]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Destino: Supabase dakinis-platform (misma región eu-west-1 recomendada)
$env:PLATFORM_DATABASE_URL = "postgresql://postgres.[ref]:[pass]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

> Usa la contraseña de **Database password**, no la anon key.

## Paso 2 — Staging en destino

En el SQL Editor de **dakinis-platform**, **New query** (no Snippets guardados), pega y ejecuta en orden:

1. `docs/supabase/scripts/legacy_akoenet_staging.sql`

### Mismo proyecto Supabase (origen = destino)

Si `AKOENET_DATABASE_URL` y `PLATFORM_DATABASE_URL` tienen el **mismo** `postgres.[ref]` (ej. `omdosutakaefpowscagp`), los datos ya están en `public.users`, `public.servers`… No uses `pg_dump` entre URLs.

2. `docs/supabase/scripts/copy_public_akoenet_to_staging.sql`

### Proyectos Supabase distintos

Usa el script PowerShell (Paso 3) con **origen** = AkoeNet y **destino** = dakinis-platform.

> **Puerto:** migraciones DDL/COPY siempre con **`:5432`** (session). **No** uses `:6543?pgbouncer=true` (solo apps en runtime).

Crea el schema `legacy_akoenet` con la misma forma que AkoeNet standalone.

## Paso 3 — Exportar datos desde AkoeNet

```powershell
cd d:\dakinis-systems
.\scripts\migrate-akoenet-to-platform.ps1 `
  -SourceDatabaseUrl $env:AKOENET_DATABASE_URL `
  -DestDatabaseUrl $env:PLATFORM_DATABASE_URL
```

El script:

1. Comprueba `psql` / `pg_dump`
2. Ejecuta staging en destino (si `-SkipStaging` no está)
3. Por cada tabla AkoeNet, hace `pg_dump --data-only` y reescribe `public.` → `legacy_akoenet.`
4. Muestra conteos en staging

**Tablas exportadas:** users, servers, members, roles, channels, messages, DMs, reacciones, invites, emojis, social, legal, etc.  
**No se exportan:** `pgmigrations`, `refresh_tokens` (los usuarios vuelven a iniciar sesión vía SSO).

## Paso 4 — Backfill a esquema unificado

En SQL Editor de **dakinis-platform**, en orden:

| # | Archivo | Qué hace |
|---|---------|----------|
| 14a | `014a_auth_nullable_password.sql` | Solo si 014 falla |
| 14 | `014_backfill_legacy_map.sql` | Usuarios Stream (si aplica) |
| **15b** | **`015b_backfill_akoenet_data.sql`** | **legacy_akoenet → akoenet.*** |

Al final verás filas de verificación (users, servers, messages…).

## Paso 5 — Cutover backend AkoeNet

1. Railway **akoenet-backend** → `DATABASE_URL` = URI de **dakinis-platform** (pooler `:6543` para app)
2. Añadir `search_path=akoenet,dakinis_auth,public` o actualizar ORM a tablas `akoenet.*`
3. Redeploy y probar login + mensajes + servidores
4. `.\scripts\smoke-hub-sso-products.ps1 -Product akoenet`

## Paso 6 — Apagar AkoeNet

Solo cuando:

- [ ] Conteos origen ≈ destino (`legacy_akoenet` vs `akoenet.*`)
- [ ] App prod funciona 24–48 h
- [ ] Backup `.sql` guardado en lugar seguro

Entonces pausa o elimina el proyecto Supabase **AkoeNet**.

## Conflictos de email

Si un usuario existe en StreamAutomator y AkoeNet con el mismo email, `014` hace `ON CONFLICT (email) DO NOTHING` en `dakinis_auth.users`. El perfil AkoeNet se enlaza al usuario ya existente por email.

## Archivos relacionados

| Archivo | Rol |
|---------|-----|
| `docs/supabase/migrations/006_akoenet.sql` | DDL destino |
| `docs/supabase/migrations/015b_backfill_akoenet_data.sql` | Migración datos |
| `docs/supabase/scripts/legacy_akoenet_staging.sql` | Tablas staging |
| `scripts/migrate-akoenet-to-platform.ps1` | Export automático |
| `docs/supabase/migrations/RUN-ORDER.md` | Orden global |

## Rollback

- Staging: `DROP SCHEMA legacy_akoenet CASCADE;`
- Datos migrados: truncar `akoenet.*` (cuidado en prod) y re-ejecutar 015b
- No toca `stream.*` ni `"Users"` de StreamAutomator

---

<a id="akoenet-backend-readme-md"></a>

# >> akoenet-backend README.md

**Ruta:** `apps/akoenet/Server/README.md`

# AkoeNet — Backend

API REST y WebSockets de **AkoeNet**: autenticación (email, Twitch, Steam), servidores, canales, mensajes, DMs, subidas y presencia de juego.

**Mantenido por [Dakinis Systems](https://dakinissystems.com).**

## Producción

| Servicio | URL |
|----------|-----|
| API | https://api.akoenet.dakinissystems.com |
| Frontend | https://akoenet.dakinissystems.com |

Health: `GET /health`, `GET /health/ready`, `GET /health/auth-schema`.

## Requisitos

- Node.js 20+
- PostgreSQL (p. ej. Supabase en producción)

## Comandos

```bash
npm ci
cp .env.example .env    # ajustar DATABASE_URL, JWT, Twitch, etc.
npm run migrate
npm run dev
npm start
npm test
```

## Variables críticas (producción)

```env
NODE_ENV=production
BACKEND_URL=https://api.akoenet.dakinissystems.com
FRONTEND_URL=https://akoenet.dakinissystems.com
DATABASE_URL=postgresql://...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
```

Twitch redirect en consola de desarrollador (debe coincidir exactamente):

`https://api.akoenet.dakinissystems.com/api/user/auth/twitch/callback`

En Supabase/Railway, si aparece `SELF_SIGNED_CERT_IN_CHAIN`, usa `?sslmode=no-verify` en `DATABASE_URL` o las variables documentadas en `.env.example`.

## Despliegue

- **Railway / Docker:** `Dockerfile` en la raíz; healthcheck `GET /health` en el puerto `PORT` (p. ej. 8080).
- Las migraciones se ejecutan en el arranque y con `npm run migrate`.

## Licencia

MIT — Copyright (c) Dakinis Systems.

---

<a id="services-media-readme-md"></a>

# >> services/media/README.md

**Ruta:** `services/media/README.md`

# dakinis-media (dev scaffold)

API de referencia para el addon **Dakinis Media Player**. En producción irá a repo `dakinis-media` + Railway `media-api.dakinissystems.com`.

## Dev local

```powershell
# Terminal 1 — API (puerto 4090)
cd services/media
npm run dev

# Terminal 2 — AkoeNet client (proxy /media-api → localhost:4090)
cd apps/akoenet/Client
npm run dev
```

Abrir `http://localhost:5173/media` (requiere login AkoeNet).

## Endpoints

- `GET /health`
- `GET /media/tracks` (Bearer JWT)
- Ver contrato: [`projects/media-player/contracts/media-api.json`](../projects/media-player/contracts/media-api.json)

## UI

Implementación en `apps/akoenet/Client/src/modules/media-player/`.

---

<a id="services-media-skins-classic-readme-md"></a>

# >> services/media/skins/classic/README.md

**Ruta:** `services/media/skins/classic/README.md`

# Assets Classic skin

Place PNG sprites here (MVP puede usar CSS puro sin imágenes):

- `player.png` — fondo ventana principal
- `playlist.png` — fondo playlist
- `eq.png` — fondo ecualizador
- `buttons.png` — spritesheet controles

Hasta que existan assets, `SkinRenderer` usa fallback CSS con colores del manifest.

---

<a id="projects-media-player-readme-md"></a>

# >> projects/media-player/README.md

**Ruta:** `projects/media-player/README.md`

# Dakinis Media Player — addon AkoeNet

> Reproductor inspirado en Winamp (estética retro, ventanas flotantes) integrado en AkoeNet como **addon instalable**, no como página tradicional.

**Identidad:** nostálgico por fuera, moderno por dentro — Web Audio API, salas “escuchar juntos”, skins de comunidad, plugins opcionales.

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Capas, repos, gateway, realtime |
| [docs/WINDOW-MANAGER.md](./docs/WINDOW-MANAGER.md) | Gestor de ventanas reutilizable (DWM) |
| [docs/AUDIO-ENGINE.md](./docs/AUDIO-ENGINE.md) | Pipeline Web Audio + formatos |
| [docs/SKINS.md](./docs/SKINS.md) | Sistema de skins (.dskin / manifest) |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema `media` en Supabase |
| [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) | Rutas, voz, amigos, marketplace |
| [docs/MARKETPLACE.md](./docs/MARKETPLACE.md) | Registro del addon y plugins |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Fases MVP → comunidad |

## Artefactos

| Path | Uso |
|------|-----|
| [schemas/001_media.sql](./schemas/001_media.sql) | Migración Supabase inicial |
| [contracts/media-api.json](./contracts/media-api.json) | Contrato gateway `/media/` |
| [examples/skin-classic/](./examples/skin-classic/) | Skin de referencia |
| [scaffold/](./scaffold/) | Árbol de carpetas objetivo (frontend + backend) |

## Repos previstos (fase 2+)

| Repo GitHub | Rol |
|-------------|-----|
| `dakinis-media` (nuevo) | API + WebSocket salas + metadata |
| `akoenet-client` | Módulo UI `modules/media-player/` |
| `dakinis-systems` | Contratos, SQL, gateway `/media/` |

## Quick start (dev)

```powershell
# API + client (desde raíz dakinis-systems)
.\scripts\dev-media-player.ps1

# O por separado:
cd services/media && npm run dev          # :4090
cd apps/akoenet/Client && npm run dev       # :5173 → /media
```

UI integrada en `apps/akoenet/Client/src/modules/media-player/`.

## Nota legal / producto

No clonar Winamp ni usar marca “Winamp”. Inspiración visual + UX propia (**Dakinis Media Player**).  
Música: biblioteca del usuario, streams con licencia, radios públicas — ver [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) § DMCA.

---

<a id="projects-media-player-docs-architecture-md"></a>

# >> projects/media-player/docs/ARCHITECTURE.md

**Ruta:** `projects/media-player/docs/ARCHITECTURE.md`

# Arquitectura — Dakinis Media Player

> Addon de AkoeNet · ventanas flotantes · motor Web Audio · salas sincronizadas

---

## Posición en el ecosistema

```mermaid
flowchart TB
  subgraph platform [Dakinis Platform]
    GW[Gateway api.dakinissystems.com]
    Auth[Auth]
    AI[AI]
    Billing[Billing]
    Internal[Internal API]
    MKT[Marketplace futuro]
  end

  subgraph akoenet [AkoeNet]
    Client[akoenet-client]
    Backend[akoenet-backend]
    Voice[Voice channels]
    Chat[Chat / servers]
  end

  subgraph media [Media addon]
    MUI[Media Player UI]
    MAPI[dakinis-media API]
    MWS[WebSocket rooms]
    MWorker[Transcode / scan worker]
  end

  Client --> MUI
  MUI --> GW
  GW -->|/media/| MAPI
  MUI --> MWS
  MAPI --> Auth
  MAPI --> AI
  Backend -->|presence / voice state| MWS
  MAPI --> PG[(Supabase schema media)]
  MWorker --> PG
  MKT --> Client
```

| Capa | Responsabilidad |
|------|-----------------|
| **UI (Client)** | Ventanas, skins, ecualizador, visualizer, mini player |
| **dakinis-media** | Playlists, tracks metadata, salas, streams, skins registry |
| **akoenet-backend** | Presencia “now playing”, permisos en servidor, hooks voz |
| **Auth** | JWT IdP, mismo usuario AkoeNet |
| **AI** | Playlists generadas, letras, recomendaciones (fase 3) |
| **Gateway** | Prefijo `/media/` → servicio media |

---

## No es una “página más”

El módulo se monta como **mini-app**:

- Ruta lazy `/media/*` o launcher desde Assistant / sidebar.
- **Window Manager** (DWM) gestiona ventanas independientes (player, playlist, EQ, library…).
- Estado en `store/` + persistencia local (IndexedDB) para cola y preferencias.
- Opcional: ventana Tauri/Electron desacoplada en desktop (mismo bundle).

---

## Servicios

### Frontend — `akoenet-client`

```
apps/akoenet/Client/src/modules/media-player/
```

Ver árbol completo en [../scaffold/frontend/README.md](../scaffold/frontend/README.md).

### Backend — `dakinis-media` (repo nuevo)

```
services/media/          # repo GitHub: dakinis-media
├── src/
│   ├── routes/
│   ├── services/
│   ├── websocket/
│   └── workers/
├── Dockerfile
└── railway.toml
```

**Railway:** `media-api.dakinissystems.com` + gateway `/media/`  
**Private DNS:** `dakinis-media.railway.internal:4090` (puerto reservado)

### Integración Assistant existente

El módulo **Music** del [AkoeNet Assistant](../../docs/AKOENET-ASSISTANT.md) hoy es “solo status”.  
Este addon **sustituye/evoluciona** esa capacidad cuando el tenant instala “Media Player” desde marketplace — sin bots externos.

---

## Flujos clave

### Reproducción local

```mermaid
sequenceDiagram
  participant UI as MainWindow
  participant Eng as audioEngine
  participant IDB as IndexedDB
  UI->>Eng: loadTrack(url)
  Eng->>Eng: decode → gain → EQ → analyser → output
  Eng-->>UI: timeupdate / ended
  UI->>IDB: persist queue position
```

### Escuchar juntos (listening room)

```mermaid
sequenceDiagram
  participant A as User A client
  participant WS as media WebSocket
  participant B as User B client
  A->>WS: room.join + play(trackId, positionMs)
  WS->>B: room.state
  B->>B: sync playback (drift correction)
  A->>WS: seek / pause
  WS->>B: room.state
```

Sincronización: reloj del servidor + offset RTT; líder = `owner_id` o DJ role.

### Addon en canal de voz

- Panel en canal: “🎵 Sincronizado — *Artist – Title* [Unirse]”.
- Backend AkoeNet publica `voice_channel.media_room_id` (opcional).
- No mezcla audio en el SFU de voz en v1 — cada cliente reproduce localmente sincronizado.

---

## API surface (resumen)

Prefijo gateway: **`/media/`** → contrato [../contracts/media-api.json](../contracts/media-api.json).

| Área | Ejemplos |
|------|----------|
| Biblioteca | `GET /v1/tracks`, `POST /v1/tracks/import` |
| Playlists | CRUD playlists + reorder |
| Salas | `POST /v1/rooms`, WS `/v1/rooms/:id/sync` |
| Streams | `GET /v1/streams/radio?url=` (proxy metadata) |
| Skins | `GET /v1/skins`, `POST /v1/skins/install` |
| Plugins | manifest registry (fase 4) |

---

## Seguridad

- JWT AkoeNet / IdP en todas las rutas mutables.
- URLs de audio: signed URLs (R2/S3) o blob local-only en v1 desktop.
- Salas: ACL por `server_id` + roles AkoeNet.
- Rate limit en proxy de streams de radio.

---

## Decisiones (ADR light)

| Decisión | Motivo |
|----------|--------|
| Web Audio API, no `<audio>` solo | EQ, visualizer, effects chain |
| Ventanas flotantes (DWM) | UX Winamp-like reutilizable en otros módulos Dakinis |
| Repo `dakinis-media` separado | Dominio acotado, deploy independiente |
| Schema `media` en Supabase | Mismo patrón que `akoenet`, RLS por user |
| Skins propias (.dskin) | Evitar .wsz propietario; inspiración compatible |

---

## Referencias internas

- [WINDOW-MANAGER.md](./WINDOW-MANAGER.md)
- [AUDIO-ENGINE.md](./AUDIO-ENGINE.md)
- [INTEGRATION-AKOENET.md](./INTEGRATION-AKOENET.md)
- [ROADMAP.md](./ROADMAP.md)

---

<a id="projects-media-player-docs-audio-engine-md"></a>

# >> projects/media-player/docs/AUDIO-ENGINE.md

**Ruta:** `projects/media-player/docs/AUDIO-ENGINE.md`

# Motor de audio — Web Audio API

---

## Pipeline

```
Archivo / Stream URL
        ↓
   AudioContext
        ↓
  AudioBufferSourceNode  (o MediaElementSource + decode)
        ↓
     GainNode (volume)
        ↓
  BiquadFilterNode ×10  (equalizer bands)
        ↓
  Optional: Convolver (reverb), DynamicsCompressor (limiter)
        ↓
  AnalyserNode  → visualizer
        ↓
  AudioDestinationNode (output)
```

Implementación objetivo: `scaffold/frontend/services/audioEngine.js`.

---

## Formatos

| Formo | v1 | Notas |
|-------|----|-------|
| MP3 | ✅ | decodeAudioData |
| WAV | ✅ | |
| OGG | ✅ | |
| FLAC | ⚠️ | WASM decoder (ej. libflac.js) fase 2 |
| AAC | ⚠️ | Safari native; resto WASM |
| HLS radio | ✅ | `<audio>` hidden → MediaElementSource |

**Local files:** File API → blob URL → decode.  
**Remote:** signed URL desde `dakinis-media` o import Jellyfin plugin (fase 4).

---

## Ecualizador 10 bandas

Frecuencias estándar (Hz): 60, 170, 310, 600, 1k, 3k, 6k, 12k, 14k, 16k.

```js
const BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]
// BiquadFilterNode type 'peaking', Q ≈ 1.4
```

Presets: Flat, Rock, Pop, Jazz, Bass Boost, Vocal, Custom (persist user).

---

## Efectos (fases)

| Efecto | Fase |
|--------|------|
| Crossfade entre pistas | M2 |
| ReplayGain / normalización | M2 |
| Balance L/R | M1 |
| Limiter | M2 |
| Reverb | M3 |

---

## Visualizer

- `AnalyserNode.fftSize = 2048`
- Modos: spectrum bars, oscilloscope, “milkdrop-lite” canvas shader (M3)
- Throttle RAF cuando ventana oculta

---

## Streaming radio

```
GET /media/v1/streams/resolve?url=...
→ { playableUrl, title, format, icyMetadata }
```

Proxy en backend para ICY metadata y CORS; cliente solo reproduce URL permitida.

---

## Performance

- Un solo `AudioContext` por pestaña; resume on user gesture.
- Liberar `AudioBuffer` al cambiar pista.
- Worker opcional para decode off main thread (fase 2).

---

<a id="projects-media-player-docs-database-md"></a>

# >> projects/media-player/docs/DATABASE.md

**Ruta:** `projects/media-player/docs/DATABASE.md`

# Base de datos — schema `media`

> Supabase Postgres · RLS por `user_id` · migración [../schemas/001_media.sql](../schemas/001_media.sql)

---

## ER (resumen)

```mermaid
erDiagram
  users ||--o{ playlists : owns
  playlists ||--o{ playlist_tracks : contains
  tracks ||--o{ playlist_tracks : in
  users ||--o{ favorites : marks
  tracks ||--o{ favorites : on
  users ||--o{ listening_rooms : owns
  listening_rooms ||--o{ room_members : has
  users ||--o{ room_members : joins
  tracks ||--o| listening_rooms : plays
  users ||--o{ user_skins : installs
  skins ||--o{ user_skins : installed
```

`users` referencia `dakinis_auth.users` o `akoenet.users` según cutover — usar UUID IdP.

---

## Tablas

### `media.tracks`

Metadata; el binario vive en R2/local (no en PG).

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| owner_id | uuid FK | quien importó |
| title | text | |
| artist | text | |
| album | text | |
| duration_ms | int | |
| source | enum | `local`, `upload`, `radio`, `plugin` |
| storage_key | text | R2 path nullable |
| cover_url | text | |
| created_at | timestamptz | |

### `media.playlists` / `media.playlist_tracks`

Playlists ordenadas; `position` int.

### `media.favorites`

`(user_id, track_id)` PK compuesta.

### `media.skins` / `media.user_skins`

Registry de skins marketplace + instaladas por usuario.

### `media.listening_rooms` / `media.room_members`

Estado de sala sincronizada:

| listening_rooms | |
|-----------------|---|
| current_track_id | uuid nullable |
| position_ms | bigint |
| playing | boolean |
| server_id | uuid nullable | AkoeNet server |
| voice_channel_id | uuid nullable |

---

## Índices

- `playlist_tracks(playlist_id, position)`
- `tracks(owner_id, created_at desc)`
- `listening_rooms(server_id) where server_id is not null`

---

## RLS (política)

- `tracks`: SELECT own + tracks en salas públicas del servidor si miembro.
- `playlists`: CRUD solo `owner_id = auth.uid()`.
- `listening_rooms`: UPDATE solo owner o rol DJ; SELECT miembros.

---

## Eventos (opcional)

`media.play_events` para scrobble / analytics / Last.fm plugin:

```
user_id, track_id, played_at, duration_ms, source
```

---

<a id="projects-media-player-docs-integration-akoenet-md"></a>

# >> projects/media-player/docs/INTEGRATION-AKOENET.md

**Ruta:** `projects/media-player/docs/INTEGRATION-AKOENET.md`

# Integración AkoeNet

---

## Montaje en el cliente

```jsx
// apps/akoenet/Client/src/App.jsx (futuro)
const MediaPlayerApp = lazy(() => import('./modules/media-player'))

<Route path="/media/*" element={<MediaPlayerApp />} />
```

Launcher:

- Sidebar: icono 🎵 “Media” (si addon instalado).
- Assistant panel: módulo **Music Player** reemplaza “solo status”.
- Amigo: “Christian está escuchando…” en presence card.

---

## Presencia “Now Playing”

```json
{
  "activity": "listening",
  "media": {
    "trackId": "uuid",
    "title": "One More Time",
    "artist": "Daft Punk",
    "roomId": "uuid-or-null",
    "startedAt": "2026-07-12T06:00:00Z"
  }
}
```

Publicado vía:

1. Client → `PATCH /auth/presence` (akoenet-backend) o
2. WebSocket media → backend bridge (fase 2).

UI amigo:

```
▶ Christian
Now Playing: Daft Punk — One More Time
[Join Session]
```

---

## Canales de voz

Panel en canal activo:

```
🎵 Música sincronizada
Hans Zimmer — Time
[Escuchar juntos]  [Abrir player]
```

- `voice_channel.media_room_id` en metadata de canal (JSON).
- No inyectar audio en SFU v1 — sync por WebSocket (ver ARCHITECTURE).

---

## Permisos

| Acción | Rol mínimo |
|--------|------------|
| Abrir player | miembro servidor |
| Crear sala sync | Connect + |
| DJ (skip track) | rol `dj` o owner sala |
| Subir tracks a servidor | Admin o canal dedicado #music |

Reutilizar `akoenet.server_members` + flags en `media.server_settings`.

---

## DMCA / contenido

| Permitido v1 | Evitar v1 |
|--------------|-----------|
| Archivos locales del usuario | Scraping Spotify/YT |
| Radio streams licenciados | Bot música en canal 24/7 con catálogo comercial |
| Metadata scrobble | Re-host MP3 de terceros |

Plugins Spotify/Jellyfin (fase 4) usan OAuth del usuario — el stream va del proveedor al cliente, no por servidor Dakinis.

---

## Variables Railway (futuro)

**dakinis-media**

| Variable | Ejemplo |
|----------|---------|
| `DATABASE_URL` | Supabase pooler |
| `POSTGRES_SCHEMA` | `media` |
| `CORS_ORIGINS` | `https://akoenet.dakinissystems.com` |
| `DAKINIS_AUTH_URL` | `https://auth.dakinissystems.com` |
| `REDIS_URL` | salas WS pub/sub |
| `R2_*` | opcional uploads |

**akoenet-client**

| Variable | Ejemplo |
|----------|---------|
| `VITE_MEDIA_API_URL` | `https://api.dakinissystems.com/media` |
| `VITE_MEDIA_WS_URL` | `wss://media-api.../v1/ws` |

---

## Gateway

Añadir en `gateway/routes/default.conf`:

```
location /media/ {
  proxy_pass https://media-api.dakinissystems.com;
  ...
}
```

Contrato: [../contracts/media-api.json](../contracts/media-api.json).

---

<a id="projects-media-player-docs-marketplace-md"></a>

# >> projects/media-player/docs/MARKETPLACE.md

**Ruta:** `projects/media-player/docs/MARKETPLACE.md`

# Marketplace — addon y plugins

---

## Addon principal

| Campo | Valor |
|-------|-------|
| slug | `akoenet-media-player` |
| type | `akoenet-addon` |
| name | Dakinis Media Player |
| requires | AkoeNet ≥ 1.6, Auth IdP |
| billing_sku | `addon_media_player` (opcional Pro) |

Instalación:

1. Usuario → Hub Marketplace o AkoeNet Store.
2. `POST /internal/marketplace/install` → flag en `akoenet.server_modules`.
3. Client carga chunk `media-player` lazy.

Desinstalación: oculta UI; datos `media.*` del usuario persisten.

---

## Tipos de extensiones

| type | Ejemplo |
|------|---------|
| `media-skin` | Cyberpunk, Matrix |
| `media-plugin-source` | Jellyfin, Radio Browser |
| `media-plugin-export` | Last.fm scrobble |
| `media-plugin-presence` | Discord Rich Presence (desktop) |

Manifest plugin:

```json
{
  "id": "plugin/jellyfin",
  "type": "media-plugin-source",
  "permissions": ["network:jellyfin.example.com", "storage:preferences"],
  "entry": "dist/index.js",
  "apiVersion": 1
}
```

Sandbox v1: plugins solo **source providers** (lista tracks), sin eval arbitrario en web — iframe/worker en fase posterior.

---

## Skins en marketplace

- Pack oficial Dakinis (gratis).
- Community (review queue).
- Revenue share 70/30 futuro (Billing).

---

## API marketplace (Internal)

```
GET  /internal/marketplace/addons?product=akoenet
POST /internal/marketplace/servers/:id/modules/media-player
```

Estado en DB:

```sql
akoenet.server_modules (server_id, module_key, enabled, config jsonb)
-- module_key = 'media_player'
```

---

## Relación con Hub

Hub tile opcional “Media” → deep link `akoenet://media` o URL `https://akoenet.../media`.

Widget “Now playing en el servidor” para admins (fase 3).

---

<a id="projects-media-player-docs-roadmap-md"></a>

# >> projects/media-player/docs/ROADMAP.md

**Ruta:** `projects/media-player/docs/ROADMAP.md`

# Roadmap — Dakinis Media Player

---

## Fase 0 — Diseño (actual)

- [x] Carpeta proyecto + arquitectura
- [x] Schema SQL + contrato API
- [x] Scaffold árbol frontend/backend
- [ ] ADR en `docs/adr/ADR-0xx-media-player.md`
- [ ] Aprobación producto / legal DMCA

---

## Fase 1 — MVP “Winamp feel” (8–10 semanas)

**Objetivo:** reproductor personal usable, sin salas sync.

| Entrega | Detalle |
|---------|---------|
| DWM básico | drag, persist layout |
| Main + Playlist + EQ | 10 bandas Web Audio |
| Local files | drag-drop, cola |
| Mini player | shade mode |
| Skin Dakinis + Classic | 2 temas |
| API mínima | playlists CRUD metadata |
| Ruta `/media` | lazy en akoenet-client |

**No incluye:** plugins, marketplace, listen together.

---

## Fase 2 — AkoeNet social (4–6 semanas)

| Entrega | Detalle |
|---------|---------|
| Listening rooms | WebSocket sync |
| Presence | now playing en amigos |
| Canal voz | panel “escuchar juntos” |
| Radio | stream resolver + ICY |
| FLAC decode | WASM |

---

## Fase 3 — Pulido + IA (4 semanas)

| Entrega | Detalle |
|---------|---------|
| Visualizer milkdrop-lite | |
| AI playlists | Dakinis AI |
| Letras sincronizadas | LRCLIB / AI |
| Marketplace skins | install flow |
| `@dakinis/window-manager` | package extract |

---

## Fase 4 — Plugins + desktop (ongoing)

| Entrega | Detalle |
|---------|---------|
| Jellyfin / Plex source | |
| Spotify Connect (OAuth) | |
| Tauri mini player always-on-top | |
| Community plugins SDK | |
| Modo “Dakinis Desktop” | multi-app DWM |

---

## Métricas éxito

| Métrica | MVP | 6 meses |
|---------|-----|---------|
| Usuarios con addon activo | 50 beta | 500 |
| Tiempo sesión media | 15 min | 25 min |
| Salas sync / semana | — | 100 |
| Skins community | 2 | 20 |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| DMCA | solo user content + licensed radio |
| Performance mobile | visualizer off, mini UI |
| Sync drift | NTP + leader correction |
| Scope creep | Fase 1 estricta |

---

<a id="projects-media-player-docs-skins-md"></a>

# >> projects/media-player/docs/SKINS.md

**Ruta:** `projects/media-player/docs/SKINS.md`

# Sistema de skins

> Inspirado en Winamp, formato propio **`.dskin`** (zip) — no usar assets ni marca Winamp.

---

## Estructura de un skin

```
classic.dskin (zip)
├── manifest.json
├── assets/
│   ├── player.png          # sprite sheet o 9-slice
│   ├── playlist.png
│   ├── eq.png
│   ├── buttons.png         # sprite map en manifest
│   └── background.webp
├── fonts/
│   └── led.ttf
└── sounds/                 # opcional UI clicks
    └── click.wav
```

---

## manifest.json

Ver [../examples/skin-classic/manifest.json](../examples/skin-classic/manifest.json).

Campos clave:

| Campo | Descripción |
|-------|-------------|
| `id` | slug único (`dakinis/classic`) |
| `version` | semver |
| `windows.*` | assets por ventana |
| `sprites.buttons` | mapa `{ play: {x,y,w,h}, ... }` |
| `colors` | tokens CSS |
| `metrics.titlebarHeight` | hit area drag |

---

## Runtime

1. Usuario elige skin en Settings o Marketplace.
2. Client descarga `.dskin` → cache IndexedDB.
3. `SkinRenderer` aplica CSS variables + background-image regions.
4. Fallback a tema **Dakinis** si asset falla.

---

## Marketplace

Skins publicadas como addon type `media-skin`:

- Gratis / de pago (Billing futuro).
- Verificación manual o firma Dakinis para skins oficiales.
- Community skins: badge “Community” + sandbox CSS (no JS en skins v1).

---

## Compatibilidad .wsz

**No objetivo v1.** Conversor offline opcional en fase “nostalgia” — solo si legalmente claro.

---

## Temas Dakinis DES

Skins oficiales alineadas con `@dakinis/design`:

- `Dakinis` — accent violeta / dark
- `Neon` — cyan + grid
- `Minimal Dark` — flat, sin sprites
- `Classic` — LED verde sobre gris (homage, no clone)

---

<a id="projects-media-player-docs-window-manager-md"></a>

# >> projects/media-player/docs/WINDOW-MANAGER.md

**Ruta:** `projects/media-player/docs/WINDOW-MANAGER.md`

# Dakinis Window Manager (DWM)

> Gestor de ventanas flotantes reutilizable — el Media Player es la **primera app**; luego CRM, terminal, calendario, etc.

---

## Concepto

Patrón distinto al SaaS “sidebar + content”:

```
Desktop (capa z-index)
├── Main Player      (320×116, snap)
├── Playlist         (275×232)
├── Equalizer        (275×116)
├── Library          (400×300)
├── Visualizer       (256×128)
├── Lyrics           (300×200)
└── Mini Player      (dock / always on top)
```

Cada ventana:

- Arrastrable (`pointer-events`, titlebar hit area).
- Minimizable / cerrable / “shade” (modo compacto estilo Winamp).
- Acoplable (snap edges entre ventanas del mismo grupo).
- Persistencia de posición en `localStorage` / `media.player.layout.v1`.

---

## Paquete propuesto

```
packages/dakinis-window-manager/
├── src/
│   ├── WindowManager.jsx      # Provider + registry
│   ├── FloatingWindow.jsx     # Shell chrome (titlebar, resize)
│   ├── WindowDock.jsx         # Snap / attach logic
│   ├── useWindowLayout.js
│   └── types.ts
├── package.json
└── README.md
```

**Consumidores:**

- `akoenet-client` → Media Player
- `hub` (futuro) → widgets flotantes
- `core` (futuro) → POS compact mode

---

## API del manager

```jsx
<WindowManager group="media-player" persistKey="akoenet.media.layout">
  <FloatingWindow id="main" title="Dakinis Player" defaultBounds={{ x: 80, y: 80, w: 320, h: 116 }}>
    <MainWindow />
  </FloatingWindow>
  <FloatingWindow id="playlist" title="Playlist" defaultBounds={{ x: 80, y: 220, w: 275, h: 232 }}>
    <PlaylistWindow />
  </FloatingWindow>
</WindowManager>
```

Hooks:

```js
const { open, close, toggle, focus, bounds } = useWindow('playlist')
const { snapTogether, detach } = useWindowDock('main', 'playlist')
```

---

## SkinRenderer

`SkinRenderer` lee manifest de skin y mapea:

| Región manifest | Componente |
|-----------------|------------|
| `windows.player` | sprites + hit zones |
| `windows.playlist` | lista scroll |
| `fonts.main` | tipografía LED |
| `colors.text` | CSS variables `--dmp-text` |

Modo **fallback**: tema CSS “Dakinis Neon” sin sprites.

---

## Modo compacto / mini player

- **Shade:** colapsa ventana principal a barra de título + transport.
- **Mini:** ventana 160×48, always-on-top (permiso Tauri/Electron).
- **Dock AkoeNet:** icono en sidebar con tooltip “Now playing”.

---

## Accesibilidad

- Focus trap opcional por ventana modal.
- Atajos globales (`Space`, `Ctrl+→`, `Ctrl+L`) registrados en `usePlayerHotkeys`.
- `prefers-reduced-motion` desactiva visualizer pesado.

---

## Roadmap DWM

| Fase | Entrega |
|------|---------|
| M1 | FloatingWindow + drag + persist |
| M2 | Snap + shade + z-order |
| M3 | Extraer a `@dakinis/window-manager` |
| M4 | Hub / Core pilots |

---

<a id="projects-media-player-scaffold-readme-md"></a>

# >> projects/media-player/scaffold/README.md

**Ruta:** `projects/media-player/scaffold/README.md`

# Scaffold

Árbol de carpetas **objetivo** para implementación. No es código ejecutable — guía para Fase 1.

| Carpeta | Destino real |
|---------|--------------|
| [frontend/](./frontend/) | `apps/akoenet/Client/src/modules/media-player/` |
| [backend/](./backend/) | repo `dakinis-media` |

Ver [../docs/ROADMAP.md](../docs/ROADMAP.md) para orden de implementación.

---

<a id="projects-media-player-scaffold-frontend-readme-md"></a>

# >> projects/media-player/scaffold/frontend/README.md

**Ruta:** `projects/media-player/scaffold/frontend/README.md`

# Scaffold — Frontend (akoenet-client)

> Destino: `apps/akoenet/Client/src/modules/media-player/`  
> Copiar/adaptar al iniciar Fase 1.

## Árbol objetivo

```
media-player/
├── index.jsx                 # Entry: lazy route + WindowManagerProvider
├── MediaPlayerApp.jsx        # Shell DWM + skin loader
│
├── components/
│   ├── windows/
│   │   ├── MainWindow.jsx    # Transport, seek, volume, shade
│   │   ├── PlaylistWindow.jsx
│   │   ├── EqualizerWindow.jsx
│   │   ├── LibraryWindow.jsx
│   │   ├── VisualizerWindow.jsx
│   │   ├── LyricsWindow.jsx
│   │   ├── QueueWindow.jsx
│   │   └── SettingsWindow.jsx
│   ├── chrome/
│   │   ├── MiniPlayer.jsx
│   │   ├── TitleBar.jsx
│   │   └── WindowFrame.jsx   # drag, resize, snap
│   ├── player/
│   │   ├── TransportControls.jsx
│   │   ├── SeekBar.jsx
│   │   ├── VolumeSlider.jsx
│   │   └── NowPlayingMarquee.jsx
│   ├── social/
│   │   ├── ListenTogetherPanel.jsx
│   │   └── FriendNowPlaying.jsx
│   └── SkinRenderer.jsx      # manifest → sprites + metrics
│
├── hooks/
│   ├── usePlayer.js
│   ├── usePlaylist.js
│   ├── useEqualizer.js
│   ├── useVisualizer.js
│   ├── useListeningRoom.js
│   └── useSkin.js
│
├── services/
│   ├── audioEngine.js        # Web Audio graph (ver docs/AUDIO-ENGINE.md)
│   ├── websocket.js          # room sync
│   ├── mediaApi.js           # REST /media/v1/*
│   └── localLibrary.js       # IndexedDB + File API
│
├── store/
│   ├── playerStore.js        # zustand: playback state
│   ├── queueStore.js
│   ├── skinStore.js
│   └── windowLayoutStore.js  # positions, visibility, shade
│
├── skins/
│   ├── Classic/
│   ├── Neon/
│   ├── Dakinis/
│   └── Minimal/
│
├── plugins/                    # fase 4 — dynamic import registry
│   └── registry.js
│
└── styles/
    └── media-player.css      # fallback cuando skin no define asset
```

## Dependencias sugeridas

| Paquete | Uso |
|---------|-----|
| `zustand` | stores (ya en client?) |
| `@dakinis/window-manager` | extract DWM (fase 3) |
| `howler` | opcional fallback decode |
| `music-metadata-browser` | tags ID3/FLAC header |

## Montaje

```jsx
// index.jsx
export default function MediaPlayerModule() {
  return (
    <WindowManagerProvider namespace="media-player">
      <MediaPlayerApp />
    </WindowManagerProvider>
  )
}
```

## Env

```
VITE_MEDIA_API_URL=https://api.dakinissystems.com/media
VITE_MEDIA_WS_URL=wss://media-api.dakinissystems.com/v1/ws
```

---

<a id="projects-media-player-scaffold-backend-readme-md"></a>

# >> projects/media-player/scaffold/backend/README.md

**Ruta:** `projects/media-player/scaffold/backend/README.md`

# Scaffold — Backend (dakinis-media)

> Destino: repo `dakinis-media` → `services/media/` o raíz del repo  
> Copiar al crear el servicio Railway.

## Árbol objetivo

```
dakinis-media/
├── src/
│   ├── index.js              # Fastify/Express bootstrap
│   ├── config.js
│   │
│   ├── routes/
│   │   ├── health.js
│   │   ├── tracks.js
│   │   ├── playlists.js
│   │   ├── favorites.js
│   │   ├── rooms.js
│   │   ├── streams.js
│   │   └── skins.js
│   │
│   ├── controllers/
│   │   ├── tracksController.js
│   │   ├── playlistsController.js
│   │   └── roomsController.js
│   │
│   ├── services/
│   │   ├── trackService.js
│   │   ├── playlistService.js
│   │   ├── roomService.js
│   │   ├── streamResolver.js   # ICY / radio metadata
│   │   └── storageService.js   # R2 signed URLs
│   │
│   ├── websocket/
│   │   ├── server.js
│   │   ├── roomHandler.js
│   │   └── syncProtocol.js
│   │
│   ├── workers/
│   │   └── scanLibrary.js      # optional: metadata scan
│   │
│   ├── models/
│   │   └── queries.js          # SQL schema media.*
│   │
│   └── middleware/
│       ├── auth.js             # JWT IdP
│       └── rateLimit.js
│
├── Dockerfile
├── railway.toml
├── package.json
└── .env.example
```

## Stack sugerido

| Pieza | Elección |
|-------|----------|
| Runtime | Node 22 |
| HTTP | Fastify |
| WS | `@fastify/websocket` o `ws` + Redis pub/sub |
| DB | `pg` pool → schema `media` |
| Auth | verify JWT vía `DAKINIS_AUTH_URL` |

## Env (.env.example)

```env
PORT=4090
DATABASE_URL=
POSTGRES_SCHEMA=media
DAKINIS_AUTH_URL=https://auth.dakinissystems.com
CORS_ORIGINS=https://akoenet.dakinissystems.com
REDIS_URL=
R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY=
R2_SECRET_KEY=
```

## Gateway

Prefijo: `/media/` → ver [contracts/media-api.json](../../contracts/media-api.json)

## Health

```
GET /health → 200 { "ok": true, "service": "dakinis-media" }
```

---

<a id="projects-media-player-examples-skin-classic-readme-md"></a>

# >> projects/media-player/examples/skin-classic/README.md

**Ruta:** `projects/media-player/examples/skin-classic/README.md`

# Skin Classic LED (ejemplo)

Referencia de formato `.dskin` / manifest JSON. Ver [../../docs/SKINS.md](../../docs/SKINS.md).

Assets (`assets/`, `fonts/`, `sounds/`) se añaden en Fase 1 — este ejemplo documenta solo el manifest.

---

<a id="projects-akoenet-media-player-readme-md"></a>

# >> projects/akoenet-media-player/README.md

**Ruta:** `projects/akoenet-media-player/README.md`

# Dakinis Media Player — Add-on AkoeNet

> Reproductor inspirado en Winamp (estética retro, UX moderna) · módulo instalable del ecosistema Dakinis.

**No es un clon de Winamp.** Es un **Dakinis Media Player** con ventanas flotantes, skins, Web Audio API e integración social de AkoeNet.

---

## Repos y despliegue (objetivo)

| Pieza | Repo / servicio | Notas |
|-------|-----------------|-------|
| UI + motor cliente | `akoenet-client` → `src/modules/media-player/` | Add-on; ruta `/media` o panel flotante |
| API + salas | Nuevo `akoenet-media` o extensión `akoenet-backend` | Fase 1: playlists + biblioteca |
| Esquema DB | `dakinis-systems` → `supabase/migrations/` | Schema `akoenet` o `media` |
| Skins marketplace | Hub Marketplace (futuro) | Manifest `.dskin` / JSON |
| Window Manager | `@dakinis/window-manager` (este monorepo) | Reutilizable en CRM, Terminal, etc. |

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Capas, flujos, integración plataforma |
| [docs/WINDOW-MANAGER.md](./docs/WINDOW-MANAGER.md) | Gestor de ventanas flotantes (Dakinis WM) |
| [docs/DATABASE.md](./docs/DATABASE.md) | Tablas y relaciones |
| [docs/API.md](./docs/API.md) | REST + WebSocket |
| [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) | Voice, canales, “escuchar juntos” |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Fases MVP → Marketplace |
| [docs/SKINS.md](./docs/SKINS.md) | Formato de skins y assets |

---

## Scaffold en esta carpeta

```
projects/akoenet-media-player/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── WINDOW-MANAGER.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── INTEGRATION-AKOENET.md
│   ├── ROADMAP.md
│   └── SKINS.md
├── database/schema.sql
├── backend/                    # API referencia (Node, puerto 4090)
│   ├── openapi.yaml
│   └── src/
├── frontend/                   # Módulo React (copiar a akoenet-client)
│   └── src/modules/media-player/
├── packages/window-manager/    # @dakinis/window-manager
└── skins/classic/              # Skin Classic (.dskin manifest)
```

Migración Supabase: `docs/supabase/migrations/034_akoenet_media_player.sql`

---

## Quick start (desarrollo local)

```powershell
# Backend referencia
cd projects/akoenet-media-player/backend
npm run dev
# GET http://localhost:4090/health
# GET http://localhost:4090/media/tracks  (Header: Authorization: Bearer demo)

# Frontend — copiar frontend/src/modules/media-player/ a akoenet-client y registrar ruta /media
cd apps/akoenet/Client
npm run dev
```

---

## Identidad visual

- Paleta **Dakinis** + modo **Classic** (verde fosforescente sobre gris oscuro).
- Tipografía: bitmap-style opcional en skins retro; Inter/system en skin Dakinis.
- Iconografía: ventanas acoplables, barra de título clásica, ecualizador de 10 bandas.

---

*Julio 2026 · Dakinis Systems*

---

<a id="projects-akoenet-media-player-backend-readme-md"></a>

# >> projects/akoenet-media-player/backend/README.md

**Ruta:** `projects/akoenet-media-player/backend/README.md`

# Backend referencia — Media Player

API Express-style (Node HTTP nativo) para playlists, salas y skins.

**Destino:** prefijo `/media` en `akoenet-backend` o microservicio `akoenet-media`.

```powershell
cd projects/akoenet-media-player/backend
npm run dev
# http://localhost:4090/health
```

Ver [../docs/API.md](../docs/API.md).

---

<a id="projects-akoenet-media-player-frontend-readme-md"></a>

# >> projects/akoenet-media-player/frontend/README.md

**Ruta:** `projects/akoenet-media-player/frontend/README.md`

# Frontend referencia — Media Player

Módulo React para copiar a `apps/akoenet/Client/src/modules/media-player/`.

```
src/modules/media-player/
├── index.jsx              # Registro add-on
├── MediaPlayerRoot.jsx    # Host + WindowManager
├── components/
├── hooks/
├── services/
├── store/
└── styles/
```

Ver [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

---

<a id="projects-akoenet-media-player-docs-api-md"></a>

# >> projects/akoenet-media-player/docs/API.md

**Ruta:** `projects/akoenet-media-player/docs/API.md`

# API — Media Player

Base: `https://api.akoenet.dakinissystems.com/media` (o gateway `/akoenet/media/`)

Auth: Bearer JWT AkoeNet / Dakinis IdP.

---

## REST

### Tracks

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tracks` | Biblioteca del usuario (paginado) |
| POST | `/tracks` | Registrar metadatos + upload URL |
| GET | `/tracks/:id` | Detalle |
| DELETE | `/tracks/:id` | Borrar registro |

### Playlists

| Método | Ruta |
|--------|------|
| GET | `/playlists` |
| POST | `/playlists` |
| GET | `/playlists/:id` |
| PATCH | `/playlists/:id` |
| DELETE | `/playlists/:id` |
| PUT | `/playlists/:id/tracks` | Reordenar (array de track ids) |

### Favorites

| Método | Ruta |
|--------|------|
| GET | `/favorites` |
| POST | `/favorites/:trackId` |
| DELETE | `/favorites/:trackId` |

### Listening rooms

| Método | Ruta |
|--------|------|
| POST | `/rooms` | Crear sala |
| GET | `/rooms/:id` | Estado actual |
| POST | `/rooms/:id/join` |
| POST | `/rooms/:id/leave` |
| PATCH | `/rooms/:id/state` | Solo leader |

### Streams (radio)

| Método | Ruta |
|--------|------|
| GET | `/streams/search?q=` | Proxy Radio Browser |
| GET | `/streams/favorites` | Radios guardadas |

### Skins

| Método | Ruta |
|--------|------|
| GET | `/skins` | Listado instalados + marketplace |
| GET | `/skins/:slug/manifest` |
| POST | `/skins/:slug/install` |

---

## WebSocket

Canal: `wss://api.akoenet.../media/ws?room=:roomId`

### Cliente → servidor

```json
{ "type": "sync:state", "trackId": "...", "positionMs": 120000, "playing": true }
{ "type": "sync:seek", "positionMs": 90000 }
{ "type": "chat:react", "emoji": "🎵" }
```

### Servidor → cliente

```json
{ "type": "room:state", "leaderId": "...", "state": { ... } }
{ "type": "member:join", "userId": "..." }
{ "type": "member:leave", "userId": "..." }
```

---

## Eventos plataforma (BullMQ, fase 2)

- `media.room.created`
- `media.track.played` → Assistant “now playing” en canal

Contrato OpenAPI: generar desde `backend/openapi.yaml` (pendiente).

---

<a id="projects-akoenet-media-player-docs-architecture-md"></a>

# >> projects/akoenet-media-player/docs/ARCHITECTURE.md

**Ruta:** `projects/akoenet-media-player/docs/ARCHITECTURE.md`

# Arquitectura — Dakinis Media Player

## Posición en la plataforma

```
Dakinis Platform
│
├── Core · Auth · Billing · AI · Gateway
│
├── AkoeNet
│   ├── Chat · Voice · Friends · Communities
│   ├── Assistant (módulos nativos)
│   └── Media Player ◄── add-on instalable (este proyecto)
│
└── Marketplace
        └── skins · plugins · “Listen together” packs
```

El reproductor **no sustituye** el módulo Music del Assistant (status / now playing sin DMCA). El add-on es **opt-in** por usuario o por servidor, con biblioteca propia y fuentes configurables (local, Jellyfin, radio, etc.).

---

## Capas

### 1. Cliente (AkoeNet)

```
apps/akoenet/Client/src/modules/media-player/
├── index.jsx                 # Registro add-on + lazy route
├── MediaPlayerRoot.jsx       # Provider + WindowManager host
├── components/               # Ventanas Winamp-style
├── hooks/                    # Player, playlist, EQ, visualizer
├── services/                 # audioEngine, mediaApi, syncSocket
├── store/                    # Zustand o context slices
└── skins/                    # Bundled + descargables
```

**Motor de audio:** Web Audio API (no `<audio>` plano).

```
Archivo / Stream
      ↓
  decodeAudioData (MP3/OGG/WAV vía browser; FLAC vía wasm opcional)
      ↓
  SourceNode → GainNode → BiquadFilterNode[] (10 bandas)
      ↓
  DynamicsCompressor (opcional) → AnalyserNode (visualizer)
      ↓
  AudioContext.destination
```

### 2. Backend (`services/media` o prefijo `/media` en akoenet-backend)

| Área | Responsabilidad |
|------|-----------------|
| `tracks` | Metadatos, URLs firmadas, no almacenar binarios en Fase 1 |
| `playlists` | CRUD + orden |
| `rooms` | “Listen together” — estado sincronizado |
| `streams` | Catálogo radios (Radio Browser API proxy) |
| `skins` | Manifest + CDN URL |
| `websocket` | Sync posición, play/pause, queue |

### 3. Dakinis Window Manager (compartido)

Paquete `@dakinis/window-manager` — ver [WINDOW-MANAGER.md](./WINDOW-MANAGER.md).

Ventanas del reproductor:

| ID | Ventana | Acoplable |
|----|---------|-----------|
| `player.main` | Reproductor principal | Sí (playlist, EQ) |
| `player.playlist` | Lista de reproducción | Sí |
| `player.eq` | Ecualizador 10 bandas | Sí |
| `player.library` | Biblioteca / carpetas | No |
| `player.visualizer` | Visualización | Sí |
| `player.queue` | Cola | Sí |
| `player.lyrics` | Letras (fase 2) | No |
| `player.mini` | Modo compacto | — |

### 4. Plugins (fase 3+)

```
plugins/
├── spotify-bridge/
├── jellyfin/
├── radio-browser/
├── lastfm-scrobble/
└── discord-presence/   # Rich presence vía AkoeNet, no Discord oficial
```

Contrato: manifest JSON + `registerSource()`, `registerUiPanel()`.

---

## Flujos clave

### Reproducción local / URL

1. Usuario elige track → cliente pide URL (o usa blob local).
2. `audioEngine.load(url)` → decode → graph.
3. Estado en `playerStore` → UI + opcional `PATCH /media/now-playing`.

### Escuchar juntos (Listen Together)

1. Host crea `listening_room` → WS room id.
2. Miembros del canal AkoeNet o amigos se unen (`room_members`).
3. Host es **leader**: emite `sync:state` (trackId, positionMs, playing).
4. Followers aplican drift correction (<500 ms) vía `audioEngine.seek()`.

### Add-on en servidor AkoeNet

1. Admin activa módulo **Media Player** en ajustes del servidor.
2. Aparece entrada en sidebar / comando `/media`.
3. Permisos: quién puede crear salas, subir biblioteca compartida, etc.

---

## Seguridad y legal

- **No** redistribuir catálogo con copyright; URLs del usuario o integraciones licenciadas (Spotify SDK, Jellyfin self-hosted).
- Signed URLs para archivos en storage Dakinis (fase 2).
- Rate limit en proxy de radio.
- CSP: `media-src` acotado en AkoeNet client.

---

## Dependencias de plataforma

| Servicio | Uso |
|----------|-----|
| `dakinis-auth` | JWT usuario |
| `akoenet-backend` | Servidor, canales, permisos |
| `dakinis-ai` (opcional) | Playlists generadas por IA |
| `dakinis-billing` (opcional) | Skins premium / storage |

---

## Referencia de implementación

Código scaffold en `../frontend/` y `../backend/` de este directorio.

---

<a id="projects-akoenet-media-player-docs-database-md"></a>

# >> projects/akoenet-media-player/docs/DATABASE.md

**Ruta:** `projects/akoenet-media-player/docs/DATABASE.md`

# Base de datos — Media Player

Schema propuesto: **`akoenet`** (extensión) o **`media`** (schema dedicado).

Migración futura: `supabase/migrations/0xx_akoenet_media_player.sql`

---

## Tablas

### `media.tracks`

Metadatos; el binario vive en storage del usuario o URL externa.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| owner_user_id | uuid FK → dakinis_auth.users | |
| title | text | |
| artist | text | |
| album | text | |
| duration_ms | int | |
| source_type | enum | `local`, `url`, `jellyfin`, `radio` |
| source_ref | text | path, external id, stream url |
| cover_url | text | nullable |
| created_at | timestamptz | |

### `media.playlists`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| user_id | uuid FK |
| name | text |
| is_public | boolean default false |
| created_at | timestamptz |

### `media.playlist_tracks`

| Columna | Tipo |
|---------|------|
| playlist_id | uuid FK |
| track_id | uuid FK |
| position | int |
| PK | (playlist_id, track_id) |

### `media.favorites`

| user_id | track_id | PK compuesta |

### `media.skins`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| slug | text unique |
| name | text |
| author_user_id | uuid nullable |
| manifest | jsonb |
| package_url | text |
| marketplace_listed | boolean |

### `media.listening_rooms`

| Columna | Tipo |
|---------|------|
| id | uuid PK |
| owner_user_id | uuid |
| akoenet_server_id | bigint nullable |
| akoenet_channel_id | bigint nullable |
| current_track_id | uuid nullable |
| position_ms | int default 0 |
| is_playing | boolean |
| updated_at | timestamptz |

### `media.room_members`

| room_id | user_id | role (`leader` \| `follower`) | PK |

---

## Índices sugeridos

- `tracks(owner_user_id, created_at desc)`
- `playlist_tracks(playlist_id, position)`
- `listening_rooms(akoenet_server_id, akoenet_channel_id)`

SQL ejecutable: [../database/schema.sql](../database/schema.sql)

---

<a id="projects-akoenet-media-player-docs-integration-akoenet-md"></a>

# >> projects/akoenet-media-player/docs/INTEGRATION-AKOENET.md

**Ruta:** `projects/akoenet-media-player/docs/INTEGRATION-AKOENET.md`

# Integración con AkoeNet

## Add-on vs módulo Assistant

| | Assistant Music | Media Player add-on |
|--|-----------------|---------------------|
| Alcance | Status / now playing | Reproductor completo |
| DMCA | Sin reproducción | Fuentes del usuario / licenciadas |
| UI | Panel servidor | Ventanas flotantes Winamp-style |
| Instalación | Toggle módulo | Marketplace + permisos servidor |

Ambos pueden coexistir: el Assistant muestra *what’s playing*; el add-on es quien reproduce.

---

## Puntos de integración

### 1. Registro del módulo (cliente)

```javascript
// apps/akoenet/Client/src/modules/registry.js
{
  id: 'dakinis-media-player',
  name: 'Media Player',
  route: '/media',
  icon: 'music-winamp',
  lazy: () => import('./media-player'),
  requiredAddon: true,
}
```

### 2. Sidebar / comando

- Entrada **Media** cuando el add-on está activo en el servidor.
- Slash command: `/media play`, `/media join`, `/media room`.

### 3. Voice channels

- Overlay opcional: “🎵 Synchronized” en canal de voz.
- **No** mezclar audio del reproductor en el canal SFU (fase 1); solo sync temporal.
- Fase 3: bot de relay solo en salas privadas con consentimiento.

### 4. Perfil / presencia

```
Friend listening...
▶ Christian — Daft Punk — One More Time
[Join Session]
```

API: `GET /users/:id/media-presence` o campo en presencia WS existente.

### 5. Permisos (servidor)

| Permiso | Descripción |
|---------|-------------|
| `media.use` | Abrir reproductor |
| `media.room.create` | Crear listen together |
| `media.library.upload` | Subir a biblioteca compartida |
| `media.admin` | Configurar add-on |

---

## Variables Railway (futuro)

**akoenet-backend**

```
MEDIA_ENABLED=true
MEDIA_WS_PATH=/media/ws
RADIO_BROWSER_API=https://de1.api.radio-browser.info
```

**akoenet-client (build)**

```
VITE_MEDIA_PLAYER_ENABLED=true
VITE_MEDIA_WS_URL=wss://api.akoenet.dakinissystems.com/media/ws
```

---

## Copiar scaffold → repo producto

1. Copiar `projects/akoenet-media-player/frontend/src/modules/media-player` → `apps/akoenet/Client/src/modules/media-player`.
2. Montar rutas en `App.jsx`.
3. Implementar rutas backend desde `projects/akoenet-media-player/backend/`.
4. Aplicar `database/schema.sql` en Supabase.

---

<a id="projects-akoenet-media-player-docs-roadmap-md"></a>

# >> projects/akoenet-media-player/docs/ROADMAP.md

**Ruta:** `projects/akoenet-media-player/docs/ROADMAP.md`

# Roadmap — Dakinis Media Player

## Fase 0 — Diseño (actual)

- [x] Estructura carpeta + docs
- [x] Schema SQL + API sketch
- [x] Scaffold frontend/backend + skin Classic
- [x] Window Manager types

## Fase 1 — MVP (4–6 semanas)

- [ ] Main player + playlist + cola
- [ ] Web Audio API: play/pause/seek/volume
- [ ] Ecualizador 10 bandas (BiquadFilter)
- [ ] Biblioteca local (metadatos + URLs)
- [ ] Ventanas drag + layout Classic
- [ ] Skin Classic + skin Dakinis
- [ ] Atajos teclado básicos
- [ ] Integración ruta `/media` en akoenet-client

## Fase 2 — Social

- [ ] Listening rooms + WebSocket sync
- [ ] Presencia “Friend listening”
- [ ] Canal AkoeNet: banner “Listen together”
- [ ] Radio Browser proxy
- [ ] Visualizer (AnalyserNode + canvas)

## Fase 3 — Marketplace

- [ ] Skins instalables (.dskin zip)
- [ ] Plugins: Jellyfin, Last.fm scrobble
- [ ] IA playlists (Dakinis AI)
- [ ] Letras sincronizadas (LRCLIB o similar)

## Fase 4 — Plataforma

- [ ] Dakinis Window Manager en Hub / Core widgets
- [ ] Modo escritorio Dakinis (multi-app flotante)
- [ ] Billing: skins premium, storage biblioteca

---

## Métricas de éxito

- Tiempo hasta primera reproducción < 3 s
- Drift listen-together < 500 ms
- 5+ skins community en marketplace (6 meses post Fase 3)

---

<a id="projects-akoenet-media-player-docs-skins-md"></a>

# >> projects/akoenet-media-player/docs/SKINS.md

**Ruta:** `projects/akoenet-media-player/docs/SKINS.md`

# Sistema de skins

Formato: carpeta con `manifest.json` + assets (PNG/WebP, fuentes opcionales, sonidos UI).

Extensión empaquetada: `.dskin` (zip).

---

## manifest.json

```json
{
  "id": "classic",
  "name": "Classic",
  "version": "1.0.0",
  "author": "Dakinis",
  "minPlayerVersion": "0.1.0",
  "windows": {
    "player": { "background": "player.png", "width": 275, "height": 116 },
    "playlist": { "background": "playlist.png", "width": 275, "height": 232 },
    "eq": { "background": "eq.png", "width": 275, "height": 116 }
  },
  "colors": {
    "text": "#00ff00",
    "textDim": "#008800",
    "background": "#181818",
    "accent": "#2dd4bf"
  },
  "fonts": {
    "ui": "Arial",
    "lcd": "optional-lcd.woff2"
  },
  "sounds": {
    "click": "click.wav"
  },
  "sprites": {
    "buttons": { "sheet": "buttons.png", "play": [0, 0, 23, 18] }
  }
}
```

## Skins incluidas (scaffold)

| Carpeta | Estilo |
|---------|--------|
| `skins/classic/` | Verde Winamp-like |
| (futuro) `neon/` | Cyberpunk |
| (futuro) `dakinis/` | Brand tokens Nexora |

## Renderer

`SkinRenderer.jsx` lee manifest y:

1. Aplica `background` por ventana.
2. Posiciona controles según mapa en manifest (fase 2) o layout CSS fijo (MVP).
3. Intercambia spritesheet en botones.

## Marketplace

- Listing: slug, preview PNG, autor, precio (0 = gratis).
- Instalación: descarga zip → validar manifest → `skins/` en IndexedDB o CDN user scope.

---

<a id="projects-akoenet-media-player-docs-window-manager-md"></a>

# >> projects/akoenet-media-player/docs/WINDOW-MANAGER.md

**Ruta:** `projects/akoenet-media-player/docs/WINDOW-MANAGER.md`

# Dakinis Window Manager (DWM)

Gestor de ventanas flotantes reutilizable para **Media Player**, CRM, Terminal, Copilot, etc.

Inspiración: Winamp snap + MDI ligero, implementado en React (portal + drag).

---

## API (conceptual)

```typescript
interface WindowDescriptor {
  id: string;           // ej. "player.playlist"
  title: string;
  defaultRect: Rect;   // x, y, w, h (px o % del viewport)
  minSize?: Size;
  snapTo?: string[];   // ids de ventanas hermanas
  layer?: number;
  component: React.ComponentType;
  skinRegion?: keyof SkinManifest["windows"];
}

interface WindowManagerState {
  windows: Map<string, WindowInstance>;
  focusedId: string | null;
  layoutPreset: "classic" | "minimal" | "free";
}
```

## Comportamientos

| Feature | Descripción |
|---------|-------------|
| Drag | Barra de título; límites al viewport |
| Snap | Playlist debajo del main player (classic layout) |
| Dock | Modo compacto: solo `player.mini` |
| Z-order | Click trae al frente |
| Persist | `localStorage` + sync opcional a cuenta Dakinis |
| Skin | `SkinRenderer` lee manifest y posiciona sprites |

## Layout preset “Classic”

```
┌─────────────────────────┐
│      Main Player        │
├─────────────────────────┤
│      Playlist           │  ← snap vertical
└─────────────────────────┘
     ┌──────────┐
     │    EQ    │          ← snap horizontal al main
     └──────────┘
```

## Paquete

Implementación mínima en `packages/window-manager/` (types + hook `useWindowManager`).

Integración en AkoeNet:

```jsx
import { WindowManagerProvider } from '@dakinis/window-manager'
import { mediaPlayerWindows } from './windows/registry'

<WindowManagerProvider registry={mediaPlayerWindows}>
  <MediaPlayerRoot />
</WindowManagerProvider>
```

## Fases

1. **MVP:** drag + focus + persist local.
2. **Snap** clásico Winamp.
3. **Multi-app:** misma API para otros módulos Dakinis (“modo escritorio”).

---

<a id="projects-akoenet-media-player-packages-window-manager-readme-md"></a>

# >> projects/akoenet-media-player/packages/window-manager/README.md

**Ruta:** `projects/akoenet-media-player/packages/window-manager/README.md`

# @dakinis/window-manager

Tipos y utilidades para ventanas flotantes estilo Winamp en el ecosistema Dakinis.

Implementación UI completa: Fase 1 en `akoenet-client` (`WindowManagerProvider`).

Ver [../../docs/WINDOW-MANAGER.md](../../docs/WINDOW-MANAGER.md).

---

<a id="projects-akoenet-media-player-skins-classic-readme-md"></a>

# >> projects/akoenet-media-player/skins/classic/README.md

**Ruta:** `projects/akoenet-media-player/skins/classic/README.md`

# Assets Classic skin

Place PNG sprites here (MVP puede usar CSS puro sin imágenes):

- `player.png` — fondo ventana principal
- `playlist.png` — fondo playlist
- `eq.png` — fondo ecualizador
- `buttons.png` — spritesheet controles

Hasta que existan assets, `SkinRenderer` usa fallback CSS con colores del manifest.

---


# Dakinis Systems — Estructura, funciones y UX (TEMP)

> **Único documento TEMP del ecosistema** · julio 2026 · referencia consolidada (estructura, productos, platform, migraciones, estado prod).
---

## 1. Visión general

**Dakinis Systems** es un ecosistema multi-producto sobre una plataforma compartida (auth, billing, IA, notificaciones, búsqueda, workspaces). Los productos son aplicaciones independientes que comparten identidad, catálogo de addons y servicios internos.

| Producto | Rol | Estado |
|----------|-----|--------|
| **Dakinis One (Core)** | ERP modular: CRM, inventario, restaurante, WhatsApp | Activo |
| **AkoeNet** | Comunidades, chat, voz, Workspace OS desktop | Activo |
| **StreamAutomator** | Programación y automatización de streams | Activo |
| **Dakinis Finanzas (LifeFlow)** | Finanzas personales, coach, escenarios | Activo |
| **DND 5e (Tabletop)** | Fichas D&D locales | Roadmap |
| **Soluciones a medida** | Servicios de integración | Activo |
| **Hub** | Launcher central de productos | Activo — Mi día DB live |

**Modelo mental en 4 capas:**

```
Foundation     → SQL migrations, contratos, packages compartidos (@dakinis/shared-*)
Infrastructure → Gateway, Redis, Supabase Postgres, Railway, Cloudflare
Platform       → Auth, Billing, AI, Notifications, Search, Knowledge, Internal API
Products       → Core, AkoeNet, StreamAutomator, LifeFlow, Hub, Landing
```

**Paquetes Foundation (jul 2026, Fase 0):** `@dakinis/shared-db`, `@dakinis/shared-error`, `@dakinis/shared-validation`, `@dakinis/shared-feature-flags` — ver sección 14.

**Regla:** los productos consumen platform; no duplican auth/billing/IA salvo legacy (StreamAutomator tiene Stripe propio).

---

## 2. Dominios y despliegue (producción)

| Pieza | Web | API |
|-------|-----|-----|
| Hub | hub.dakinissystems.com | vía gateway |
| Auth (IdP) | auth.dakinissystems.com | — |
| Core | core.dakinissystems.com | core-api + gateway /core/ |
| LifeFlow | finance.dakinissystems.com | finance-api |
| StreamAutomator | streamautomator.com | api.streamautomator.com |
| AkoeNet | akoenet.dakinissystems.com | api.akoenet.dakinissystems.com |
| Tabletop | tabletop.dakinissystems.com | tabletop-api |
| Landing corporativa | dakinissystems.com | — |
| Gateway unificado | api.dakinissystems.com | enruta /core/, /billing/, /internal/, /ai/, etc. |

**Railway:** cada servicio suele ser un contenedor Node; StreamAutomator tiene API + Scheduler + Worker + Web (4 procesos). Redis para colas BullMQ. Postgres vive en **Supabase** (pooler 6543), no en Railway.

---

## 3. Autenticación y modelo de usuario

### IdP central (`dakinis_auth`)

- Tabla `users` con UUID como clave primaria
- Email + password hash (OAuth users sin password)
- Campos: `role`, `tenant_id`, `is_super_admin`
- OAuth vía `oauth_accounts` (Google compartido entre productos)
- Sesiones, refresh tokens, MFA/TOTP, password reset (Resend)

### Flujos SSO

| Modo | Productos |
|------|-----------|
| `core-session` | Dakinis One |
| `idp-exchange` | AkoeNet, StreamAutomator, LifeFlow |
| `hub-sso` | Entrada desde Hub → producto con token exchange |
| `none` | DND, landing |

### Usuarios por producto

- **AkoeNet:** tabla propia en schema `akoenet` (IDs enteros); campo `platform_user_id` (UUID) enlaza con IdP; `is_admin` para panel admin
- **StreamAutomator:** Sequelize en schema `public` + sync a `stream`; licencias, trials, `isAdmin`
- **Core:** tenants y memberships en `core` / `dakinis_core_prod`

### Roles típicos

| Rol | Entrada | Capacidades |
|-----|---------|-------------|
| Platform super-admin | Hub / Internal API | Workspaces, billing, flags, audit |
| Admin AkoeNet | /admin en AkoeNet | Métricas, addons por usuario, reportes, DMCA |
| Admin StreamAutomator | /admin en SA | Usuarios, licencias, pagos |
| Admin Core | /admin en Core | Negocios, catálogo, telemetría |
| Usuario comunidad | AkoeNet | Servidores, chat, voz, workspace |
| Streamer | StreamAutomator | Schedule, Director, overlays |
| PYME | Core | CRM, inventario, facturas |

### Usuario de test multi-plataforma (jul 2026)

Provisioning idempotente para smokes E2E — script `docs/supabase/scripts/provision_test_user_velezcampeon.sql` + `scripts/provision-test-user-velezcampeon.ps1`.

| Campo | Valor |
|-------|-------|
| Email | `velezcampeon_88@hotmail.com` |
| Password | `DakinisTest2026!` |
| Platform UUID | `a1000088-0000-4000-8000-000000000088` |
| Username SA/AkoeNet | `velezcampeon88` |
| Tenant / workspace | `velez-test` (plan `pro`, 5 productos Hub) |
| Legacy SA id | `20` · AkoeNet id `6` |

Cubre: `dakinis_auth.users`, `public.Users` + `platformAuthSub`, `stream.user_profiles`, `public.users` + `platform_user_id`, `akoenet.user_profiles`, `core.tenant_memberships`, `meta.workspaces`, `hub.tenant_product_access`, `lifeflow.app_user_links`, `legacy_id_map`.

**Smokes con este usuario:** `smoke-hub.ps1`, `smoke-hub-timeline.ps1`, `smoke-hub-sso-products.ps1`, `smoke-creator-suite-sa.ps1 -LiveWrite`

---

## 4. Platform Services (servicios compartidos)

### Auth
- Login email/password, JWT, OAuth Google
- Emisión tokens para productos (sub = UUID)
- Mapa `legacy_id_map` para migración StreamAutomator/Core

### Hub
- Launcher de productos con tiles
- **Mi día (dashboard personal)** — UI + BFF agregado con datos DB reales (`stub=false` prod jul 2026)
- **ActivityTimeline** — eventos desde `hub.timeline` vía `POST /internal/events`
- Widgets 048: `stream_automation_total/enabled`, `core_low_stock_count`, agenda, LifeFlow score
- Admin workspace (miembros, addons) — migración 031 aplicada
- SSO a todos los productos activos

### Billing
- Servicio central `billing/` — checkout, portal, webhooks Stripe, `billing.subscriptions` (Core BOS)
- **Fase 1.2 unificado (jul 2026):**
  - `POST /v1/subscriptions/sync` — adapter externo (StreamAutomator legacy → billing central)
  - **Checkout cutover:** SA `/payments/checkout|subscribe` → Internal `/billing/checkout` cuando `billing.unified=true` + `platformAuthSub`
  - **Fan-out:** billing webhook → `POST SA /api/internal/billing/license-sync` (licencia local)
  - Planes SA: `sa-creator-monthly`, `sa-pro-monthly`, `sa-lifetime` (migración 045)
  - Env Stripe central: `STRIPE_PRICE_SA_CREATOR_MONTHLY`, `STRIPE_PRICE_SA_PRO_MONTHLY`, `STRIPE_PRICE_SA_LIFETIME`
  - Eventos `user.plan_changed` + `billing.payment_*`
  - Flag `billing.unified` (044) — **046** activa global en greenfield ✅ prod jul 2026
  - Internal API `GET /feature-flags/evaluate` lee `meta.feature_flags` vía `DATABASE_URL` (prod `database: configured`)
  - **Deploy greenfield:** `scripts/deploy-billing-unified-greenfield.ps1`
  - **Smoke:** `scripts/smoke-billing-unified-sa.ps1`
- Portal cliente, degrade/restore plan — parcialmente en smoke

### AI Platform (`dakinis-ai`)
- Agentes: core-advisor, content-agent, lifeflow coach
- API `/v1/*`, worker BullMQ
- Schema `ai` en Postgres

### Notifications
- API in-app — parcial
- Email Resend — planificado live
- Push — planificado

### Search
- Índice federado pgvector — MVP
- Indexación addon data (kanban, calendar, notes, code-editor)
- Ctrl+K y Copilot consumen búsqueda

### Knowledge
- Ingest documentos, bucket `knowledge` en Supabase Storage

### Internal API (puerto 4083)
- Auth: `DAKINIS_INTERNAL_SERVICE_KEY` (Bearer)
- **Postgres:** `DATABASE_URL` en config (`databaseUrl`) — prod health `database: configured` ✅
- Workspaces: CRUD, miembros, addons, desktop profiles, addon data blobs (con `revision` optimista)
- **Feature flags:** `GET /feature-flags/evaluate?keys=...&workspaceId=...`
- **Hub timeline (`hub-timeline.js`):** `POST /events` persiste en `hub.timeline` + invalida caché BFF; recuperación Redis si cola `dakinis:events` tiene WRONGTYPE (`3c69bbb`)
- **BFF agregado (Fase 1.3):**
  - `GET /hub/dashboard/aggregated/:userId` — hub + notifications + workspace addons (caché Redis 30s)
  - `GET /workspace/summary/:userId` — addons + perfiles desktop + workspace (caché 60s)
  - `GET /platform/health` — health resumido servicios (caché 10s)
  - `?fresh=1` bypass caché · rate limit 100 req/min por user/tenant
- Hub dashboard agregado, platform metrics, **hub-actions** (CTAs Mi día), **hub-widget-values**
- Proxies: notifications, search, billing (+ **`POST /billing/subscriptions/sync`**), knowledge
- Event bus BullMQ, DLQ replay
- **Outbox:** escrituras workspace addon data publican en `meta.outbox_events`
- AkoeNet assistant modules routing
- Super-admin: `/admin/v1/` overview, workspaces, billing, audit, feature flags

### Gateway
- Routing centralizado a todos los servicios
- Headers de identidad (`TRUST_GATEWAY_IDENTITY_HEADERS`)
- Rate limit y CORS

---

## 5. Dakinis One (Core)

### Propósito
ERP modular para PYMEs: CRM, citas, inventario, restaurante, mensajería interna, WhatsApp, facturación.

### Rutas web principales

| Ruta | Pantalla |
|------|----------|
| / | Home producto |
| /login, /forgot-password, /reset-password | Auth |
| /hub | Launcher Hub embebido |
| /admin | Admin plataforma (negocios, usuarios, catálogo) |
| /app/dashboard | Dashboard tenant |
| /app/crm | CRM |
| /app/ventas | Ventas |
| /app/inventario | Inventario |
| /app/reportes | Reportes |
| /app/whatsapp/* | Hub WhatsApp (conversaciones, plantillas, IA) |
| /app/settings | Ajustes tenant |
| /portal/:slug | Portal cliente |
| /ecosystem/launch/:productId | Lanzar otro producto |
| /precios, /success | Pricing, post-checkout |
| Legal: /privacy, /terms, /faq, etc. | Documentos |

### Funciones por módulo

| Módulo | Funciones |
|--------|-----------|
| CRM | Contactos, pipeline |
| Inventario | Stock, lotes, alertas |
| Restaurant | Cocina, menú, pedidos, alérgenos |
| Bookings | Citas |
| Invoices | Facturación |
| Messages | Chat interno del tenant |
| Copilot | Asesor IA de negocio |
| WhatsApp | Canal Meta Cloud API — en desarrollo |
| Analytics | Dashboards tenant — en desarrollo |

### UX Core
- Barra superior con módulos: CRM, inventario, ventas, reportes, WhatsApp
- **Topbar mobile (jul 2026):** layout flex en una fila (guest: logo + 🔍 + ES/EN + login + menú); solo icono de búsqueda en pantallas estrechas — desplegado en `dakinis-core`
- Locale ES/EN vía `LocaleContext`
- Command palette Dakinis (`DakinisCommandPaletteProvider`) con Ctrl+K
- Hub dashboard conectado a Internal API + búsqueda federada
- Tema dark/light corporativo (`shared-brand`)

### API Core (resumen)
- `/api/auth/login`, `/api/auth/exchange`, `/api/me`
- `/api/platform/*` — admin plataforma
- `/api/hub/dashboard` — proxy Hub
- `/api/search/query` — búsqueda federada
- Módulos tenant: CRM, messages, appointments, WhatsApp, restaurant, intelligence
- Event bus BullMQ (`DAKINIS_EVENT_BUS`)

---

## 6. AkoeNet

### Propósito
Plataforma de comunidades estilo Discord: servidores, canales, DMs, voz WebRTC, integración StreamAutomator, y **Dakinis Workspace** (desktop con addons nativos).

### Rutas web principales

| Ruta | Pantalla |
|------|----------|
| / | Home (crear/unirse servidor, spotlight scheduler) |
| /login, /register, /auth/hub-sso | Auth + SSO Hub |
| /messages | Mensajes directos |
| /server/:serverId | Vista servidor (canales, chat, voz, widget streams) |
| /workspace | Desktop shell (catálogo addons, dock, perfiles) |
| /workspace/:addonId | Runtime placeholder para addons sin ruta propia |
| /notes, /calendar, /kanban, /dashboard | Addons productividad (live) |
| /terminal, /monitor, /devops, /code | Addons developer (live) |
| /media | Media Player (live) |
| /admin | Panel administrador |
| /invite/:token | Invitación servidor |
| /status | Estado sistema |
| Legal, DMCA, DPO | Cumplimiento |

### Funciones sociales

| Área | Funciones |
|------|-----------|
| Servidores | Crear, unirse por invite, roles, permisos |
| Canales | Texto, categorías, threads |
| Chat | Mensajes realtime Socket.IO, reacciones, embeds |
| DMs | Conversaciones privadas |
| Voz | WebRTC mesh, canales de voz |
| Auth | IdP, Google, Twitch, Steam |
| Clientes | Web SPA, Tauri desktop, Capacitor Android |
| Push | Web Push VAPID, FCM Android |
| Moderación | Reportes mensajes, audit logs, DMCA, DPO |

### Integración StreamAutomator

| Función | Descripción |
|---------|-------------|
| `!schedule` / `!next` | Comando chat lee calendario público SA |
| Widget upcoming | Panel lateral con próximos streams |
| Webhook | SA notifica `stream-scheduled` → canal AkoeNet |
| Connect flow | `/integrations/scheduler/connect` enlaza cuentas |
| Discovery | Health check `GET /api/integration/akoenet` (v2.3+) |
| Slug mapping | `scheduler_streamer_username` en perfil usuario |

### API AkoeNet Server (resumen)

| Prefijo | Funciones |
|---------|-----------|
| /auth | Login, refresh, registro, OAuth callbacks |
| /servers, /channels, /messages, /dm | Social core |
| /workspace/catalog | Catálogo addons JSON |
| /workspace/addons | Addons habilitados por usuario (filtra `enabled`) |
| /workspace/desktop/profiles | Perfiles desktop (morning, office, developer…) |
| /workspace/desktop/layout/:addonId | Layout ventanas flotantes por addon |
| /workspace/data/:addonKey | Sync blobs (kanban, calendar, notes, code-editor) con `revision` |
| /workspace/feature-flags | Evaluación flags `workspace.addon.*` (proxy Internal API) |
| /workspace/search | Búsqueda federada local + platform |
| /workspace/activity | Feed actividad |
| /workspace/devops | Deployments, logs, infra |
| /workspace/metrics | Métricas local + platform |
| /integrations/scheduler/* | Proxy discovery, upcoming, webhooks, connect |
| /admin/* | Overview, health, addons por usuario, audit, reportes |

---

## 7. Workspace OS (Dakinis Desktop)

### Concepto
Escritorio modular dentro de AkoeNet (y referencia Hub): addons nativos con ventanas flotantes, perfiles de layout, command palette y activity center. No son plugins estilo Discord; son mini-apps con contrato `WorkspaceAddon`.

### Stack conceptual

```
Platform Services (auth, ai, billing, storage, search, events…)
        ↓
Capabilities (window-manager, addon-sdk, widget-framework, command-palette, marketplace)
        ↓
Desktop Runtime (lifecycle, event bus, permissions, layouts)
        ↓
Addons (26) + Widgets cross-product
```

### Capabilities (5)

| ID | Función |
|----|---------|
| window-manager | Ventanas flotantes, drag, resize, z-index, snap |
| addon-sdk | Contrato WorkspaceAddon, lifecycle hooks |
| widget-framework | Tiles en dashboard y superficies |
| command-palette | Centro de comandos Ctrl+K |
| marketplace | Instalar/actualizar addons |

### Tiers de addons

| Tier | Cantidad | Descripción |
|------|----------|-------------|
| core | 5 | Siempre instalados — identidad del shell |
| productivity | 7 | Trabajo y colaboración |
| developer | 5 | Terminal, DevOps, código |
| stream | 3 | OBS, stream deck, clips |
| media | 1 | Reproductor audio |
| entertainment | 2 | Soundboard, game launcher |
| system | 3 | Archivos, temas, descargas |

### Fases de madurez

| Fase | Significado en UI |
|------|-------------------|
| mvp | Live — funcionalidad core |
| growth | Preview — parcial o scaffold |
| future | Roadmap — placeholder |

### Catálogo completo (26 addons)

#### Sistema (tier core + system)

| ID | Nombre ES | Descripción | Fase | Builtin |
|----|-----------|-------------|------|---------|
| command-palette | Centro de comandos | Ctrl+K — abrir apps, buscar, deploy, IA | mvp | sí |
| activity-center | Centro de actividad | Notificaciones, streams, deploys, facturas | mvp | sí |
| dashboard | Panel | Widgets CPU, Railway, GitHub, Stripe, streams | mvp | sí |
| marketplace | Marketplace | Addons, skins, widgets, temas, prompts | growth | sí |
| settings | Ajustes | Apariencia, cuentas, idioma, privacidad | growth | sí |
| file-explorer | Explorador archivos | Uploads, media compartida | growth | no |
| theme-studio | Estudio de temas | Crear skins, publicar en marketplace | growth | no |
| downloads | Descargas | Gestor con historial y cola | future | no |

#### Productividad

| ID | Nombre ES | Descripción | Fase |
|----|-----------|-------------|------|
| calendar | Calendario | Streams, eventos, reuniones, cumpleaños | growth |
| notes | Notas | Wiki Markdown, backlinks, resúmenes IA | growth |
| whiteboard | Pizarra | Excalidraw-style, brainstorming | growth |
| kanban | Kanban | Todo → Doing → Review → Done | growth |
| live-dashboard | Panel en vivo | Reuniones con voz, notas, IA, tareas | future |
| ai-workspace | Espacio IA | Escritorio multi-ventana IA | mvp |
| ai-actions | Acciones IA | Lista de acciones, no chat | growth |

#### Desarrollo

| ID | Nombre ES | Descripción | Fase |
|----|-----------|-------------|------|
| terminal | Terminal Dakinis | Shell Railway, Docker, Git, Supabase | growth |
| devops | DevOps | Deploy, logs, métricas Railway/Supabase/Redis | growth |
| code-editor | Editor código | Editor ligero para compartir en voz | growth |
| automation-builder | Constructor flujos | IF/THEN visual estilo n8n | growth |
| monitor | Monitor | CPU, RAM, red, Railway, API, Redis | growth |

#### Streaming

| ID | Nombre ES | Descripción | Fase |
|----|-----------|-------------|------|
| stream-deck | Stream Deck | Deck virtual OBS, Twitch, macros | growth |
| obs-companion | OBS Companion | Escenas, chat, mic/cámara | growth |
| clip-studio | Clip Studio | Crear y compartir clips | future |

#### Media y entretenimiento

| ID | Nombre ES | Descripción | Fase |
|----|-----------|-------------|------|
| media-player | Reproductor media | Estilo Winamp, lyrics, visualizer | mvp |
| soundboard | Soundboard | Sonidos en canal de voz | growth |
| game-launcher | Lanzador juegos | Steam, Epic, GOG, Battle.net | future |

### Addons con UI completa en AkoeNet (jul 2026)

| Addon | Ruta | Ventanas principales |
|-------|------|---------------------|
| media-player | /media | player, playlist, EQ, library, visualizer |
| notes | /notes | lista, editor, búsqueda |
| calendar | /calendar | agenda, semana, detalle evento |
| kanban | /kanban | tableros, columnas, tarea |
| dashboard | /dashboard | widgets, actividad, quick links |
| terminal | /terminal | shell, logs, bookmarks |
| monitor | /monitor | overview, system, services |
| devops | /devops | deployments, logs, services |
| code-editor | /code | explorer, editor, outline |

#### Manifests Addon SDK (Fase 1.4.1 — jul 2026)

Cada addon live declara `manifest.json` en su carpeta de módulo. Contrato build-time en `@dakinis/addon-sdk/manifest` (`assertAddonManifest`, `isAddonManifest`).

| Campo | Descripción |
|-------|-------------|
| `id`, `version` | Identidad + semver |
| `tier`, `route` | Tier catálogo + ruta live (`IMPLEMENTED_ADDON_ROUTES`) |
| `capabilities` | Refs a capabilities platform (p. ej. `window-manager@1.0.0`) |
| `permissions` | Subconjunto de `catalog.json` permissions del addon |
| `windows` | IDs exactos de `windowRegistry.js` (1:1) |
| `syncData` | Opcional — addons con persistencia server (`kanban`, `calendar`, `notes`, `code-editor`) |

**Validación build:** `apps/akoenet/Client/scripts/validate-addon-manifests.mjs` — corre en `prebuild` y vía `npm run validate:addons`. Cruza manifest ↔ catálogo ↔ registry sin importar `addonCatalog.js` (evita `import attribute` JSON en Node).

**Integrados en shell (sin ruta dedicada):** command-palette (Ctrl+K), activity-center (FAB flotante).

**Placeholder:** resto de addons abren en `/workspace/:addonId` con ventanas preview.

### Perfiles desktop (presets)

| Perfil | Icono | Abre por defecto |
|--------|-------|-------------------|
| gaming | gamepad | media-player, soundboard |
| streaming | radio | obs-companion, stream-deck, media-player, dashboard |
| developer | terminal | terminal, devops, monitor, code-editor, notes |
| office | briefcase | calendar, kanban, notes, dashboard |
| morning | sunrise | calendar (agenda), activity-center, notes |
| streaming-session | video | hereda preset streaming |
| office-day | building | hereda preset office |
| coding | code | hereda preset developer |
| music | music | media-player (player, playlist, visualizer) |

Perfiles persisten en `meta.workspace_desktop_profiles` (window_state, dock_pins, widget_grid).

### UX patterns del Workspace

#### Desktop Shell (`/workspace`)
- Grid de tarjetas por categoría (Sistema, Productividad, Desarrollo, Streaming, Media, Entretenimiento)
- Badge de estado: Live (azul), Preview (morado), Roadmap (gris)
- Dock inferior con pins por perfil
- Selector de perfil (morning, office, developer…)
- Filtro de addons por `enabled` según installs del usuario
- **Filtro por feature flags:** `workspace.addon.*` evaluados al boot (caché 60s); oculta addons sin deploy

#### Ventanas flotantes (`FloatingWindow`)
- Drag en barra de título, resize en esquinas
- **Minimize / Close (Fase 1.4.2):** botones en titlebar; `minimized` persiste en layout API + localStorage
- Minimizar todo el addon → evento `window.minimized` → dock muestra estado (`ws-dock-item--minimized`)
- Click en dock con addon minimizado → `window.restore` + navegación → ventanas restauradas
- Snap entre ventanas al soltar
- z-index y focus
- Layout guardado por addon vía API + fallback localStorage
- Cada addon define `windowRegistry.js` con IDs tipo `calendar.agenda`, rects default

#### Command Palette (Ctrl+K)
- Grupos: navegación, crear, IA, productos, ecosistema
- Búsqueda federada (mensajes, addons, notas, kanban, calendar)
- Accesos rápidos: CRM, Media, Director SA, deploy Railway
- Disponible globalmente cuando hay sesión

#### Activity Center
- Botón FAB (◉) abre panel lateral
- Feed: notificaciones, streams, deploys, mensajes, alertas IA
- Enlaces externos a productos del ecosistema

#### Sync de datos addon
- Tabla `meta.workspace_addon_data` — blobs JSON por workspace+addon + columna **`revision`** (concurrencia optimista)
- Cliente: `useAddonDataSync` — GET/PUT con debounce 900ms; envía `revision` esperada en PUT
- Conflicto 409 `revision_conflict` si otro cliente escribió antes
- Keys permitidos: kanban, calendar, notes, code-editor
- Fallback localStorage si no hay workspace en Supabase
- Reindex búsqueda tras guardar
- Evento outbox `workspace.addon_data.saved` en cada persistencia exitosa

#### Feature flags workspace (addons)
- Flags en `meta.feature_flags`: `workspace.addon.calendar`, `.terminal`, `.kanban`, etc.
- Cliente carga flags en `WorkspaceProviders` junto con installs
- `addonCatalog.js` combina filtro admin (installs) + filtro flags
- Admin super: Internal API `GET /admin/v1/feature-flags` + PATCH

#### Control admin de visibilidad
- Panel `/admin` → sección "Addons Workspace por usuario"
- Buscar por email, username o ID numérico
- Toggle Visible/Oculto por addon
- Persiste en `meta.workspace_addon_installs` vía Internal API
- Audit log en `admin_audit_logs`

#### i18n Workspace
- Catálogo: `i18n.name` / `i18n.description` en ES y EN
- UI shell: `react-i18next` con `enServerUi.js` / `esServerUi.js`
- Locale por defecto: español con fallback inglés

---

## 8. StreamAutomator

### Propósito
Programación multi-plataforma de contenido para streamers y marcas: calendario, publicación automática, overlays OBS, analytics, licencias.

### Rutas web principales

| Ruta | Pantalla |
|------|----------|
| / | Landing o redirect dashboard |
| /login, /auth/hub-sso, /auth/callback | Auth |
| /dashboard | Dashboard principal |
| /schedule, /templates, /media | Programación |
| /director | Modo Director (checklist live) |
| /automation | Automatización IF/THEN |
| /creator/analytics | Analytics creador |
| /creator/campaigns | Campañas |
| /settings, /profile | Ajustes |
| /messages, /todos | Mensajes internos, tareas |
| /stream-ideas, /suggestions, /stream-timeline | Planificación contenido |
| /bits | Twitch Bits |
| /admin | Admin usuarios y licencias |
| /streamer/:username | Página pública streamer |
| /overlay/:type | Overlays OBS |
| /akoenet/connect | Onboarding integración AkoeNet |
| /pricing, /faq, /legal/* | Marketing |

### Funciones por área

| Área | Funciones | Estado |
|------|-----------|--------|
| Core | Calendario, schedule multi-plataforma | Operativo |
| Publicación | Twitch, X, Instagram, Discord, YouTube | Operativo |
| Plantillas y media | Upload, reutilización | Operativo |
| Licencias | Stripe trial/mensual/anual | Operativo |
| Multi-tenant SaaS | Aislamiento por usuario | Operativo |
| Página pública | /streamer/:username, embed | Operativo |
| Overlays OBS | Ruleta, alertas | Operativo |
| Twitch | Bits, EventSub | Operativo |
| Director | Checklist pre/durante/post stream | Operativo |
| Director → stream sync | Dual-write Fase 1A: Sequelize `public` + `stream.director_sessions` + outbox | Operativo |
| Director read stream | Fase 1B: lectura `stream.*` (`DIRECTOR_READ_FROM_STREAM=true`) | Operativo prod |
| Automation read stream | Fase 1C: list + executor desde `stream.*` (`AUTOMATION_READ_FROM_STREAM=true`) | Operativo prod |
| Legacy sync bridge | Fase 1C: outbox reconcilia `stream→public` (`LEGACY_SYNC_MODE=true`) | Operativo prod |
| Automation → stream sync | Dual-write reglas a `stream.automation_rules` + outbox | Operativo |
| Automation | Reglas IF/THEN — API + validación Zod, builder UX (`7a559fb`) | Operativo |
| Automation runs | Persistencia `AutomationRuns` + `GET /api/automation/runs` + UI historial | Código listo — deploy + migración Sequelize pendiente |
| Analytics | Heatmap sesiones | Parcial |
| Campaign kits | Paquetes contenido | Parcial |
| Copilot contenido | Sugerencias IA | Stub |
| AkoeNet webhooks | stream-scheduled → canal | Operativo |
| Discovery API | GET /api/integration/akoenet v2.3.1 | Operativo |
| Billing Dakinis unificado | Fase 1.2: dual-write SA→billing vía Internal API; flag `billing.unified` global ON (046) | En progreso — smoke E2E checkout pendiente |

### Procesos backend
- **API:** REST Express, auth, scheduling, creator suite
- **Scheduler:** cron jobs publicación (`schedulerServer.js`)
- **Worker:** colas de publicación, recordatorios y **outbox sync** (`meta.outbox_events`, poll 15s)
- **Platform pg pool:** `platformDb.js` — acceso directo `stream.*` vía `@dakinis/shared-db` (convivencia con Sequelize)

### Director — arquitectura dual-write (Fase 1)

```
POST /api/director/start
  → Sequelize INSERT public."StreamDirectorSessions"  (respuesta API, legacy_id)
  → DirectorSessionRepository.upsertFromLegacySession → stream.director_sessions
  → OutboxPublisher → meta.outbox_events (stream.director.started)
  → Worker outbox → POST Internal API /events (BullMQ bus)
```

**Lectura Fase 1B:** con `DIRECTOR_READ_FROM_STREAM=true`, `getActiveDirectorSession` consulta `stream.director_sessions` primero; si no hay fila, fallback Sequelize.

### Automation — dual-write (Fase 1B)

```
POST/PATCH /api/automation/rules
  → Sequelize public."AutomationRules"
  → AutomationRuleRepository.upsertFromLegacyRule → stream.automation_rules
  → Outbox (stream.automation.created|updated|deleted)
  → Worker → Internal API /events

GET /api/automation/runs[?ruleId=&limit=]
GET /api/automation/rules/:id/runs
  → AutomationRuns (Sequelize) — historial por trigger (deploy + migración pendiente)
```

Validación Zod en rutas automation vía `@dakinis/shared-validation/stream`.

Triggers DB public→stream **retirados (043)**. Sync Creator Suite depende de dual-write app + outbox; `LEGACY_SYNC_MODE` reconcilia `stream→public` si hace falta.

**Fase 1C — legacy sync + lectura stream (prod jul 2026):**
- `LEGACY_SYNC_MODE=true` — outbox worker reconcilia `stream.*` → `public.*` si triggers fallan o tras 043
- `AUTOMATION_READ_FROM_STREAM=true` — listado reglas y executor leen `stream.automation_rules`
- `DELETE /api/automation/rules/:id` — resuelve drift stream/legacy id (`6b1865d`)
- `packages/shared-db/legacy/public-sync.js` — bridge inverso
- **Smoke:** `scripts/smoke-creator-suite-sa.ps1 -LiveWrite` ✅ prod

**Archivos clave:** `directorService.js`, `automationService.js`, `automationExecutor.js`, `lib/legacySyncBridge.js`, `lib/outboxHandlers.js`, `packages/shared-db/repositories/stream/*`, `packages/shared-db/legacy/public-sync.js`

### UX StreamAutomator
- Dashboard con widgets de próximos streams, estado cuentas
- Calendario visual drag-and-drop
- Director: checklist por fases (pre-live, live, post)
- **Automation builder** — params tipados, toggle activo, errores de validación, `?create=1`, labels catálogo (`7a559fb`)
- **CreatorSuiteCard** — stats reglas en dashboard
- **Command palette** — acción «Nueva regla de automatización»
- Tema claro/oscuro con `localStorage`
- Hub SSO sin re-login

---

## 9. Dakinis Finanzas (LifeFlow)

### Propósito
Finanzas personales con scoring, coach IA y escenarios a largo plazo.

### Funciones

| Función | Estado |
|---------|--------|
| LifeFlow Score 0–1000 | Operativo |
| Coach (reglas + IA Pro) | Operativo |
| Gemelo financiero (6 variantes) | Operativo |
| Escenarios 10 años | Operativo |
| Modo mudanza ciudades | Operativo |
| Open Banking | Planificado |
| Widgets Hub | Parcial |

### UX
- Onboarding guiado, dashboard con score circular
- Gráficos de flujo de caja y metas
- Coach conversacional
- SSO vía Hub (`/auth/hub-sso`)

---

## 10. Hub

### Propósito
Punto de entrada único: elegir producto, ver Mi día, administrar workspace.

### Funciones

| Función | Estado |
|---------|--------|
| Launcher productos (tiles) | Operativo |
| **Mi día dashboard** | Operativo — BFF agregado, `miDiaEnabled=true`, `stub=false` |
| **ActivityTimeline** | Operativo — `hub.timeline` + writer Internal API |
| Widget `stream-automation-rules` | Operativo — migración 048 |
| Admin workspace | Miembros, addons enable/pin |
| **Accept invite** | Código listo — `/invite/:token` + `POST /api/hub/invites/:token/accept` (deploy pendiente) |
| SSO a productos | Operativo — SA + AkoeNet + LifeFlow `finance-api` (`smoke-hub-sso-products.ps1` 3/3, 16 jul) |
| Widgets configurables | Catálogo + valores reales parciales (LifeFlow, Core, SA); seed score test: `docs/scripts/seed_lifeflow_score_velezcampeon.sql` |

### UX Hub
- Grid de productos con icono, nombre, resumen
- Badge de estado por producto (activo, roadmap)
- **HubDashboardPage** — secciones Mi día, agenda, notificaciones, actividad, IA, salud, widgets, workspace
- **ActivityTimeline** — feed eventos platform (stream, core, lifeflow, akoenet)
- **HubWidgetGrid** — valores dinámicos (`hub-widget-values.js`) + CTAs (`hub-actions.js`)
- HubWorkspaceAdminPage: toggles addons por workspace
- Invite accept: `/invite/:token` (login con `?next=` → accept)
- i18n vía `hub-i18n.js` en shared-ux
- Sync DES: `scripts/sync-hub-des.ps1` → `dakinis-hub` (`3f58a22`)

---

## 11. Base de datos (Supabase Postgres)

### Schemas principales

| Schema | Contenido |
|--------|-----------|
| dakinis_auth | IdP: users UUID, oauth, sessions, MFA |
| core / dakinis_core_prod | Tenants, CRM, restaurant, facturas |
| hub | Mi día, widgets, preferencias, **timeline** (`hub.timeline`), `tenant_product_access` |
| billing | Planes Stripe, suscripciones |
| stream | Contenidos SA modernos (UUID) |
| public | Legacy Sequelize SA (Users, Contents…) |
| akoenet | Servidores, canales, mensajes, users enteros |
| meta | Workspaces, addons, perfiles desktop, flags |
| ai | Agentes, prompts, conversaciones |
| audit | Logs transversales |
| lifeflow | Finanzas (migración en curso) |

### Tablas Workspace (`meta`)

| Tabla | Propósito |
|-------|-----------|
| workspaces | Identidad workspace (slug, plan, owner) |
| workspace_members | Membresía y rol (owner, admin, member, viewer) |
| workspace_invites | Invitaciones pendientes — accept vía Internal `POST /workspaces/invites/:token/accept` |
| workspace_addons | Catálogo global 26 addons |
| workspace_addon_installs | Enable/pin/config por workspace |
| workspace_desktop_profiles | Perfiles layout (morning, office…) |
| workspace_addon_data | Blobs sync (kanban, calendar, notes, code) + **revision** — RLS deny (038) |
| outbox_events | Transactional outbox (workspace, director, billing futuro) — RLS deny (038) |
| feature_flags | Flags plataforma (global, tenant, rollout %, target workspaces) |

### Patrón convivencia legacy
Railway/Sequelize escribe en `public.*`; sync a `stream.*` vía **dual-write en aplicación** + outbox (migración **043** retiró triggers DB public→stream).

**Estado Fase 1C (jul 2026):** `LEGACY_SYNC_MODE=true` en outbox worker reconcilia `stream.*` → `public.*` cuando hace falta. Lectura preferente desde `stream.*` con flags `DIRECTOR_READ_FROM_STREAM` / `AUTOMATION_READ_FROM_STREAM`.

### Migraciones recientes (referencia)

| # | Archivo | Qué hace | Prod |
|---|---------|----------|------|
| 037 | `037_streamautomator_creator_suite.sql` | Tablas automation + director (public + stream) | ✅ jul 2026 |
| 038 | `038_rls_security_advisor_gaps.sql` | Deny policies RLS en tablas sin policy (meta, media, stream, public) | ✅ jul 2026 |
| 039 | `039_director_sync_trigger_resilience.sql` | Trigger director no revierte INSERT si falla sync | ✅ jul 2026 |
| 040 | `040_dakinis_workspace_addon_data.sql` | Addon data + revision + seeds flags workspace | ✅ jul 2026 |
| 041 | `041_outbox_and_revision.sql` | Tabla `meta.outbox_events` | ✅ jul 2026 |
| 042 | `042_stream_creator_flags.sql` | Flags Director/Automation stream | ✅ jul 2026 |
| 043 | `043_drop_sync_triggers.sql` | Drop triggers public→stream | ✅ jul 2026 |
| 044 | `044_bff_billing_flags.sql` | Flags `billing.unified`, `hub.bff_cache` | ✅ jul 2026 |
| 045 | `045_billing_sa_product_plans.sql` | Planes StreamAutomator en `billing.plans` | ✅ jul 2026 |
| 046 | `046_enable_billing_unified_global.sql` | `billing.unified` global ON (greenfield) | ✅ jul 2026 |
| 047 | `047_outbox_idempotency_key.sql` | `idempotency_key` en `meta.outbox_events` | ✅ jul 2026 |
| 048 | `048_hub_dashboard_automation.sql` | Métricas automation SA + `core_low_stock_count` + timeline enriquecido | ✅ jul 2026 |
| 049 | `049_stream_automation_runs.sql` | Mirror opcional `stream.automation_runs` (primary: SA Sequelize `AutomationRuns`) | ⬜ código listo |

> **Confirmado prod (15 jul 2026):** migraciones **037–048 aplicadas**. Security Advisor: 0 tablas «RLS Enabled No Policy» tras 038. Triggers public→stream retirados (043). Hub Mi día: `stub=false`, timeline writer live (`smoke-hub-timeline.ps1` OK).
>
> **16 jul 2026:** LifeFlow `030` `app_user_links` ✅; Hub SSO 3/3 con `finance-api.dakinissystems.com`; invite accept + automation runs en código (deploy pendiente).

Deploy: `scripts/deploy-billing-unified-greenfield.ps1` · `scripts/deploy-hub-automation.ps1` · `scripts/apply-hub-048.ps1`  
Smoke: `scripts/smoke-hub.ps1` · `scripts/smoke-hub-timeline.ps1` · `scripts/smoke-creator-suite-sa.ps1` · `scripts/smoke-billing-unified-sa.ps1`  
Verificación RLS: `scripts/verify_rls_no_policy_gaps.sql`

---

## 12. Integraciones externas

| Servicio | Uso en Dakinis |
|----------|----------------|
| Supabase | Postgres principal + Storage (knowledge, uploads) |
| Railway | Hosting servicios, métricas DevOps widget |
| Stripe | Billing Core + licencias StreamAutomator (dual-write → billing central Fase 1.2) |
| Resend | Email transaccional (auth reset, legal) |
| Google OAuth | Login central IdP |
| Redis / BullMQ | Event bus, AI worker, SA publish, notifications |
| Twitch | OAuth AkoeNet, Bits SA, EventSub |
| WhatsApp Meta | Canal Core API |
| OpenAI | dakinis-ai agents |
| Sentry | Error tracking todos los frontends/backends |
| Cloudflare | DNS, email routing |
| OBS | Overlays y companion (roadmap addon) |

### Eventos de dominio (shared-ai)

| Evento | Emisor | Consumidor |
|--------|--------|------------|
| stream.scheduled | StreamAutomator | AkoeNet webhook, Assistant |
| stream.started | SA Director | Notifications, automation, **hub.timeline** |
| stream.ended | SA | Analytics, automation |
| stream.automation.changed | SA automation / Internal smoke | **hub.timeline**, widget automation |
| stream.director.started / ended | SA Director | hub.timeline |
| layout.changed | Workspace | Desktop profiles |
| media.play | Media Player | Widgets now-playing |
| billing.payment_succeeded / billing.payment_failed | Billing service | Core sync, Redis bus |
| user.plan_changed | Billing service (Fase 1.2) | Hub, productos (roadmap) |

---

## 13. Paneles de administración

### AkoeNet `/admin`

| Sección | Funciones |
|---------|-----------|
| Overview | KPIs usuarios, mensajes, licencias (placeholder), revenue (placeholder) |
| Health | Liveness, readiness, deps (API, DB, Redis, Storage, Scheduler) |
| Activity | Mensajes última hora, usuarios activos, servidores |
| Alerts | Reportes pendientes, scheduler legacy, readiness |
| Diagnostics | Realtime sockets, push mobile, historial checks |
| Workspace addons | Toggle addons por email/username/ID |
| Audit logs | Filtros por acción, servidor, fechas |
| Reports | Reportes mensajes, resolver/rechazar |
| DMCA / DPO | Solicitudes legales |
| Push test | Enviar notificación prueba |

### Core `/admin`
- CRUD negocios (tenants)
- Usuarios plataforma
- Catálogo productos
- Telemetría features
- Acceso productos Hub

### StreamAutomator `/admin`
- CRUD usuarios, disable, reset password
- Licencias: generar, trial, extender
- Stats pagos
- Mensajes admin inbox

### Internal API super-admin
- Overview plataforma
- Workspaces list/suspend
- Billing revenue dashboard
- Audit logs globales
- Feature flags GET/PATCH

### Hub workspace admin
- Enable/pin addons por workspace
- Invitar miembros
- Ver usage

---

## 14. Diseño compartido (packages)

### Platform SDK (`@dakinis/sdk` + `@dakinis/shared-platform`)

Punto de entrada único para productos — evita `axios`/`Redis`/Internal API dispersos:

```javascript
import { createDakinisPlatform } from "@dakinis/sdk";

const platform = createDakinisPlatform({
  baseUrl: process.env.DAKINIS_INTERNAL_URL,
  apiKey: process.env.DAKINIS_INTERNAL_SERVICE_KEY,
});

// HTTP clients
await platform.billing.plans();
await platform.featureFlags.evaluateBatch(["billing.unified", "stream.director"], { userId });

// CQRS ligero
platform.commands.register("stream.director.start", async (cmd) => { /* ... */ });
await platform.commands.execute({ type: "stream.director.start", payload: { userId } });

// Capabilities + cache + telemetría
platform.capabilities.resolve("ai");
await platform.cache.memo("bff:summary:uid", 60, () => platform.workspace.addons("ws"));
platform.telemetry.track({ product: "streamautomator", action: "director.started" });
```

| Paquete | Rol |
|---------|-----|
| **@dakinis/sdk** | `createDakinisPlatform()` — auth, billing, workspace, flags, telemetry, buses |
| **@dakinis/shared-platform** | `CommandBus`, `QueryBus`, `CacheService`, `CapabilityRegistry`, `PERMISSIONS`, director state machine |

### Paquetes Foundation (Fase 0+ — jul 2026)

| Paquete | Rol |
|---------|-----|
| **shared-db** | Pool, `TransactionManager` (retries + UoW), repositories, `DirectorSessionFacade`, `OutboxPublisher` (idempotency_key DB + `ON CONFLICT`), outbox processor, `legacy/public-sync` |
| **shared-error** | `AppError`, `mapToHttp`, middleware Express unificado |
| **shared-validation** | Zod: workspace, stream, **billing**, **akoenet**, **core**, **events** (envelope versionado), **addon manifest** |
| **shared-feature-flags** | `evaluate` / `evaluateBatch` + cache memoria/Redis, keys ampliados (`platform.*`, `stream.*`, `core.*`) |
| **shared-ai** | `createDomainEvent` — `schemaVersion`, `correlationId`, `causationId`, `actorId` |

**Adopción actual:** Internal API (flags batch alias, addon data, outbox), AkoeNet (error + flags), StreamAutomator (Director facade + outbox idempotency), SDK listo para cutover gradual en productos.

### addon-sdk (`projects/workspace/packages/addon-sdk`)

| Export | Rol |
|--------|-----|
| `.` | Contrato runtime `WorkspaceAddon` (lifecycle, commands) |
| `./manifest` | Contrato build-time `manifest.json` — `assertAddonManifest`, `isAddonManifest` |

**Adopción Fase 1.4.1:** 9 manifests en `apps/akoenet/Client/src/modules/*/manifest.json` + validación prebuild.

**Fase 2 (jul 2026 — completada en código):**

| Área | Cambio |
|------|--------|
| **Internal API** | `CacheService` (tags `bff:hub:{userId}`, `bff:workspace:{userId}`), `QueryBus`/`CommandBus` en `src/platform/buses.js`; rutas BFF vía `queryBus.execute` |
| **SDK** | `PlatformClient` → `GatewayClient`; `ContractClient` + `loadContractClient`; `HubClient.dashboardAggregated`, `WorkspaceClient.summary`, `HubClient.platformHealth` |
| **AkoeNet** | `addonLoader.js` + `AddonRoutes.jsx` — rutas lazy auto-discovery; `AddonErrorBoundary` por addon |
| **addon-sdk** | `plugin-loader.js` — `discoverAddonManifests` para Node/prebuild |
| **Outbox 047** | `meta.outbox_events.idempotency_key` + `ON CONFLICT DO NOTHING` en `OutboxPublisher` |

```javascript
// SDK BFF helpers
const platform = createDakinisPlatform({ baseUrl, apiKey });
await platform.hub.dashboardAggregated(userId);
await platform.workspace.summary(userId, { fresh: true });

// Contract client (rutas tipadas desde OpenAPI-like JSON)
await platform.contract.get_hub_dashboard_aggregated_userId({ userId });

// Internal BFF query bus (server-side)
import { queryBus, createQuery } from "./platform/buses.js";
await queryBus.execute(createQuery("hub.dashboard.aggregated", { userId }));
```

**Deploy:** `scripts/deploy-foundation-phase2.ps1` · `scripts/deploy-hub-automation.ps1` · `scripts/provision-test-user-velezcampeon.ps1` · `scripts/pilot-workspace-invite.ps1`  
**Smoke:** `scripts/smoke-foundation-bff.ps1` · `scripts/smoke-hub.ps1` · `scripts/smoke-hub-timeline.ps1` · `scripts/smoke-hub-sso-products.ps1` · `scripts/smoke-creator-suite-sa.ps1` · `scripts/smoke-billing-unified-sa.ps1`  
**Test user:** `velezcampeon_88@hotmail.com` · platform `a1000088-0000-4000-8000-000000000088` · SA id 20 · LF `usr_da09193c-ae6`

### shared-brand
- Paleta colores Dakinis (nexora theme)
- Catálogo productos (`products.json`)
- Catálogo workspace addons (`workspace-addons.json`)
- Widgets Hub (`workspace-widgets.json`)
- Helpers SSO, URLs producto

### shared-ux
- Command palette definitions (`DAKINIS_COMMANDS`)
- Hub i18n
- Dashboard cards, activity timeline, quick actions
- Widget framework base

### shared-layouts
- AppShell, HubShell
- HubDashboardPage, HubWorkspaceAdminPage
- Layouts responsive compartidos

### shared-auth
- Google OAuth helpers
- Resolución URLs producto por entorno

---

## 15. Variables de entorno clave (producción)

### Globales
- `DATABASE_URL` — Supabase pooler puerto 6543 con `?pgbouncer=true`
- `DATABASE_SSL=true`
- `REDIS_URL`
- `JWT_SECRET` — compartido auth + Core
- `DAKINIS_GATEWAY_URL` — api.dakinissystems.com
- `DAKINIS_INTERNAL_SERVICE_KEY` — service-to-service
- `DAKINIS_INTERNAL_URL` — Internal API (Railway internal o gateway)
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`

### Supabase
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`

### Auth
- `AUTH_PUBLIC_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CORS_ORIGINS` — todos los dominios producto
- `AKOENET_FRONTEND_URL`, `STREAMAUTOMATOR_WEB_URL`, `CORE_WEB_URL`, `HUB_WEB_URL`
- `RESEND_API_KEY`, `RESEND_FROM`

### AkoeNet
- `VITE_API_URL` — api.akoenet.dakinissystems.com (dominio propio, no gateway genérico)
- `SCHEDULER_API_BASE_URL` — **host API** StreamAutomator (no el frontend SPA)
- `SCHEDULER_WEBHOOK_SECRET` — debe coincidir con SA
- `SCHEDULER_DEFAULT_STREAMER_USERNAME`, `SCHEDULER_ANNOUNCER_USER_ID`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — push web
- `HUB_PLATFORM_SUPER_ADMIN_EMAIL` — super admin workspace

### StreamAutomator
- `AKOENET_SCHEDULER_WEBHOOK_URL` — endpoint webhook AkoeNet
- `SCHEDULER_WEBHOOK_SECRET`
- `DATABASE_URL` — Supabase (schemas stream + public)
- `ENABLE_OUTBOX_WORKER` — default on; poll `meta.outbox_events` y reenvía a Internal API
- `OUTBOX_POLL_INTERVAL_MS` — default 15000
- `DIRECTOR_READ_FROM_STREAM` — `true` para leer sesión activa desde `stream.director_sessions`
- `AUTOMATION_READ_FROM_STREAM` — `true` para listar/ejecutar reglas desde `stream.automation_rules`
- `LEGACY_SYNC_MODE` — `true` para reconciliar `stream.*` → `public.*` en outbox worker
- `DAKINIS_INTERNAL_SERVICE_KEY` — requerido para forward outbox → `/events` y **sync billing unificado**
- `BILLING_UNIFIED_SHADOW_SYNC` — `true` fuerza dual-write SA→billing sin flag (dev/smoke)
- `BILLING_UNIFIED` — `true` fuerza flag global (override)

### Core
- `PORT=4001`, `POSTGRES_SCHEMA=dakinis_core_prod`
- `DAKINIS_BILLING_URL`, `DAKINIS_AI_BASE_URL`, `DAKINIS_AI_SERVICE_KEY`
- `DAKINIS_EVENT_BUS=bullmq`
- Stripe price IDs y webhook secret

### Internal API
- `PORT=4083`
- `REDIS_URL` — caché BFF (`bff:hub:dashboard:*`, `bff:workspace:summary:*`)
- `INTERNAL_RATE_LIMIT_PER_MIN` — default 100
- URLs proxy: notifications, search, billing, knowledge

### Billing (`dakinis-billing`)
- `STRIPE_PRICE_SA_CREATOR_MONTHLY`, `STRIPE_PRICE_SA_PRO_MONTHLY`, `STRIPE_PRICE_SA_LIFETIME` — planes StreamAutomator en Stripe central
- `STREAMAUTOMATOR_INTERNAL_URL` — fan-out webhook → SA `/api/internal/billing/license-sync`

### AI
- `OPENAI_API_KEY`, `POSTGRES_SCHEMA=ai`, `WORKER_MODE=true` (worker)

---

## 16. Estado actual julio 2026 (resumen ejecutivo)

### Commits desplegados recientes (Hub + Automation)

| Repo | Commit | Contenido |
|------|--------|-----------|
| dakinis-internal-api | `9d6df29` | Hub timeline writer (`hub-timeline.js`) |
| dakinis-internal-api | `3c69bbb` | Fix Redis WRONGTYPE en `POST /events` |
| dakinis-streamautomator web | `7a559fb` | Automation builder UX + CreatorSuiteCard |
| dakinis-streamautomator api | `6f4b15d` → `6b1865d` | Delete automation stream-read + hotfix |
| dakinis-hub | `3f58a22` | ActivityTimeline + widget automation |
| Supabase | `048` | Métricas automation + timeline enriquecido |
| Billing | `9ad3ef1` | Validación `cus_*` + LiveCheckout UNIFICADO (user 20) |
| LifeFlow / finanzas | `14171c2` | `app_user_links` rebind upsert (030) |

### Código listo — deploy pendiente (16 jul, sin billing)

| Repo | Commit | Cambio |
|------|--------|--------|
| dakinis-internal-api | `b1c5910` | `acceptWorkspaceInvite` + `POST /workspaces/invites/:token/accept` |
| dakinis-hub | `027e8b6` | `/invite/:token`, enlace en Admin Members, proxy BFF |
| streamautomator | `e73b3d7` | `AutomationRuns` + `GET /api/automation/runs` + UI historial |
| monorepo docs/scripts | `a5e8a6e` | `049`, TEMP/STATUS, `pilot-workspace-invite.ps1`, seed score, smoke SSO `finance-api` |

### Lo que está live y usable hoy
- **Supabase migraciones 037–048 aplicadas en prod** (+ LifeFlow **030** `app_user_links`)
- **Hub Mi día** — `miDiaEnabled=true`, `stub=false`, 5 apps, widgets 048, timeline con eventos reales
- **Hub timeline E2E** — `POST /internal/events` → `hub.timeline` → dashboard (`smoke-hub-timeline.ps1` ✅)
- **Usuario test multi-plataforma** — `velezcampeon_88@hotmail.com` (workspace `velez-test`)
- **Hub SSO** — exchange OK 3/3 StreamAutomator, AkoeNet, LifeFlow `finance-api` (`smoke-hub-sso-products.ps1` ✅ 16 jul)
- **Billing SA unificado** — LiveCheckout UNIFICADO con user 20 + `platformAuthSub` (pago test / webhook pendiente)
- **Security Advisor RLS** — deny policies en gaps (038)
- **Core web** — topbar mobile compacto desplegado
- Auth central + SSO Hub en AkoeNet, SA, Core, LifeFlow
- AkoeNet social completo (servidores, chat, voz, DMs, móvil)
- 9 addons Workspace con UI real + manifests validados prebuild
- Window minimize → dock (Fase 1.4.2)
- Command palette + activity center integrados
- Sync server addon data con revision optimista
- Feature flags workspace (`workspace.addon.*`)
- **Internal API BFF** — agregados con caché Redis + rate limit
- **Billing unificado Fase 1.2** — flag global ON (046); checkout unificado SA OK
- **Paquetes Foundation** + **Foundation Fase 2** desplegada
- **Creator Suite Fase 1C** — dual-write Director/Automation, outbox, smokes `-LiveWrite` ✅
- **Automation builder SA** — params tipados, errores, toggle, `?create=1`
- Integración SA ↔ AkoeNet: webhooks, !schedule, widget upcoming
- Core ERP módulos principales · LifeFlow scoring y coach

### Parcial / en progreso
- **Billing Stripe E2E unificado** — 2ª prioridad; falta pago test + webhook → `billing.subscriptions` + fan-out
- **Hub landing** — screenshot real del dashboard para marketing
- **Workspace invite accept** — API/UI listos; falta deploy + primer invite real piloto
- **Automation runs** — persistencia + UI listos; falta migración Sequelize en prod + redeploy
- AI costes por workspace
- Assistant modules AkoeNet (scaffold + BullMQ worker)
- 17 addons Workspace en preview/placeholder
- Search federada enriquecida
- WhatsApp Core canal live
- Automation: canvas n8n visual (logs de ejecución: código listo)
- LifeFlow migración SQLite → PG (030 links ✅; goals/transactions pendientes)

### Planificado
- DND 5e en Supabase
- Open Banking LifeFlow
- Monaco en code-editor
- Clip studio, game launcher, live-dashboard addons
- Ops: backups automáticos, staging, Sentry

---

## 17. Flujo de usuario típico (ecosistema)

```
1. Usuario entra en Hub (hub.dakinissystems.com) → Mi día con widgets reales
2. Elige producto → SSO sin re-login (token exchange)
3. AkoeNet: home → crear/unirse servidor O abrir /workspace
4. Workspace: elige perfil "morning" → dock con calendar, notes
5. Ctrl+K → buscar mensaje, abrir CRM Core, ir a Director SA, «Nueva regla de automatización»
6. Calendar addon: ventanas flotantes agenda/semana, sync servidor
7. StreamAutomator: programa stream → webhook notifica canal AkoeNet → evento en hub.timeline
8. Admin: /admin → invitar miembro (enlace /invite/:token) + toggles addons
9. Test E2E: usuario velezcampeon_88@hotmail.com en tenant velez-test (5 productos)
```

---

*Único doc TEMP en `docs/`. Sustituye los antiguos ENTORNO-*, ROADMAP-*, ESTRUCTURA-* y STREAMAUTOMATOR-ESTADO-*. Archivar o renombrar cuando exista documentación definitiva sin prefijo TEMP.*

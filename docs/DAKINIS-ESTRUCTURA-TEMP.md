# Dakinis Systems — estructura y funcionamiento (TEMP)

> **Documento temporal** — snapshot mayo 2026, **última revisión 24 mayo 2026 (consolidación prod)**.  
> No sustituye `ARCHITECTURE.md` ni los README de cada repo. Borrar o consolidar cuando la documentación oficial esté al día.

---

## 1. Modelo mental

El ecosistema Dakinis Systems es un **control repo** (orquestación) + **varios repos de producto** bajo el mismo árbol de carpetas en el mantenedor (`D:\dakinis-systems`).

| Capa | Qué hace |
|------|----------|
| **Control repo** (`dakinis-systems`) | Docker Compose, gateway Nginx, contratos, CI, scripts, docs legales compartidos |
| **Plataforma** (`platform/`) | Auth central (IdP), Core SaaS (Dakinis One), paquetes compartidos `@dakinis/*` |
| **Productos** (`apps/`) | Landing, StreamAutomator, AkoeNet, Fitness Platform (demo) |
| **Gateway** | Borde HTTP único: prefijos `/auth/`, `/core/`, `/streamautomator/`, `/akoenet/`, `/fitness/` |

**Regla Git:** la raíz versiona `docker/`, `gateway/`, `docs/`, etc. Las carpetas `apps/` y `platform/` tienen **su propio `.git` y remoto** — no van al historial del control repo.

### Branding comercial

```
Dakinis Systems (empresa madre)
├── Dakinis One      → negocios locales (Core)
├── AkoeNet          → comunidades en tiempo real
└── StreamAutomator  → creadores / streamers
```

Compartido entre productos: auth, legal (`docs/legal/`), soporte.

---

## 2. Mapa del workspace

```
dakinis-systems/                    ← control repo Git
├── docker/                         ← Compose modular (full + dev + db)
├── gateway/                        ← Nginx: auth_request, rate limit, rutas
├── docs/
│   ├── contracts/                  ← contratos ligeros entre servicios
│   ├── legal/                      ← textos legales base + company.json
│   ├── observability/              ← guía logs, Sentry, backups
│   ├── ARCHITECTURE.md
│   ├── ARCHITECTURE-DECISIONS.md   ← opciones y decisiones técnicas
│   └── WORKSPACE-STRATEGY.md
├── scripts/                        ← dev.ps1, backup-postgres.ps1
├── .github/workflows/              ← ci.yml, backup-postgres.yml (plantilla)
├── infrastructure/                 ← scripts PowerShell de mantenimiento
│
├── platform/                       ← repos propios (ignorados en control repo)
│   ├── auth/                       ← IdP JWT multi-tenant + refresh tokens
│   ├── core/                       ← Dakinis One (API + SPA)
│   └── shared/                     ← @dakinis/sdk, auth-client, config, ui
│
└── apps/                           ← repos de producto (ignorados en control repo)
    ├── landing/                    ← web corporativa estática
    ├── streamautomator/            ← Scheduler / automatización de streams
    ├── akoenet/
    │   ├── Client/                 ← web + desktop (Tauri) + Android (Capacitor)
    │   └── Server/                 ← API REST + Socket.IO
    └── fitness-platform/           ← demo local (no producto en prod)
```

---

## 3. URLs de producción

| Producto | URL pública | Rol |
|----------|-------------|-----|
| Landing corporativa | https://dakinissystems.com/ | Marketing, enlaces a productos, legal |
| Dakinis One (Core) | https://core.dakinissystems.com/ | SaaS multi-vertical (clínica, peluquería, restaurante, inmobiliaria) |
| StreamAutomator | https://streamautomator.com/ | Programación y gestión de contenido para streamers |
| AkoeNet (cliente) | https://akoenet.dakinissystems.com/ | Comunidades en tiempo real (chat, voz, DMs) |
| AkoeNet (API) | https://api.akoenet.dakinissystems.com/ | Backend REST + WebSocket |
| Auth (IdP) | Railway `dakinis-auth-production.up.railway.app` | Tras gateway: `/auth/` |

### Topología Railway (producción)

Servicios desacoplados — cloud-native básico, no monolito:

| Servicio Railway | Función | Stack / notas |
|------------------|---------|---------------|
| `dakinis-gateway` | Borde HTTP, rate limit, `auth_request` | Nginx dedicado |
| `dakinis-auth` | IdP central | Express + Postgres |
| `dakinis-core-api` | Backend Dakinis One | HTTP nativo / Fastify opt-in |
| `dakinis-core-front` | SPA Core | Vite build estático |
| `streamautomator-api` | API principal SA | Express + Sequelize |
| `streamautomator-worker` | Colas BullMQ | Proceso separado |
| `streamautomator-scheduler` | Cron / jobs programados | Proceso separado |
| `akoenet-backend` | REST + Socket.IO | Express + Redis adapter |
| `akoenet-client` | SPA AkoeNet | React Router 7 |
| `landing` | Marketing | Static |
| `postgres` (Railway, opcional) | Solo dev Compose local | — |
| **Supabase PostgreSQL** | **Base principal prod** | Schemas `dakinis_auth`, `dakinis_core_prod`, … |
| `redis` | Cache, colas, event bus, Socket.IO | Compartido entre productos |

**Ventaja clave:** workers y scheduler de StreamAutomator **no comparten proceso** con la API — arquitectura distribuida real desde el inicio.

**Contacto comercial Core:** WhatsApp **+34 637 16 91 74** (`wa.me/34637169174`), email `contacto@dakinis-systems.com` — config en `platform/core/web/src/config/contact-urls.js` (`VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_EMAIL`).

---

## 4. Stack local (Docker + gateway)

**Arranque:** `scripts/dev.ps1` o desde `docker/`:

```powershell
docker compose -f compose.full.yml -f compose.dev.yml up --build
```

| Servicio Compose | Puerto | Prefijo gateway | Base de datos |
|------------------|--------|-----------------|---------------|
| `postgres` | 5432 | — | Postgres 15 — schemas `dakinis_auth`, `dakinis_core` |
| `redis` | 6379 | — | Cache / colas / Socket.IO |
| `auth` | 4000 | `/auth/` | Postgres (`dakinis_auth`) |
| `core-api` | 4001 | `/core/` | **SQLite** (default dev) o **PostgreSQL** (`dakinis_core`); `REDIS_URL` para event bus |
| `streamautomator-api` | 4002 | `/streamautomator/` | Postgres (`dakinis_stream`) |
| `akoenet-backend` | 4003 | `/akoenet/` | Postgres (`akoenet`) |
| `fitness-platform-api` | 4010 | `/fitness/` | SQLite (demo) |
| `gateway` | **80** | — | — |

**Variables:** copiar `docker/.env.dev.example` → `docker/.env.dev`. Twitch separado por producto: `TWITCH_*_AKOENET` vs `TWITCH_*_STREAMAUTOMATOR`.

**Core — Docker local (Postgres en Compose):**

```env
DB_DRIVER_CORE=postgres
DATABASE_URL_CORE=postgres://dakinis:dakinis@postgres:5432/dakinis
CORE_SEED_DEMO=true
```

**Core — Railway + Supabase (prod real):**

```env
DATABASE_URL=postgresql://...@....pooler.supabase.com:6543/postgres
POSTGRES_SCHEMA=dakinis_core_prod
CORE_SEED_DEMO=false
```

Guía: [`docs/supabase/SETUP.md`](./supabase/SETUP.md) · [`docs/RAILWAY-PRODUCTION.md`](./RAILWAY-PRODUCTION.md)

### 4.1 `DATABASE_URL` — validación (Supabase + Railway)

**Regla:** en Railway el servicio lee **`DATABASE_URL`** (no `DATABASE_URL_CORE`). En Docker Compose, `DATABASE_URL_CORE` del `.env` se inyecta como `DATABASE_URL` en el contenedor.

| Entorno | Variable en panel/archivo | Variable que lee Node |
|---------|---------------------------|------------------------|
| **Railway Core Back** | `DATABASE_URL` | `DATABASE_URL` |
| **Railway dakinis-auth** | `DATABASE_URL` | `DATABASE_URL` |
| **Docker Compose** | `DATABASE_URL_CORE` en `.env.dev` | `DATABASE_URL` (mapeo en compose) |

**Formato correcto Supabase (Transaction pooler — recomendado):**

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD_URL_ENCODED]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Opcional: `?pgbouncer=true` al final.

| Check | ✅ Correcto | ❌ Incorrecto |
|-------|------------|--------------|
| Host | `*.pooler.supabase.com` | `*.railway.app` (Postgres plugin Railway) |
| Puerto APIs | **6543** | 5432 solo si sabes que es session/direct |
| Prod Core | `DB_DRIVER=postgres` | omitir → puede quedar SQLite |
| Schema | `POSTGRES_SCHEMA=dakinis_core_prod` | `dakinis_core` en prod |
| Demo prod | `CORE_SEED_DEMO=false` | `true` en producción |
| Auth schema | `AUTH_SCHEMA=dakinis_auth` | mezclar tablas en `public` |

**Validar sin commitear la URI:**

```powershell
$env:DATABASE_URL = "postgresql://..."   # pegar URI Supabase
.\scripts\validate-database-url.ps1
```

O tests Core: `cd platform/core/api && npm test`

**Health en prod** (`GET /api/health`):

```json
{
  "db": "postgres",
  "postgresSchema": "dakinis_core_prod",
  "databaseProvider": "supabase",
  "databasePooler": true,
  "databaseUrlValid": true,
  "databaseHost": "aws-0-eu-central-1.pooler.supabase.com",
  "databasePort": 6543
}
```

Si `db` es `sqlite` → Railway **no** tiene `DB_DRIVER=postgres` o `DATABASE_URL` vacío.

**Backups:** `BACKUP_DATABASE_URL` en GitHub = misma URI Supabase; si `pg_dump` falla con 6543, usa **Direct connection** (5432) solo para backups.

**Auth — tokens:**

```env
JWT_ACCESS_TTL=15m
JWT_REFRESH_DAYS=30
JWT_LEGACY_LONG_TTL=true   # solo dev: access token 7d como antes
```

**Core — observabilidad y runtime (opt-in):**

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=development
USE_FASTIFY=true              # servidor Fastify en lugar de http nativo
DAKINIS_EVENT_BUS=redis       # event bus → Redis Streams (default: in-process)
REDIS_URL=redis://redis:6379
```

**AkoeNet Client — login IdP central (opt-in):**

```env
VITE_DAKINIS_AUTH_URL=http://localhost/auth
VITE_USE_IDP_AUTH=true        # false fuerza login local legacy
```

Flujo: `POST /auth/login` (IdP) → `POST /auth/exchange` (AkoeNet Server) → JWT local para REST + Socket.IO.

---

## 5. Flujo de peticiones (gateway)

```mermaid
flowchart TB
  Browser[Navegador / SPA / app móvil]
  GW[Gateway Nginx :80]
  Auth[platform/auth]
  Core[core-api]
  SA[streamautomator-api]
  AN[akoenet-backend]
  FIT[fitness-platform-api]

  Browser --> GW
  GW -->|"/auth/*"| Auth
  GW -->|"auth_request + /core/*"| Core
  GW -->|"auth_request parcial + /streamautomator/*"| SA
  GW -->|"/akoenet/* sin auth_request"| AN
  GW -->|"/fitness/* JWT en API"| FIT

  Auth -->|"GET /auth/verify"| GW
  GW -->|"X-User-Id, X-Tenant-Id, X-User-Role"| Core
  GW -->|"idem"| SA
```

**Autenticación en el borde:**

- **`/core/`** — siempre `auth_request` → `/auth/verify`; reenvía identidad al backend.
- **`/streamautomator/`** — rutas públicas explícitas (OAuth, webhooks Stripe/Twitch, páginas streamer, health); el resto con JWT en gateway.
- **`/akoenet/`** — sin `auth_request` (Socket.IO + auth propia en Express).
- **`/fitness/`** — demo; JWT emitido por la propia API fitness.

---

## 6. Plataforma compartida

### 6.1 `platform/auth` — Identidad central (IdP)

| Aspecto | Detalle |
|---------|---------|
| **Stack** | Node.js, Express, PostgreSQL (`pg`), JWT HS256, bcrypt |
| **Entrada** | `src/app.js` |
| **Endpoints** | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/verify` |
| **Tokens** | Access **15 min** + refresh rotativo (**30 días**, tabla `dakinis_auth.refresh_tokens`) |
| **Claims JWT** | `sub`, `tenantId`, `role`, `email`, `permissions` |
| **RBAC** | Roles canónicos en `src/constants/roles.js` (`platform_admin`, `tenant_admin`, `employee`, `readonly`, `billing`, …) |
| **Logs** | JSON estructurado (`src/utils/structured-logger.js`) |
| **Sentry** | Opcional con `SENTRY_DSN` (`src/utils/sentry.js`) |
| **Health** | `GET /health` (JSON: Sentry, uptime) y `GET /auth/health` (plain `ok` para probes) |
| **Deploy** | Docker `npm ci`; lockfile sincronizado con `@sentry/node` (commit `fix: sync lockfile…`) |
| **Uso** | Gateway valida tokens; productos hacen bridge (Core exchange, StreamAutomator, AkoeNet) |

### 6.2 `platform/shared` — Librerías cliente

Monorepo **pnpm + Turborepo** con paquetes:

| Paquete | Función |
|---------|---------|
| `@dakinis/sdk` | Cliente HTTP genérico |
| `@dakinis/auth-client` | Login/register/me contra `/auth/*` |
| `@dakinis/config` | URLs por defecto (`AUTH_URL`, `API_URL`) |
| `@dakinis/ui` | Componentes UI básicos |

No es un servicio desplegable; lo consumen frontends del ecosistema.  
*(Nota: Core tiene además su propio `platform/core/shared` — motor de negocio interno, distinto de este repo.)*

### 6.3 `platform/core` — Dakinis One

**Producto:** SaaS modular multi-tenant orientado a negocios locales (agenda, CRM, WhatsApp, etc.).

**Stack:** npm workspaces — API Node (**HTTP nativo** por defecto; **Fastify** opt-in con `USE_FASTIFY=true`), handlers **async**, SPA React 19 + Vite 8, i18n ES/EN.

**Capa de datos (dual):**

| Driver | Cuándo | Archivos clave |
|--------|--------|----------------|
| **SQLite** | Dev local (default) | `db/schema.sql`, `db/seed.js` (demo completo) |
| **PostgreSQL** | Prod / Docker con `DB_DRIVER=postgres` | `db/schema.postgres.sql` (schema `dakinis_core`), `db/seed-minimal.js` |

API unificada: `db/query.js` → `dakinisQueryOne`, `dakinisQueryAll`, `dakinisRun`, `dakinisWithTransaction`.

```
platform/core/
├── api/
│   ├── server.js         → entry; elige HTTP nativo o Fastify
│   ├── test/             → dialect.test.js (`npm test`)
│   └── src/
│       ├── db/           → index.js, query.js, postgres.js, dialect.js
│       ├── api/          → auth-routes, platform-routes, tenant-*, router
│       ├── http/         → fastify-server.js (fase 1, delega en dakinisDispatch)
│       ├── lib/          → sentry.js, event-bus.js, event-bus-redis.js
│       └── middleware/   → auth.js, tenant.js, rbac.js (async)
├── docs/
│   └── PRODUCTION.md     → Railway: Postgres, Sentry, Fastify, Redis
├── web/
│   └── src/
│       ├── App.jsx       → routing por pathname, i18n
│       ├── config/       → contact-urls.js (WhatsApp, email)
│       └── locales/      → legal-core.js, es.js, en.js
└── shared/               → motor de negocio (@dakinis/shared interno)
    ├── core/modules/     → agenda, booking, crm, whatsapp, leads, dashboard
    │   └── registry.js   → dakinisRegisterModule() — engine extensible
    ├── adapters/         → config por vertical
    └── catalog/          → registro de sistemas, alérgenos, cocina, planes
```

#### Verticales registrados (sistemas)

| Clave | Nombre | Demo slug |
|-------|--------|-----------|
| `clinica` | Clínica estética | `clinica-demo` |
| `peluqueria` | Peluquería premium | `peluqueria-demo` |
| `restaurante` | Restaurante premium | `restaurante-demo` |
| `inmobiliaria` | Inmobiliaria | `inmobiliaria-demo` |

#### Módulos del motor (por plan)

| Plan | Módulos habilitados |
|------|---------------------|
| **starter** | agenda, booking, dashboard |
| **growth** | + crm, leads |
| **pro** | + whatsapp |

**Module registry:** `dakinisRegisterModule({ key, routes, permissions, sidebar, plans })` — bootstrap de módulos engine; cableado de rutas API desde registry pendiente (fase 2).

**Restaurante (extra):** catálogo EU de alérgenos, página pública `/alergenos/:token`, cocina/stock/compras bajo `/api/tenant/restaurant/*`.

#### Rutas web (SPA, React Router fase 1)

| Ruta | Página |
|------|--------|
| `/` | Home — catálogo de verticales, pricing, contacto (WhatsApp + email) |
| `/login` | Login tenant / admin — **React Router** |
| `/admin` | Panel platform admin — **React Router** + guard |
| `/app/dashboard`, `/app/crm`, … | In-app — **React Router** |
| `/sistema/:vertical`, `/vista/:vertical`, `/alergenos/:token` | LegacyPathRoutes (fase 2) |
| `/sistema/:vertical` | Panel funcional del tenant |
| `/vista/:vertical` | Mockups estáticos de demo |
| `/alergenos/:token` | Ficha pública de alérgenos |
| `/faq`, `/privacy`, `/terms`, `/legal` | Páginas legales (contenido real, i18n) |

#### Infra API (nuevo)

| Componente | Archivo | Activación |
|------------|---------|------------|
| **Sentry** | `lib/sentry.js` | `SENTRY_DSN` |
| **Event bus** | `lib/event-bus.js`, `event-bus-redis.js` | in-process; `DAKINIS_EVENT_BUS=redis` + `REDIS_URL` |
| **Fastify** | `http/fastify-server.js` | `USE_FASTIFY=true` — `server.js` elige runtime |
| **RBAC** | `middleware/rbac.js` | `dakinisRequireRoles([...])` en rutas |
| **Health** | `/api/health` | incluye `db`, `sentry`, `uptimeSec` |

#### Eventos de dominio (Core, emitidos hoy)

| Evento | Cuándo | Payload clave |
|--------|--------|---------------|
| `tenant.created` | `POST /api/platform/businesses` | `tenantId`, `slug`, `type`, `plan` |
| `tenant.updated` | `PATCH /api/platform/businesses/:id` | `tenantId`, `slug`, `type`, `plan` |
| `user.login` | login / exchange | `userId`, `tenantId`, `source` |
| `booking.created` | `POST /api/tenant/mock-records` (reserva/comanda/paciente) | `tenantId`, `recordId` |
| `crm.lead.created` | mock-records entity `lead` | `tenantId`, `recordId` |
| `message.sent` | WhatsApp confirmation | `tenantId`, `channel` |

Consumidores in-process: `lib/event-consumers.js` (audit + analytics logs). Catálogo: `docs/contracts/events-catalog.md`.  
Pendiente SA/AkoeNet: ver catálogo.

#### API (grupos principales)

- **Público:** `/api/health`, `/api/auth/login`, `/api/auth/exchange`, `/api/public/restaurant/:slug/allergies`
- **Platform admin:** `/api/platform/businesses`, `/api/platform/users`
- **Tenant:** usuarios, supply chain, restaurant kitchen/stock, engine (agenda, booking, crm, whatsapp, leads, dashboard)
- **Auth:** JWT local (issuer `dakinis-core`) + exchange desde platform-auth + `x-api-key` por tenant

**Sesión:** un tenant logueado queda ligado a su `business.type` (vertical); `platform_admin` va a `/admin`.

---

## 7. Productos (`apps/`)

### 7.1 Landing — `apps/landing`

| Aspecto | Detalle |
|---------|---------|
| **Qué es** | Web corporativa estática de Dakinis Systems |
| **Stack** | React 19, Vite 8, Tailwind v4 |
| **Rutas** | `/`, `/privacidad`, `/aviso-legal`, `/cookies` (+ aliases EN) |
| **Despliegue** | Static hosting (no está en Compose) |
| **Integraciones** | Ninguna backend; enlaces a Core, AkoeNet, StreamAutomator |

### 7.2 StreamAutomator — `apps/streamautomator`

| Aspecto | Detalle |
|---------|---------|
| **Marca** | Dakinis StreamAutomator (histórico: streamer-scheduler) |
| **Qué hace** | Programar y publicar contenido multi-plataforma; páginas públicas de streamer; overlays OBS; licencias |
| **Stack** | Monorepo: API Express + Sequelize (Postgres/Supabase), Web React 18 + Vite |
| **Workers** | `schedulerServer.js`, `workerServer.js` (colas Redis/BullMQ) |
| **Cobro** | **Stripe** (único producto con pasarela online) |

**Frontend (rutas clave):** `/`, `/pricing`, `/login`, `/dashboard`, `/schedule`, `/streamer/:username`, `/overlay/*`, `/admin`, `/privacy`, `/akoenet/connect`.

**Backend (áreas):** auth/OAuth (Google, Twitch, Discord, X, Slack, YouTube), contenido y templates, pagos Stripe, webhooks Twitch EventSub, integraciones AkoeNet, API pública streamer.

**Integración plataforma:** `platformAuthBridge.js` acepta JWT de `platform/auth`; gateway reenvía cabeceras de identidad (`TRUST_GATEWAY_IDENTITY_HEADERS=true`).

**Hosting:** AWS eu-west-1 (nano) + Railway para API.

### 7.3 AkoeNet — `apps/akoenet/Client` + `Server`

| Aspecto | Detalle |
|---------|---------|
| **Marca** | Dakinis AkoeNet |
| **Qué hace** | Comunidades tipo Discord: servidores, canales, chat en vivo, DMs, voz; apps desktop (Tauri) y Android (Capacitor) |
| **Client stack** | React 19, Vite 8, React Router 7, Socket.IO client |
| **Server stack** | Express, PostgreSQL (Supabase en prod), Socket.IO + Redis adapter, JWT local (+ bridge IdP) |

**Client (rutas):** `/`, `/login`, `/register`, `/server/:serverId`, `/messages`, `/admin`, `/invite/:token`, `/legal/*`.

**Server (API):** `/auth`, `/servers`, `/channels`, `/messages`, `/dm`, `/upload`, `/integrations` (StreamAutomator), `/admin`, Socket.IO en el mismo host.

**Integraciones externas:** Twitch/Steam OAuth, Redis, S3/MinIO, Firebase FCM, Web Push, Elasticsearch (opcional), Resend.

**Integración StreamAutomator:** `SCHEDULER_API_BASE_URL` apunta al API del scheduler; webhooks y comandos bot (`!schedule`).

**Auth — dual (IdP + local):**

| Modo | Cuándo | Flujo |
|------|--------|-------|
| **IdP central** | `VITE_DAKINIS_AUTH_URL` definido en Client | IdP login → `POST /auth/exchange` → JWT local AkoeNet |
| **Legacy** | Sin IdP o `VITE_USE_IDP_AUTH=false` | `POST /auth/login` propio (email/password) |

- **Client:** `src/services/idp-auth.js`, `src/context/AuthContext.jsx` elige flujo según env.
- **Server:** `POST /auth/exchange` — valida JWT IdP (`verifyPlatformIdpAccessToken`), resuelve usuario AkoeNet, emite JWT local + refresh para API y Socket.IO.
- **Siguen locales:** OAuth Twitch/Steam, presencia, sockets, refresh tokens AkoeNet.

**Hosting:** Supabase (DB) + AWS nano + Railway.

**Prod pendiente:** activar `VITE_DAKINIS_AUTH_URL` en Client (p. ej. `https://dakinis-auth-production.up.railway.app` vía gateway `/auth/`).

### 7.4 Fitness Platform — `apps/fitness-platform`

| Aspecto | Detalle |
|---------|---------|
| **Estado** | **Demo local** — no producto en producción |
| **Qué hace** | SaaS fitness multi-tenant (entrenador + cliente) |
| **Stack** | npm workspaces: API Express 5 + Prisma + SQLite, web + admin (React/Vite) |
| **Credenciales demo** | `trainer@demo.fit` / `cliente@demo.fit` — password `demo123` |
| **Gateway** | `/fitness/` sin auth_request; JWT demo en la propia API |

---

## 8. Integraciones entre sistemas

```mermaid
flowchart LR
  subgraph identity [Identidad]
    PA[platform/auth]
  end

  subgraph products [Productos]
    Core[Core API]
    SA[StreamAutomator]
    AN[AkoeNet Server]
  end

  PA -->|"JWT verify (gateway)"| Core
  PA -->|"JWT verify + bridge"| SA
  PA -->|"login IdP (opt-in)"| AN

  AN <-->|"SCHEDULER_API_BASE_URL, webhooks"| SA

  Landing[Landing] -.->|"enlaces"| Core
  Landing -.-> AN
  Landing -.-> SA
```

| Conexión | Mecanismo |
|----------|-----------|
| Gateway → Auth | `auth_request` a `GET /auth/verify` |
| Auth → clientes | Access 15m + `POST /auth/refresh` (rotación) |
| Core ↔ Auth | `POST /api/auth/exchange` (JWT plataforma → sesión core) |
| StreamAutomator ↔ Auth | Bridge en API + cabeceras gateway |
| AkoeNet ↔ StreamAutomator | REST server-to-server, integraciones en `/integrations` |
| AkoeNet ↔ Auth | IdP login + `POST /auth/exchange` (opt-in Client); legacy login local sigue disponible |
| Core event bus | `tenant.created`, `user.login` en Core; Redis Streams opt-in; SA/AkoeNet pendiente |
| Fitness | Aislado (demo); sin platform/auth hoy |

---

## 9. Modelo de datos e infraestructura cloud

### Schemas PostgreSQL

| Schema | Entorno | Servicio | SQL en repo |
|--------|---------|----------|-------------|
| `dakinis_auth` | Supabase prod | platform/auth | `docs/supabase/schemas/01-dakinis-auth.sql` |
| `dakinis_core_prod` | Supabase prod | Core Back | `docs/supabase/schemas/02-dakinis-core-prod.sql` |
| `dakinis_core_dev` | staging | Core (opcional) | copia de `02` con schema dev |
| `dakinis_core` | Docker local | core-api | `docker/postgres/init/03-dakinis-core-schema.sql` |
| `public` (AkoeNet) | Supabase **otro proyecto** | akoenet-backend | migraciones propias — **no mezclar** con Core |

**Supabase:** una URI pooler; schemas separados por `search_path` / `POSTGRES_SCHEMA` / `AUTH_SCHEMA`.

### Hosting

| Producto | Base de datos | Cómputo (referencia) |
|----------|---------------|----------------------|
| Auth | **Supabase** (`dakinis_auth`) | Railway |
| Core | SQLite dev / **Supabase** `dakinis_core_prod` | Railway |
| StreamAutomator | PostgreSQL (Supabase) | AWS eu-west-1 nano + Railway |
| AkoeNet | PostgreSQL (Supabase) | AWS eu-west-1 nano + Railway |
| Fitness | SQLite (local) | Solo Compose |
| Landing | — (estático) | CDN / static host |

**Redis:** StreamAutomator (colas, Socket.IO) y AkoeNet (Socket.IO multi-instancia).

**Backups Postgres:**

| Mecanismo | Uso |
|-----------|-----|
| `scripts/backup-postgres.ps1` | Local/Docker — `pg_dumpall` del contenedor `dakinis-postgres` → `backups/postgres/` |
| `.github/workflows/backup-postgres.yml` | Cron diario 03:00 UTC — **plantilla**; requiere secret `BACKUP_DATABASE_URL` y descomentar paso `pg_dump` |

---

## 10. Cobro y comercial

| Producto | Modelo de cobro |
|----------|-------------------|
| StreamAutomator | Stripe online (licencias) |
| Core, AkoeNet, Auth, resto | Transferencia / acuerdo fuera de plataforma |

Planes Core (referencia comercial): **starter**, **growth**, **pro** — gatean módulos del motor.

---

## 11. Cómo arrancar cada pieza (desarrollo)

| Componente | Comando típico | URL local |
|------------|----------------|-----------|
| **Stack completo** | `scripts/dev.ps1` | Gateway http://localhost |
| **Solo DB/cache** | `docker compose -f compose.db.yml up -d` | Postgres :5432, Redis :6379 |
| **Auth** | `cd platform/auth && npm run dev` | :4000 |
| **Core API** | `cd platform/core && npm run start:api` | :8787 |
| **Core API (Fastify)** | `USE_FASTIFY=true npm run start:api` | :8787 |
| **Core tests** | `cd platform/core && npm test` | — |
| **Core Web** | `cd platform/core && npm run dev` | :5173 (proxy `/api` → API) |
| **Core full** | `cd platform/core && npm run dev:full` | API + Vite |
| **Landing** | `cd apps/landing && npm run dev` | :5173 |
| **StreamAutomator API** | `cd apps/streamautomator && npm run dev:api` | :4002 |
| **StreamAutomator Web** | `cd apps/streamautomator && npm run dev:web` | :3000 |
| **AkoeNet Client** | `cd apps/akoenet/Client && npm run dev` | :5173 |
| **AkoeNet Server** | `cd apps/akoenet/Server && npm run dev` | :4003 |
| **Fitness** | `cd apps/fitness-platform && npm run dev` | API :4010, web :5174, admin :5175 |
| **Shared packages** | `cd platform/shared && pnpm build` | — |

**Demo Core (SQLite):** password `demo123` — emails `admin@clinica-demo.local`, etc.; platform admin `admin@dakinis-platform.local`.

---

## 12. Repos Git (remotos habituales)

| Ruta local | Repo típico |
|------------|-------------|
| `dakinis-systems/` (raíz) | `github.com/dakinissystems/dakinis-systems` |
| `platform/auth` | `dakinis-auth` |
| `platform/core` | `dakinis-core` / dakinis-one |
| `platform/shared` | `dakinis-shared` |
| `apps/landing` | repo landing |
| `apps/streamautomator` | `dakinis-streamautomator` |
| `apps/akoenet/Client` | `akoenet-client` |
| `apps/akoenet/Server` | `akoenet-backend` |

---

## 13. Documentación de referencia (permanente)

| Documento | Contenido |
|-----------|-----------|
| [`README.md`](../README.md) | Visión general del ecosistema |
| [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) | Capas e integración |
| [`docs/ARCHITECTURE-DECISIONS.md`](./ARCHITECTURE-DECISIONS.md) | Decisiones técnicas con pros/contras |
| [`docs/observability/README.md`](./observability/README.md) | Logs, Sentry, uptime, backups |
| [`docs/WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md) | Multi-repo vs monorepo |
| [`docs/contracts/`](./contracts/) | Contratos de rutas tras gateway |
| [`docs/rules.md`](./rules.md) | Reglas operativas (CORS, cache, cambios en borde) |
| [`docker/README.md`](../docker/README.md) | Compose y variables |
| [`gateway/README.md`](../gateway/README.md) | Gateway Nginx |
| [`platform/core/docs/PRODUCTION.md`](../platform/core/docs/PRODUCTION.md) | Core en Railway (Postgres, Sentry, Fastify) |
| [`docs/RAILWAY-PRODUCTION.md`](./RAILWAY-PRODUCTION.md) | **Paso a paso Railway + Supabase** |
| [`docs/supabase/SETUP.md`](./supabase/SETUP.md) | Schemas SQL en Supabase |
| [`docs/railway.env.example`](./railway.env.example) | Plantilla variables Railway |
| [`docs/adr/`](./adr/) | ADRs (Postgres, event bus, Fastify) |
| [`docs/contracts/events-catalog.md`](./contracts/events-catalog.md) | Catálogo eventos dominio |
| [`docs/legal/company.json`](./legal/company.json) | Datos legales centralizados |

---

## 14. Estado de mejoras de arquitectura

Ver detalle en [`ARCHITECTURE-DECISIONS.md`](./ARCHITECTURE-DECISIONS.md) y [`observability/README.md`](./observability/README.md).

### 14.1 Tabla de implementación

| Mejora | Estado |
|--------|--------|
| Core → PostgreSQL (capa dual SQLite/PG) | ✅ Implementado |
| Handlers API async (`db/query.js`) | ✅ Implementado |
| Refresh tokens IdP (`/auth/refresh`, `/auth/logout`) | ✅ Implementado |
| RBAC roles canónicos + middleware Core | ✅ Implementado |
| Module registry (`registerModule`) | ✅ Bootstrap; rutas API manual aún |
| Logs JSON estructurados | ✅ Core + Auth |
| Sentry opcional (`SENTRY_DSN`) | ✅ Core + Auth (cableado; falta DSN en prod) |
| Fastify opt-in (`USE_FASTIFY=true`) | ✅ Fase 1 — delega en `dakinisDispatch` |
| Event bus + consumidores audit | ✅ 6 eventos Core + `event-consumers.js` |
| Postgres schema dev/prod (`POSTGRES_SCHEMA`) | ✅ `dakinis_core_prod` default en prod |
| `CORE_SEED_DEMO=false` auto en prod+PG | ✅ `schema-config.js` |
| React Router Core (fase 1) | ✅ login, admin, `/app/*` |
| Rate limit auth login/exchange | ✅ `DAKINIS_AUTH_RATE_LIMIT_*` |
| AkoeNet IdP (`/auth/exchange` + Client) | ✅ Código listo; falta env en prod |
| Auth lockfile + Sentry login/refresh | ✅ Desplegable |
| Backups GH + restore test script | ✅ Workflow + `restore-postgres-test.ps1` |
| Railway guía paso a paso | ✅ `docs/RAILWAY-PRODUCTION.md` |
| Backup Postgres + GH workflow | ✅ Script + plantilla CI |
| Tests Core (`npm test`) | ✅ Capa dialect/SQL |
| CI (compose, nginx, build Core/Auth/AkoeNet) | ✅ GitHub Actions |
| Core i18n + legal + contacto WhatsApp | ✅ |
| Prod Core doc | ✅ `platform/core/docs/PRODUCTION.md` |
| React Router verticales (`/sistema/*`) | ⏳ Fase 2 |
| Rutas API montadas desde module registry | ⏳ Fase 2 |
| Migración Core completa a Fastify (default) | ⏳ Fase 2 |
| Deploy automático Railway/Vercel | ⏳ Pendiente |
| Uptime Kuma / logs centralizados | ⏳ Documentado |
| Prometheus / Grafana / Loki | ⏳ Fase 2 |

### 14.2 HTTP nativo vs Express vs Fastify (Core)

Core usa **HTTP nativo** (`http.createServer` + `dakinisDispatch` manual). Express y Fastify son capas sobre Node que resuelven routing, middlewares, parsing y error handling estándar.

| Aspecto | HTTP nativo (hoy) | Express | Fastify (recomendado) |
|---------|-------------------|---------|------------------------|
| **Rendimiento** | Máximo | Bueno | Muy alto (cerca de nativo) |
| **Routing / middleware** | Manual | Estándar de facto, ecosistema enorme | Plugins + schemas |
| **Modularidad** | Manual | Media | Encaja con `dakinisRegisterModule()` |
| **Validación / OpenAPI** | Manual | Librerías aparte | Integrado (schemas) |
| **Testing API** | Incómodo | supertest | `inject()` nativo |
| **Coste migración** | — | Alto (refactor amplio) | **Gradual** (`USE_FASTIFY=true` ya disponible) |

**Decisión:** mantener HTTP nativo como **default** hasta estabilizar Postgres + auth + observabilidad. Migración gradual a **Fastify** (no Express) por encaje con registry modular, multi-tenant y plugins por vertical.

**Arquitectura objetivo (futuro):**

```
Gateway Nginx
    ↓
Fastify Core
    ├── auth plugin
    ├── crm / booking / whatsapp plugins (desde registry)
    └── admin plugin
```

### 14.3 Evaluación arquitectura (mayo 2026)

| Dimensión | Antes | Ahora |
|-----------|-------|-------|
| Arquitectura general | 8/10 | **9.2/10** |
| Escalabilidad | 6/10 | **8.2/10** |
| Seguridad | 5.5/10 | **8.5/10** |
| Mantenibilidad | 6.5/10 | **8.5/10** |
| Visión empresarial | 8/10 | **9.5/10** |
| Madurez SaaS real | — | **8.5/10** |

**Identidad lograda:** de “arquitectura prometedora” a **ecosistema SaaS técnicamente serio** — capas reales (observabilidad, runtime configurable, event bus, health, CI, auth enterprise, rollout gradual).

**Riesgo principal actual:** complejidad cognitiva (múltiples stacks) y dispersión de foco entre productos — **no** rehacer arquitectura ni agregar más tecnologías.

### 14.4 Riesgos y límites actuales

| Área | Estado | Cuándo actuar |
|------|--------|---------------|
| **Railway vs AkoeNet realtime** | OK hoy | Muchas websockets, voz, uploads → K8s/ECS/VPS antes que Core |
| **Stacks heterogéneos** | HTTP nativo + Fastify + Express + Sequelize + Prisma | Consolidar tras estabilizar prod; no añadir frameworks |
| **Core routing manual** | Funcional pero limitante | React Router = prioridad alta |
| **Billing centralizado** | Solo Stripe en StreamAutomator | `platform/billing` cuando Core/AkoeNet cobren online |
| **Media/uploads** | En monolito AkoeNet | Servicio upload separado si crece tráfico |
| **Event bus** | Core emite 2 eventos; resto pendiente | Desacople SA ↔ AkoeNet ↔ Core |

### 14.5 Roadmap técnico (orden recomendado)

**Inmediato (Railway + Supabase):** ver [`RAILWAY-PRODUCTION.md`](./RAILWAY-PRODUCTION.md)

1. SQL Supabase: `00` → `01` → `02` en `docs/supabase/schemas/`
2. Core Back: `DATABASE_URL` pooler **6543**, validar con `scripts/validate-database-url.ps1`
3. `POSTGRES_SCHEMA=dakinis_core_prod`, `CORE_SEED_DEMO=false`, `DB_DRIVER=postgres`
4. `SENTRY_DSN` Auth + Core + alertas
5. Secret `BACKUP_DATABASE_URL` + probar `restore-postgres-test.ps1`
6. Uptime Kuma (`docs/observability/uptime-kuma.md`)
7. `VITE_DAKINIS_AUTH_URL` AkoeNet prod

**Próximos meses:**

6. Fastify default (`USE_FASTIFY=true`) tras 1–2 semanas estables
7. React Router verticales + OpenAPI
8. Eventos SA/AkoeNet + logs Grafana/Loki
9. Billing centralizado (`platform/billing`)

**Futuro (no ahora):**

- Multi-region, Kubernetes, billing centralizado, marketplace módulos, white-label
- Separar gateway API / WebSocket / media cuando AkoeNet escale
- OAuth Twitch/Steam y sockets siguen locales en AkoeNet (correcto)

**Regla de oro:** estabilizar Fastify, Postgres, IdP, event bus y observabilidad **antes** de microservicios más finos.

---

## 15. Pendientes operativos

### Producción (activar env)

- Railway Core: `DATABASE_URL` = Supabase pooler 6543 (validar con `validate-database-url.ps1`)
- Railway Core: `DB_DRIVER=postgres`, `POSTGRES_SCHEMA=dakinis_core_prod`, `CORE_SEED_DEMO=false`
- AkoeNet Client: `VITE_DAKINIS_AUTH_URL` apuntando al IdP
- Auth + Core: `SENTRY_DSN`, `SENTRY_ENVIRONMENT=production`
- GitHub: secret `BACKUP_DATABASE_URL` y habilitar paso `pg_dump` en workflow

### Legal y comercial

- Completar NIF/domicilio en aviso legal
- Revisión legal de textos (privacy, terms, cookies)
- Confirmar buzones (`contacto@`, `legal@`, `privacy@`)

### Repos y despliegue

- Commits/despliegue en landing, core, streamautomator, akoenet (legal AkoeNet en stash)
- Fitness Platform: solo demo; sin URL de producción
- Core: mockups de formulario aún parcialmente sin i18n completo

---

## 16. Revisión técnica (24 mayo 2026)

Comprobaciones ejecutadas en workspace local:

| Sistema | `npm ci` / build | Tests / syntax | Notas |
|---------|------------------|----------------|-------|
| **Auth** | ✅ | ✅ `node --check` | Lockfile sync; error handler tras rutas |
| **Core API** | ✅ | ✅ tests dialect + `validate-database-url` | Validación URI Supabase en arranque + `/api/health` |
| **Core Web** | ✅ `npm run build` | — | Vite OK |
| **AkoeNet Server** | ✅ | — | IdP `/auth/exchange` operativo |
| **Control repo** | — | CI compose + nginx | `compose.full.yml`: `REDIS_URL` en core-api |

**Capas reales confirmadas:** observabilidad (Sentry opt-in), runtime configurable (HTTP/Fastify), event bus (in-process + Redis), health enriquecido, backups, CI, auth enterprise (refresh rotativo + exchange), rollout gradual IdP AkoeNet.

**No añadir tecnología nueva** hasta estabilizar: Postgres prod Core, Sentry DSN, IdP AkoeNet prod, backups GH, ampliar eventos cross-producto.

---

*Generado como referencia rápida. Actualizar o eliminar cuando se integre en documentación estable.*

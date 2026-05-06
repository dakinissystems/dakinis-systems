# Dakinis Systems — raíz del ecosistema (`D:\dakinis-systems`)

**Contenedor de trabajo** (no es un repositorio Git): agrupa la **plataforma** (`platform/`), las **aplicaciones** (`apps/`), **infraestructura** compartida (`infrastructure/`) y **documentación** (`docs/`). Cada producto o paquete principal vive en su propio clon con `origin` propio, salvo `docs/` e `infrastructure/`, que no tienen `.git`.

## Modelo mental

```
Dakinis Systems (contenedor multi-repo)
├── Core platform  →  platform/
│   ├── auth       →  identidad JWT multi-tenant (dakinis-auth)
│   ├── shared     →  monorepo pnpm + Turborepo @dakinis/* (sdk, auth-client, config, ui)
│   └── core       →  negocio compartido (npm workspaces: api, web, shared)
├── Apps           →  apps/
│   ├── streamautomator   Dakinis StreamAutomator (apps/api Express, apps/web React)
│   ├── akoenet           Dakinis AkoeNet — Server/ y Client/ (cada uno, repo Git propio)
│   └── landing           marketing (Vite)
└── Infraestructura →  infrastructure/
    ├── docker/    compose y servicios locales
    ├── nginx/     configuración de proxy / gateway
    └── scripts/   migración, Git safe.directory, junctions
```

## Estado del árbol (mayo 2026)

| Ruta | Estado |
|------|--------|
| Raíz `dakinis-systems` | **Sin `.git`** — solo organiza clones; ver [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md). |
| `platform/auth` | **Repo real** — servicio Express, JWT `sub`, `tenantId`, `role`. |
| `platform/shared` | **Repo real (canónico)** — `pnpm`, Turborepo, paquetes `packages/*`. |
| `platform/core` | **Repo real** — workspace npm (`api`, `web`, `shared`); CRM, scheduling, WhatsApp, etc. |
| `apps/streamautomator` | **Repo real** — raíz npm `dakinis-streamautomator`; subproyectos `apps/api` y `apps/web`. |
| `apps/akoenet` | **Carpeta agrupadora** — **sin** `.git` en la raíz; repos en `Client/` y `Server/`. |
| `apps/landing` | **Repo real** — sitio marketing Vite. |
| `docs/` | Documentación del ecosistema (sin Git). |
| `infrastructure/` | Docker, nginx, scripts PowerShell (sin Git). |

**Mantenimiento ocasional**

- Restos de migración o junction roto (p. ej. StreamAutomator): [`infrastructure/scripts/finish-pending-moves.ps1`](./infrastructure/scripts/finish-pending-moves.ps1); recrear junction solo si hace falta: [`infrastructure/scripts/recreate-layout.ps1`](./infrastructure/scripts/recreate-layout.ps1).
- *Dubious ownership* en Git bajo Windows: [`infrastructure/scripts/setup-git-safe-directories.ps1`](./infrastructure/scripts/setup-git-safe-directories.ps1).

## Mapa rápido por carpeta

| Ruta | Contenido principal |
|------|---------------------|
| `apps/streamautomator` | API Express + frontend React; scripts en la raíz del repo. |
| `apps/akoenet/Client` | Cliente (repo Git). |
| `apps/akoenet/Server` | Backend (repo Git). |
| `apps/landing/` | Marketing Vite. |
| `platform/auth/` | Auth HTTP / JWT. |
| `platform/shared/` | `packages/sdk`, `auth-client`, `config`, `ui`. |
| `platform/core/` | `api/`, `web/`, `shared/`. |
| `infrastructure/docker/` | Compose y entorno local. |
| `infrastructure/nginx/` | Configuración nginx. |
| `infrastructure/scripts/` | Automatización de layout y Git. |

### Naming público

| Código / histórico | Marca |
|--------------------|--------|
| streamer-scheduler | **Dakinis StreamAutomator** (`dakinis-streamautomator` en la raíz del repo) |
| AkoeNet | **Dakinis AkoeNet** |

## Integración

- **Auth:** `platform/auth` → JWT con `sub`, `tenantId`, `role`.
- **Cliente:** `platform/shared` → `@dakinis/sdk`, `@dakinis/auth-client`, `@dakinis/config` (y `@dakinis/ui` donde aplique).
- **AkoeNet ↔ StreamAutomator:** integración pública con `service: "streamautomator"` donde esté definido en el contrato.

## Documentación y scripts

- Estrategia multi-repo / monorepo y checklist operativo: [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md)
- Capas y mapa post-migración: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Git en Windows (`safe.directory`): [`infrastructure/scripts/setup-git-safe-directories.ps1`](./infrastructure/scripts/setup-git-safe-directories.ps1)
- Migración física pendiente: [`infrastructure/scripts/finish-pending-moves.ps1`](./infrastructure/scripts/finish-pending-moves.ps1)
- Junction StreamAutomator (excepcional): [`infrastructure/scripts/recreate-layout.ps1`](./infrastructure/scripts/recreate-layout.ps1)

## Docker / gateway

**Stack completo (Auth, Core API, StreamAutomator API, AkoeNet backend, Postgres, Redis, Nginx):** [`docker/`](./docker/) — desde esa carpeta ejecuta `docker compose up --build`. Gateway en `http://localhost` con rutas `/auth/`, `/core/`, `/streamautomator/`, `/akoenet/` (ver [`docker/README.md`](./docker/README.md)).

[`infrastructure/docker/`](./infrastructure/docker/) — compose **esqueleto** (solo Postgres/Redis con perfiles) conservado para desarrollo parcial; la referencia de arquitectura sigue en [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) y [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md).

# Dakinis Systems — raíz del ecosistema (`D:\dakinis-systems`)

## Control repo + product repos

La raíz es un **repositorio Git ligero** (stack, gateway, docs, scripts, compose) con [`.gitignore`](./.gitignore) que **excluye** `apps/` y `platform/` — esos directorios siguen siendo **clones con su propio `.git` y remoto**; no se duplica su código en el historial del control repo.

| Qué se versiona en la raíz | Qué no (cada equipo en su repo) |
|----------------------------|----------------------------------|
| `docker/`, `gateway/`, `docs/`, `infrastructure/`, `scripts/`, `README.md` | Código bajo `apps/*` y `platform/*` |

Tras clonar el control repo, vuelve a crear `apps/` y `platform/` y clonar ahí auth, core, shared, landing, etc. (ver [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md)).

**Arranque local en un comando:** [`scripts/dev.ps1`](./scripts/dev.ps1) (fusiona `compose.full.yml` + `compose.dev.yml`).

## Modelo mental

```
Dakinis Systems
├── Control (Git raíz)     docker/  gateway/  docs/  infrastructure/  scripts/
├── Core platform  →  platform/   (clones ignorados por el control repo)
│   ├── auth       →  JWT multi-tenant (dakinis-auth)
│   ├── shared     →  pnpm + Turborepo @dakinis/*
│   └── core       →  npm workspaces api, web, shared
├── Apps           →  apps/       (clones ignorados)
│   ├── streamautomator   Express API + React web
│   ├── akoenet           Client/ y Server/ — repo Git cada uno
│   └── landing           Vite
└── Borde HTTP     →  gateway/    Nginx: nginx.conf + routes/ (+ middleware/ futuro)
```

## Estado del árbol (mayo 2026)

| Ruta | Estado |
|------|--------|
| Raíz `dakinis-systems` | **Control repo Git** — versiona stack + gateway + docs; ver `.gitignore`. |
| `platform/*`, `apps/*` | **Repos propios** — no van al control repo. |
| `docker/` | Compose modular: `compose.full.yml` + `compose.dev.yml` (entrada típica), `compose.db.yml` (solo DB/cache). |
| `gateway/` | Config **activa** del contenedor `gateway` (Nginx). |
| `scripts/` | [`dev.ps1`](./scripts/dev.ps1) y utilidades. |
| `docs/` | Incluye [`docs/contracts/`](./docs/contracts/) (contratos entre servicios). |
| `infrastructure/` | Scripts PowerShell, notas; `infrastructure/nginx/` solo referencia (el borde real es `gateway/`). |

**Mantenimiento ocasional**

- Migración física / junctions: [`infrastructure/scripts/finish-pending-moves.ps1`](./infrastructure/scripts/finish-pending-moves.ps1), [`infrastructure/scripts/recreate-layout.ps1`](./infrastructure/scripts/recreate-layout.ps1).
- *Dubious ownership* (Git en Windows): [`infrastructure/scripts/setup-git-safe-directories.ps1`](./infrastructure/scripts/setup-git-safe-directories.ps1).

## Mapa rápido por carpeta

| Ruta | Contenido principal |
|------|---------------------|
| `docker/` | Stack local; ver [`docker/README.md`](./docker/README.md). |
| `gateway/` | API gateway Nginx (`nginx.conf`, `routes/`, `middleware/`). |
| `scripts/dev.ps1` | `docker compose -f compose.full.yml -f compose.dev.yml up --build` + `.env` / `.env.dev` autocreados si faltan. |
| `apps/streamautomator` | API + web (repo Git). |
| `apps/akoenet/Client`, `Server` | Repos Git separados. |
| `apps/landing/` | Marketing Vite. |
| `platform/auth/`, `shared/`, `core/` | Plataforma (repos Git). |
| `docs/contracts/` | Contratos de rutas/prefijos entre servicios. |
| `infrastructure/scripts/` | Layout, `safe.directory`, etc. |

### Naming público

| Código / histórico | Marca |
|--------------------|--------|
| streamer-scheduler | **Dakinis StreamAutomator** (`dakinis-streamautomator`) |
| AkoeNet | **Dakinis AkoeNet** |

## Integración

- **Auth:** `platform/auth` → JWT `sub`, `tenantId`, `role`.
- **Cliente:** `platform/shared` → `@dakinis/sdk`, `@dakinis/auth-client`, `@dakinis/config`, `@dakinis/ui`.
- **Contratos gateway:** [`docs/contracts/`](./docs/contracts/).
- **AkoeNet ↔ StreamAutomator:** `service: "streamautomator"` donde esté definido en el contrato.

## Documentación y scripts

- Estrategia workspace / control repo: [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md)
- Arquitectura: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Docker y entornos: [`docker/README.md`](./docker/README.md)

## Docker / gateway

Stack completo: `scripts/dev.ps1` o desde `docker/`: `docker compose -f compose.full.yml -f compose.dev.yml up --build`. Solo DB/cache: `docker compose -f compose.db.yml up -d`. Detalle: [`docker/README.md`](./docker/README.md).

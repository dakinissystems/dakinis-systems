# Dakinis Systems — raíz del ecosistema (`D:\dakinis-systems`)

Repositorio remoto: [github.com/dakinissystems/dakinis-systems](https://github.com/dakinissystems/dakinis-systems).

## Control repo + product repos

La raíz del workspace es un **repositorio Git ligero** (stack, gateway, docs, CI, scripts, compose) con [`.gitignore`](./.gitignore) que **excluye** `apps/` y `platform/` — esos directorios siguen siendo **clones con su propio `.git` y remoto**; no se duplica su código en el historial del control repo.

| Qué se versiona en la raíz | Qué no (cada equipo en su repo) |
|----------------------------|----------------------------------|
| `docker/`, `gateway/`, `docs/`, `.github/`, `infrastructure/`, `scripts/`, `README.md` | Código bajo `apps/*` y `platform/*` |

Tras clonar este repo, crea `apps/` y `platform/` en el mismo nivel que conviene a tu máquina y clona ahí auth, core, shared, landing, etc. (ver [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md)). En el mantenedor, el árbol completo suele vivir bajo `D:\dakinis-systems\`; las rutas de documentación asumen ese layout salvo que indiques lo contrario.

**Arranque local en un comando:** [`scripts/dev.ps1`](./scripts/dev.ps1) (fusiona `compose.full.yml` + `compose.dev.yml`).

## Modelo mental

```
Dakinis Systems
├── Control (Git raíz)     docker/  gateway/  docs/  .github/  infrastructure/  scripts/
├── Core platform  →  platform/   (clones ignorados por el control repo)
│   ├── auth       →  JWT multi-tenant (dakinis-auth)
│   ├── shared     →  pnpm + Turborepo @dakinis/*
│   └── core       →  npm workspaces api, web, shared
├── Apps           →  apps/       (clones ignorados)
│   ├── streamautomator   Express API + React web
│   ├── akoenet           Client/ y Server/ — repo Git cada uno
│   └── landing           Vite
└── API Gateway    →  gateway/    Nginx: `nginx.conf` + `routes/` (+ `middleware/` futuro)
```

## Estado del árbol (mayo 2026)

| Ruta | Estado |
|------|--------|
| Raíz del workspace | **Control repo Git** — versiona stack + gateway + docs; ver `.gitignore`. |
| `platform/*`, `apps/*` | **Repos propios** — no van al control repo. |
| `docker/` | Compose modular: `compose.full.yml` + `compose.dev.yml` (entrada típica), `compose.db.yml` (solo DB/cache). |
| `gateway/` | **API Gateway** Nginx del stack (`auth_request`, cache de verify, rate limit, logs `gateway_main` con `user`/`tenant` donde aplique). Ver [`gateway/README.md`](./gateway/README.md). |
| `.github/workflows/` | CI en `main` / PR: validación de Compose + `nginx -t` sobre `gateway/`. |
| `scripts/` | [`dev.ps1`](./scripts/dev.ps1) y utilidades. |
| `docs/` | Incluye [`docs/contracts/`](./docs/contracts/) y [`docs/rules.md`](./docs/rules.md) (cambios en rutas, CORS producción, operativa del gateway). |
| `infrastructure/` | Scripts PowerShell, notas; `infrastructure/nginx/` solo referencia (el borde real es `gateway/`). |

**Mantenimiento ocasional**

- Migración física / junctions: [`infrastructure/scripts/finish-pending-moves.ps1`](./infrastructure/scripts/finish-pending-moves.ps1), [`infrastructure/scripts/recreate-layout.ps1`](./infrastructure/scripts/recreate-layout.ps1).
- *Dubious ownership* (Git en Windows): [`infrastructure/scripts/setup-git-safe-directories.ps1`](./infrastructure/scripts/setup-git-safe-directories.ps1).

## Stack ↔ código en cloud (mayo 2026)

| Capa cloud | Proveedor | Región / tamaño | Producto | Rutas en el workspace |
| --- | --- | --- | --- | --- |
| Base de datos / backend gestionado | **Supabase** | (proyecto **AkoeNet**) | Dakinis **AkoeNet** — Postgres, auth opcional, pooler | Código que habla con la DB: `apps/akoenet/Server` (ver `Server/.env.example`, migraciones). Cliente: `apps/akoenet/Client`. |
| Cómputo | **AWS** | **`eu-west-1`**, **nano** | **Streamer Schedule** (marca: **Dakinis StreamAutomator**, repo `dakinis-streamautomator`) | `apps/streamautomator` (`apps/api`, `apps/web`) |
| Cómputo | **AWS** | **`eu-west-1`**, **nano** | **AkoeNet** — API / servicios Node (capa de aplicación; la DB sigue en Supabase) | `apps/akoenet/Server` (y front según despliegue: `apps/akoenet/Client`) |

**Nano** = instancia / plan de cómputo mínimo en AWS (p. ej. Lightsail nano o equivalente).

### Resumen en una línea

- **Supabase `AkoeNet`** → datos y servicios gestionados de AkoeNet; implementación principal en `apps/akoenet/Server`.
- **Primer nano `eu-west-1`** → StreamAutomator (Streamer Schedule) en `apps/streamautomator`.
- **Segundo nano `eu-west-1`** → AkoeNet (app) en `apps/akoenet/`.

Si clonas solo este repo de orquestación, clona también los productos bajo `apps/…` siguiendo el mapa anterior.

## Mapa rápido por carpeta

| Ruta | Contenido principal |
|------|---------------------|
| `docker/` | Stack local; ver [`docker/README.md`](./docker/README.md). |
| `gateway/` | Borde HTTP / API Gateway — [`gateway/README.md`](./gateway/README.md) (`nginx.conf`, `routes/`, rate limit, cache de auth, CORS documentado). |
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

- **Auth:** `platform/auth` → JWT `sub`, `tenantId`, `role`; el gateway delega en `/auth/verify` y reenvía identidad (`X-User-Id`, `X-Tenant-Id`) en rutas protegidas.
- **Cliente:** `platform/shared` → `@dakinis/sdk`, `@dakinis/auth-client`, `@dakinis/config`, `@dakinis/ui`.
- **Contratos y cambios en el borde:** [`docs/contracts/`](./docs/contracts/) + [`docs/rules.md`](./docs/rules.md) (obligatorio para prefijos, CORS en producción y política de cache/rate limit).
- **AkoeNet ↔ StreamAutomator:** `service: "streamautomator"` donde esté definido en el contrato.

## Modelo de cobro (actual)

- **Dakinis StreamAutomator (Scheduler):** cobro online con Stripe.
- **Resto de productos (core, auth, akoenet, etc.):** cobro por transferencia fuera de la plataforma.

## Documentación y scripts

- Estrategia workspace / control repo: [`docs/WORKSPACE-STRATEGY.md`](./docs/WORKSPACE-STRATEGY.md)
- Reglas operativas (rutas públicas / contratos): [`docs/rules.md`](./docs/rules.md)
- Arquitectura: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Docker y entornos: [`docker/README.md`](./docker/README.md)

## Docker y gateway

- **Arranque:** stack completo con [`scripts/dev.ps1`](./scripts/dev.ps1) o desde `docker/`: `docker compose -f compose.full.yml -f compose.dev.yml up --build`. Solo DB/cache: `docker compose -f compose.db.yml up -d`. Detalle: [`docker/README.md`](./docker/README.md).
- **Gateway:** el contenedor `gateway` monta [`gateway/`](./gateway/); cualquier cambio de rutas o cabeceras es **contrato** — revisar [`docs/rules.md`](./docs/rules.md) y abrir PR (CI valida Compose + `nginx -t`).

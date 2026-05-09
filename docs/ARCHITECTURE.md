# Arquitectura — Dakinis Systems

Referencia viva bajo `D:\dakinis-systems`: **control repo** (Docker + **gateway** + docs) + **Core platform** (`platform/`) + **productos** (`apps/`).

## 1. Plataforma multi-producto

| Capa | Rol |
|------|-----|
| Identity | `platform/auth` — JWT multi-tenant |
| Shared | `platform/shared` — `@dakinis/sdk`, `@dakinis/auth-client`, `@dakinis/config`, `@dakinis/ui` |
| Core | `platform/core` — negocio compartido |
| Apps | StreamAutomator, AkoeNet, landing |
| Marketing | `apps/landing` |
| Borde HTTP | `gateway/` — Nginx frente a los backends (evolución hacia API gateway) |

## 2. Mapa de carpetas

```
dakinis-systems/
├── docker/              → compose modular: compose.full.yml + compose.dev.yml; compose.db.yml
├── gateway/             → nginx.conf, routes/, middleware/ (futuro rate limit, auth_request, …)
├── scripts/             → dev.ps1 (entrypoint DX)
├── docs/
│   ├── contracts/       → contratos ligeros entre servicios (prefijos / rutas)
│   ├── ARCHITECTURE.md
│   └── WORKSPACE-STRATEGY.md
├── infrastructure/      → scripts PowerShell; notas (nginx legacy → ver gateway/)
├── apps/
│   ├── streamautomator/
│   ├── akoenet/         → Client/ y Server/ — cada uno repo Git
│   └── landing/
└── platform/
    ├── auth/
    ├── shared/
    └── core/
```

`apps/` y `platform/` se ignoran en el **control repo** de la raíz; su código vive en otros remotos.

## 3. Nombres de producto

- **Dakinis StreamAutomator** — código histórico `streamer-scheduler`.
- **Dakinis AkoeNet** — `apps/akoenet` agrupa `Client` y `Server` (repos Git separados).

## 4. Integración

| Pieza | Ubicación |
|-------|-----------|
| Auth | `platform/auth` |
| Cliente HTTP / auth FE | `@dakinis/sdk`, `@dakinis/auth-client` desde `platform/shared` |
| Config / rutas `/auth/*` | `@dakinis/config`, `DAKINIS_AUTH_HTTP` |
| Contratos públicos tras el gateway | [`docs/contracts/`](./contracts/) |

## 5. Roadmap y estrategia de repo

Gateway único, tenant isolation + billing, posible `pnpm`/Turborepo en la raíz del ecosistema — ver [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md) y el [`README.md`](../README.md) raíz.

> Modelo actual de cobro: **solo Dakinis StreamAutomator (Scheduler)** usa pasarela online (Stripe).  
> El resto de productos del ecosistema operan cobro por **transferencia fuera de plataforma**.

## 6. GitHub

- [dakinis-shared](https://github.com/dakinissystems/dakinis-shared)  
- [dakinis-auth](https://github.com/dakinissystems/dakinis-auth)  

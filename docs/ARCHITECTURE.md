# Arquitectura — Dakinis Systems

> **Audiencia:** control interno. Estado operativo y checklist: [`OPERATIONS.md`](./OPERATIONS.md).

**Control repo** (`dakinis-systems`): Docker, gateway, docs. **Código de producto:** repos bajo `apps/` y `platform/` (ignorados en Git de la raíz). Ver [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md).

## Productos

```
Dakinis Systems
├── Dakinis One (Core)     → BOS multi-tenant (restaurante, clínica, retail…)
├── AkoeNet                → comunidades, voz, sockets
└── StreamAutomator (SA)   → scheduler Twitch, Stripe online
```

| Capa | Repo / carpeta |
|------|----------------|
| IdP | `platform/auth` |
| Paquetes FE | `platform/shared` (`@dakinis/*`) |
| Core | `platform/core` |
| SA | `apps/streamautomator` |
| AkoeNet | `apps/akoenet/Client`, `apps/akoenet/Server` |
| Borde HTTP | `gateway/` |

## Mapa de carpetas

```
dakinis-systems/
├── docker/       compose local
├── gateway/      nginx
├── docs/         índice: README.md
├── apps/         productos (git ignorado en raíz)
└── platform/     auth, core, shared
```

## Datos y despliegue (prod)

| Pieza | Tecnología |
|-------|------------|
| PostgreSQL | **Supabase** (pooler **6543**) — guía [`supabase/SETUP.md`](./supabase/SETUP.md) |
| Compute | **Railway** |
| Cache / eventos | **Redis** (Railway) |
| Operaciones / checklist | [`OPERATIONS.md`](./OPERATIONS.md) |

## Contratos HTTP

Cambios en rutas públicas: [`rules.md`](./rules.md) + [`contracts/`](./contracts/).

## Decisiones (resumen)

| Tema | Decisión |
|------|----------|
| DB Core | PostgreSQL + schema `dakinis_core_prod` + `business_id` en filas |
| Auth | IdP central `dakinis-auth`; productos migran a exchange |
| Framework API | Express hoy; Fastify opt-in en Core más adelante |
| Observabilidad | JSON logs + Sentry |

Detalle formal: [`adr/`](./adr/) (ADR-001 Postgres, ADR-002 event bus, ADR-003 Fastify).

## Cobro

Solo **StreamAutomator** usa Stripe en plataforma. Resto: transferencia externa.

## GitHub

- [dakinis-shared](https://github.com/dakinissystems/dakinis-shared)
- [dakinis-auth](https://github.com/dakinissystems/dakinis-auth)

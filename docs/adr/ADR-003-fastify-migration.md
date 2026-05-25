# ADR-003: Migración gradual a Fastify

**Estado:** Aceptado (fase 1 opt-in)  
**Fecha:** 2026-05

## Contexto

Core API usa HTTP nativo + `dakinisDispatch`. Crecimiento de middlewares y multi-tenant.

## Decisión

- `USE_FASTIFY=true` activa `fastify-server.js` que delega en `dakinisDispatch`.
- Default sigue HTTP nativo hasta Postgres + Sentry + tests estables.
- Objetivo: Fastify default en prod, no Express en Core.

## Alternativas rechazadas

Reescritura completa inmediata (riesgo downtime).

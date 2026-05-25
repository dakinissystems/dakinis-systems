# ADR-001: PostgreSQL como store de Core en producción

**Estado:** Aceptado  
**Fecha:** 2026-05

## Contexto

Core usaba SQLite en dev. Producción requiere concurrencia, backups y schema aislado.

## Decisión

- Capa `db/query.js` dual SQLite/Postgres.
- Prod: `DB_DRIVER=postgres`, `CORE_SEED_DEMO=false`.
- Schemas separables: `dakinis_core_prod` / `dakinis_core_dev` vía `POSTGRES_SCHEMA`.

## Consecuencias

- Migración gradual sin reescribir handlers.
- Seed demo nunca en prod por defecto si `NODE_ENV=production`.

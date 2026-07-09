# ADR-002 — Supabase multi-schema

## Contexto

Varios productos comparten PostgreSQL en Railway/Supabase pero con dominios de datos distintos. Un solo schema `public` dificulta ownership, RLS y migraciones.

## Decisión

Un proyecto Supabase **Dakinis Production** con **schemas por dominio** (`dakinis_auth`, `billing`, `hub`, `stream`, `lifeflow`, `ai`, `knowledge`, …). Pooler `:6543`. Funciones SQL versionadas (`hub.v1_get_dashboard`). Identidad en schema `dakinis_auth` (no `auth` reservado por Supabase).

## Consecuencias

- Migraciones ordenadas en `docs/supabase/migrations/` con RUN-ORDER.
- Cada equipo/servicio es owner de su schema (ver [`STATUS.md`](../STATUS.md) § Supabase).
- Cutover gradual: `dakinis_core_prod` → `core` sin big-bang.

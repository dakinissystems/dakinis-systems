# Orden de ejecución — Supabase SQL Editor

Pega **cada archivo en orden** en el SQL Editor de Supabase (proyecto **Dakinis Production**).

> **Identidad:** `dakinis_auth` (no `auth`). **ERP activo:** `dakinis_core_prod` hasta cutover → `core`.  
> **Convenciones y estado:** [`DAKINIS-ESTRUCTURA-TEMP.md`](../../DAKINIS-ESTRUCTURA-TEMP.md) §17

## Fase A — Estructura (000–013)

| # | Archivo | Qué hace |
|---|---------|----------|
| 0 | [`000_extensions.sql`](./000_extensions.sql) | Extensiones |
| 1–13 | `001` … `013` | Schemas, tablas, RLS lockdown |

## Fase B — Backfill legacy (014–015)

| # | Archivo | Prod |
|---|---------|------|
| 14a | [`014a_auth_nullable_password.sql`](./014a_auth_nullable_password.sql) | Si 014 falla OAuth |
| 14 | [`014_backfill_legacy_map.sql`](./014_backfill_legacy_map.sql) | ✅ 7 users |
| 15 | [`015_backfill_stream_data.sql`](./015_backfill_stream_data.sql) | ✅ 120 contents |

## Fase C — Mejoras arquitectura (016–019) ⬜ pendiente en prod

| # | Archivo | Qué hace |
|---|---------|----------|
| 16 | [`016_schema_enhancements.sql`](./016_schema_enhancements.sql) | AI prompt_versions, audit ampliado, hub dashboard_prefs |
| 16b | [`016b_stream_sync_triggers.sql`](./016b_stream_sync_triggers.sql) | **Fase convivencia:** sync `public.Contents` → `stream.contents` |
| 17 | [`017_functions_v1.sql`](./017_functions_v1.sql) | API SQL versionada (Node llama funciones, no tablas) |
| 18 | [`018_hub_dashboard.sql`](./018_hub_dashboard.sql) | Vista + materialized view dashboard |
| 19 | [`019_rls_templates_and_cutover_plan.sql`](./019_rls_templates_and_cutover_plan.sql) | RLS plantillas + checklist cutover core |

## Seeds

| Archivo | Contenido |
|---------|-----------|
| [`../seeds/core.sql`](../seeds/core.sql) | Tenants demo |
| [`../seeds/billing.sql`](../seeds/billing.sql) | Planes |
| [`../seeds/hub.sql`](../seeds/hub.sql) | Widgets |
| [`../seeds/ai.sql`](../seeds/ai.sql) | Agentes + prompts v1 |

## Archive

Cuando llegue migración **050**, mover 000–020 a [`archive/`](./archive/).

## Legacy (no repetir)

- `../schemas/01-dakinis-auth.sql` … `12-tenant-access.sql`

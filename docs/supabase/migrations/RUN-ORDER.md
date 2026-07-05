# Orden de ejecución — Supabase SQL Editor

Pega **cada archivo en orden** en el SQL Editor de Supabase (proyecto **Dakinis Production**).

> **Identidad:** `dakinis_auth` (no `auth`). **ERP activo:** `dakinis_core_prod` hasta cutover → `core`.  
> **Convenciones y estado:** [`PLATFORM-STATUS.md`](../../PLATFORM-STATUS.md)

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
| 17 | [`017_functions_v1.sql`](./017_functions_v1.sql) | API SQL versionada (billing usa `text` tenant — compatible 021+) |
| 18 | [`018_hub_dashboard.sql`](./018_hub_dashboard.sql) | Vista + materialized view dashboard |
| 19 | [`019_rls_templates_and_cutover_plan.sql`](./019_rls_templates_and_cutover_plan.sql) | RLS plantillas + checklist cutover core |

Verificación: [`scripts/smoke-supabase-phase-c.sql`](../../scripts/smoke-supabase-phase-c.sql)

## Fase C+ — Hub Mi día (027)

| # | Archivo | Prod |
|---|---------|------|
| 27 | [`027_hub_mi_dia.sql`](./027_hub_mi_dia.sql) | ⬜ Tras 016–019 · activa `hub.mi_dia` + widgets |
| 28 | [`028_hub_dashboard_widgets.sql`](./028_hub_dashboard_widgets.sql) | ⬜ Métricas cross-producto para widgets Hub |
| 29 | [`029_hub_product_access.sql`](./029_hub_product_access.sql) | ⬜ Acceso Hub por tenant + super-admin |

## Fase D — Billing + Security Advisor (020–023)

| # | Archivo | Prod |
|---|---------|------|
| 20 | [`020_billing_plan_catalog.sql`](./020_billing_plan_catalog.sql) | Catálogo planes |
| 21 | [`021_billing_tenant_text.sql`](./021_billing_tenant_text.sql) | ✅ tenant_id text |
| 22 | [`022_billing_functions_tenant_text.sql`](./022_billing_functions_tenant_text.sql) | Funciones billing text |
| 23 | [`023_security_advisor_fixes.sql`](./023_security_advisor_fixes.sql) | RLS, search_path, extensiones |
| 24 | [`024_meta_governance.sql`](./024_meta_governance.sql) | meta: schema_versions, migration_history, feature_flags |
| 25 | [`025_knowledge_schema.sql`](./025_knowledge_schema.sql) | Schema `knowledge` — documents, chunks, embeddings, jobs |
| 26 | [`026_knowledge_rls_policies.sql`](./026_knowledge_rls_policies.sql) | RLS deny `knowledge.*` (Security Advisor) |

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

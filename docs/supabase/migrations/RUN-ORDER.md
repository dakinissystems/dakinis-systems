# Orden de ejecución — Supabase SQL Editor

Pega **cada archivo en orden** en el SQL Editor de Supabase (proyecto **Dakinis Production**).

> **Identidad:** `dakinis_auth` (no `auth`). **ERP activo:** `dakinis_core_prod` hasta cutover → `core`.  
> **Convenciones y estado:** [`STATUS.md`](../../STATUS.md)

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
| 15b | [`015b_backfill_akoenet_data.sql`](./015b_backfill_akoenet_data.sql) | ✅ Migración AkoeNet hecha (`STATUS.md` · migr. 034+); guía `MIGRATE-AKOENET.md` eliminada |

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
| 22 | [`022_billing_functions_tenant_text.sql`](./022_billing_functions_tenant_text.sql) | ✅ Funciones billing text |
| 23 | [`023_security_advisor_fixes.sql`](./023_security_advisor_fixes.sql) | ✅ RLS, search_path, extensiones |
| 24 | [`024_meta_governance.sql`](./024_meta_governance.sql) | ✅ meta: schema_versions, migration_history, feature_flags |
| 25 | [`025_knowledge_schema.sql`](./025_knowledge_schema.sql) | Schema `knowledge` — documents, chunks, embeddings, jobs |
| 26 | [`026_knowledge_rls_policies.sql`](./026_knowledge_rls_policies.sql) | RLS deny `knowledge.*` (Security Advisor) |

## Fase D+ — LifeFlow platform links (030)

| # | Archivo | Prod |
|---|---------|------|
| 30 | [`030_lifeflow_app_links.sql`](./030_lifeflow_app_links.sql) | ✅ jul 2026 · Puente SQLite LifeFlow ↔ `dakinis_auth.users` (Hub widgets, score_history) |

Aplicar **después** de schema `lifeflow` activo y backfill de usuarios IdP.

## Fase E — Hub workspace + Super Admin (031)

| # | Archivo | Prod |
|---|---------|------|
| 31 | [`031_workspace_super_admin.sql`](./031_workspace_super_admin.sql) | ✅ jul 2026 · identidad workspace · miembros · audit · flags |

Requiere `024` + `029`. Backfill automático desde `core.tenants` y `hub.tenant_product_access`.  
Provisioning manual: [`scripts/provision_workspace_christiandvillar.sql`](../scripts/provision_workspace_christiandvillar.sql)  
Internal API: `internal/src/services/workspace-admin.js` · `super-admin.js`  
Hub UI: `hub/src/pages/admin/*` → `/admin`

## Fase F — AkoeNet Assistant (032–033)

| # | Archivo | Prod |
|---|---------|------|
| 32 | [`032_akoenet_assistant_modules.sql`](./032_akoenet_assistant_modules.sql) | ✅ jul 2026 · Módulos nativos · automations · moderation logs · assistant usage |
| 33 | [`033_akoenet_assistant_expansion.sql`](./033_akoenet_assistant_expansion.sql) | ✅ jul 2026 · Event log · catálogo ampliado (translator, support, events, levels) |

Requiere schema `akoenet` (006). Packages: `packages/akoenet-orchestrator`, `packages/akoenet-modules` → sync `internal/packages`.  
Cliente: panel Assistant + i18n · Backend: event bridge + proxy. Internal API: `/akoenet/assistant/*`.  
Doc: [`AKOENET-ASSISTANT.md`](../../AKOENET-ASSISTANT.md) · Contrato: [`contracts/akoenet-assistant.json`](../../contracts/akoenet-assistant.json)

## Fase F+ — AkoeNet Gamification (050)

| # | Archivo | Prod |
|---|---------|------|
| 50 | [`050_akoenet_gamification.sql`](./050_akoenet_gamification.sql) | ⬜ · Mirror platform `member_xp` / ledger / reputation / quests · módulo `levels` → mvp |

Awards primarios: **akoenet-backend** (`migrations/1735000000000_gamification.js` + `levels.service.js`). Activar módulo **Niveles** en Assistant.

Requiere schema `akoenet` (006) + Assistant (032–033).

## Fase G — Security Advisor RLS + Media Player (034)

| # | Archivo | Prod |
|---|---------|------|
| 34a | [`034_rls_security_advisor_deny_policies.sql`](./034_rls_security_advisor_deny_policies.sql) | ✅ jul 2026 · Políticas `dakinis_block_anon_authenticated` en tablas con RLS sin policy |
| 34b | [`034_akoenet_media_player.sql`](./034_akoenet_media_player.sql) | ✅ jul 2026 · Schema `media.*` + RLS base (tracks, playlists, listening rooms) |

Re-ejecutable: también [`../006b-rls-policies-missing-tables.sql`](../006b-rls-policies-missing-tables.sql) (mismo patrón, sin registrar versión).

## Fase H — Dakinis Workspace (035–036)

| # | Archivo | Prod |
|---|---------|------|
| 35 | [`035_dakinis_workspace_addons.sql`](./035_dakinis_workspace_addons.sql) | ✅ jul 2026 · Catálogo addons + `meta.workspace_addon_installs` |
| 36 | [`036_dakinis_workspace_capabilities.sql`](./036_dakinis_workspace_capabilities.sql) | ✅ jul 2026 · Tiers, Settings/Monitor/AI Actions, `meta.workspace_desktop_profiles` |

Provisioning platform admin (todos los addons + perfiles Desktop):  
[`scripts/provision_workspace_christiandvillar.sql`](../scripts/provision_workspace_christiandvillar.sql) · paso 8 addons  
[`scripts/provision_workspace_addons_christiandvillar.sql`](../scripts/provision_workspace_addons_christiandvillar.sql)  
[`scripts/seed_workspace_desktop_profiles.sql`](../scripts/seed_workspace_desktop_profiles.sql)  
AkoeNet Assistant (perfil Twitch / admin): [`scripts/provision_akoenet_assistant_christiandvillar.sql`](../scripts/provision_akoenet_assistant_christiandvillar.sql)

Scaffold: [`projects/workspace/`](../../projects/workspace/) · Doc: [`DAKINIS-WORKSPACE.md`](../../DAKINIS-WORKSPACE.md)

## Fase I — StreamAutomator Creator Suite (037)

| # | Archivo | Prod |
|---|---------|------|
| 37 | [`037_streamautomator_creator_suite.sql`](./037_streamautomator_creator_suite.sql) | ✅ jul 2026 · Tablas automation + director (public + stream) + sync triggers |

Requiere schema `stream` (005) y `dakinis_auth.legacy_id_map` (014) para sync UUID.  
Verificación: [`scripts/verify_streamautomator_creator_suite.sql`](../scripts/verify_streamautomator_creator_suite.sql)  
App Sequelize: migración `20260713120000-creator-automation-director.js` (equivalente en `public`).

## Fase J — RLS Security Advisor gaps (038)

| # | Archivo | Prod |
|---|---------|------|
| 038 | `038_rls_security_advisor_gaps.sql` | ✅ jul 2026 · Deny policies en `media.*`, `meta.workspace_*`, `stream.*` Creator, `public` Sequelize |

Corrige **RLS Enabled No Policy** tras 034b/035/036/037. Idempotente; re-ejecutable.  
Verificación: [`scripts/verify_rls_no_policy_gaps.sql`](../scripts/verify_rls_no_policy_gaps.sql)

## Fase K — Director sync resilience (039)

| # | Archivo | Prod |
|---|---------|------|
| 39 | [`039_director_sync_trigger_resilience.sql`](./039_director_sync_trigger_resilience.sql) | ✅ jul 2026 · Evita 500 en `POST /api/director/start` si falla sync a `stream.director_sessions` |

Idempotente. El INSERT en `public."StreamDirectorSessions"` ya no se revierte si el trigger de sync falla.

## Fase L — Workspace addon data + outbox (040–045)

| # | Archivo | Prod |
|---|---------|------|
| 40 | [`040_dakinis_workspace_addon_data.sql`](./040_dakinis_workspace_addon_data.sql) | ✅ jul 2026 · addon data + revision + seeds flags workspace |
| 41 | [`041_outbox_and_revision.sql`](./041_outbox_and_revision.sql) | ✅ jul 2026 · `meta.outbox_events` |
| 42 | [`042_stream_creator_flags.sql`](./042_stream_creator_flags.sql) | ✅ jul 2026 · flags Director/Automation stream |
| 43 | [`043_drop_sync_triggers.sql`](./043_drop_sync_triggers.sql) | ✅ jul 2026 · Drop triggers public→stream (cutover app-level sync) |
| 44 | [`044_bff_billing_flags.sql`](./044_bff_billing_flags.sql) | ✅ jul 2026 · `billing.unified`, `hub.bff_cache` |
| 45 | [`045_billing_sa_product_plans.sql`](./045_billing_sa_product_plans.sql) | ✅ jul 2026 · Planes SA en `billing.plans` |
| 46 | [`046_enable_billing_unified_global.sql`](./046_enable_billing_unified_global.sql) | ✅ jul 2026 · `billing.unified` global ON |
| 47 | [`047_outbox_idempotency_key.sql`](./047_outbox_idempotency_key.sql) | ✅ jul 2026 · Columna `idempotency_key` + unique index en `meta.outbox_events` |
| 48 | [`048_hub_dashboard_automation.sql`](./048_hub_dashboard_automation.sql) | ⬜ Hub automation metrics + `core_low_stock_count` + timeline enriquecido |
| 49 | [`049_stream_automation_runs.sql`](./049_stream_automation_runs.sql) | ✅ 16 jul 2026 · `stream.automation_runs` (mirror; primary SA Sequelize) |

> **Confirmado prod (15 jul 2026):** migraciones **037–047 aplicadas**. Hub **016–029** operativas (`hub.v1_get_dashboard`, `stub=false` en smoke).
>
> **16 jul 2026:** **048/049 aplicadas**; seed score velez=`72`; invite accept + automation runs desplegados (Hub/Internal/SA).

Deploy greenfield: [`scripts/deploy-billing-unified-greenfield.ps1`](../../scripts/deploy-billing-unified-greenfield.ps1)  
Deploy Foundation Fase 2: [`scripts/deploy-foundation-phase2.ps1`](../../scripts/deploy-foundation-phase2.ps1)  
Smoke BFF: [`scripts/smoke-foundation-bff.ps1`](../../scripts/smoke-foundation-bff.ps1)  
Smoke billing: [`scripts/smoke-billing-unified-sa.ps1`](../../scripts/smoke-billing-unified-sa.ps1)

> **Nota:** `039_dakinis_workspace_addon_data.sql` fue renombrado a **040** para evitar colisión con `039_director_sync_trigger_resilience.sql`.

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

- `../schemas/01-dakinis-auth.sql` … `12-tenant-access.sql` — **`12-tenant-access.sql` ✅ prod** (jul 2026)

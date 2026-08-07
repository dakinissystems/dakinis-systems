# Orden de ejecución — Supabase SQL Editor

Pega **cada archivo en orden** en el SQL Editor de Supabase (proyecto **Dakinis Production**).

> **Identidad:** `dakinis_auth` (no `auth`). **ERP activo:** `dakinis_core_prod` hasta cutover → `core`.  
> **Estado operativo:** [`STATUS.md`](../../STATUS.md) — este RUN-ORDER es la checklist SQL, no el score de producto.

Leyenda prod: ✅ aplicado · ⬜ pendiente / confirmar

## Fase A — Estructura (000–013)

| # | Archivo | Qué hace |
|---|---------|----------|
| 0 | [`000_extensions.sql`](./000_extensions.sql) | Extensiones |
| 1–13 | `001` … `013` | Schemas, tablas, RLS lockdown |

## Fase B — Backfill legacy (014–015)

| # | Archivo | Prod |
|---|---------|------|
| 14a | [`014a_auth_nullable_password.sql`](./014a_auth_nullable_password.sql) | Si 014 falla OAuth |
| 14 | [`014_backfill_legacy_map.sql`](./014_backfill_legacy_map.sql) | ✅ |
| 15 | [`015_backfill_stream_data.sql`](./015_backfill_stream_data.sql) | ✅ |
| 15b | [`015b_backfill_akoenet_data.sql`](./015b_backfill_akoenet_data.sql) | ✅ (AkoeNet; ver STATUS) |

## Fase C — Hub / arquitectura (016–019, 027–029)

| # | Archivo | Prod |
|---|---------|------|
| 16–19 | `016` … `019` (+ `016b`) | ✅ Hub Mi día operativo (`stub=false` en smoke) |
| 27–29 | `027` … `029` | ✅ widgets / product access |

Smoke fase C: [`../../../scripts/smoke-supabase-phase-c.sql`](../../../scripts/smoke-supabase-phase-c.sql)

## Fase D — Billing + Knowledge (020–026)

| # | Archivo | Prod |
|---|---------|------|
| 20–24 | `020` … `024` | ✅ billing + meta governance |
| 25–26 | `025` … `026` | ✅ schema `knowledge` + RLS |

## Fase D+ / E — LifeFlow + Workspace (030–031)

| # | Archivo | Prod |
|---|---------|------|
| 30 | [`030_lifeflow_app_links.sql`](./030_lifeflow_app_links.sql) | ✅ |
| 31 | [`031_workspace_super_admin.sql`](./031_workspace_super_admin.sql) | ✅ |

## Fase F — AkoeNet Assistant (032–033)

| # | Archivo | Prod |
|---|---------|------|
| 32–33 | `032` … `033` | ✅ |

Doc: [`AKOENET-ASSISTANT.md`](../../AKOENET-ASSISTANT.md) · contrato [`akoenet-assistant.json`](../../contracts/akoenet-assistant.json)

## Fase F+ — Gamification (050–051)

| # | Archivo | Prod |
|---|---------|------|
| 50–51 | `050` … `051` | ⬜ confirmar en prod |

## Fase F++ / ops Core (055–057)

| # | Archivo | Prod |
|---|---------|------|
| 55 | [`055_core_ai_usage.sql`](./055_core_ai_usage.sql) | ⬜ (`ai_usage` — Sentry si falta) |
| 56 | [`056_dakinis_core_rls_deny_policies.sql`](./056_dakinis_core_rls_deny_policies.sql) | ⬜ confirmar |
| 57 | [`057_tenant_crm_core.sql`](./057_tenant_crm_core.sql) | ⬜ CRM tenant — confirmar prod |

## Fase G–L (034–049) — resumen

| Rango | Tema | Prod |
|-------|------|------|
| 034 | RLS Advisor + media player | ✅ |
| 035–036 | Workspace addons / capabilities | ✅ |
| 037–047 | SA Creator Suite, outbox, billing unified, … | ✅ (confirmado jul 2026) |
| 048–049 | Hub automation metrics / stream automation_runs | ✅ 16 jul 2026 |

Detalle de cada archivo: carpetas `034_*.sql` … `049_*.sql` en este directorio.

Scripts de provision/smoke (monorepo root):

- [`../../../scripts/provision_workspace_christiandvillar.sql`](../../../scripts/provision_workspace_christiandvillar.sql)
- [`../../../scripts/deploy-billing-unified-greenfield.ps1`](../../../scripts/deploy-billing-unified-greenfield.ps1)
- [`../../../scripts/smoke-billing-unified-sa.ps1`](../../../scripts/smoke-billing-unified-sa.ps1)

Workspace scaffold (histórico): [`../../archive/DAKINIS-WORKSPACE.md`](../../archive/DAKINIS-WORKSPACE.md) · código [`../../../projects/workspace/`](../../../projects/workspace/)

## Seeds

| Archivo | Contenido |
|---------|-----------|
| [`../seeds/core.sql`](../seeds/core.sql) | Tenants demo |
| [`../seeds/billing.sql`](../seeds/billing.sql) | Planes |
| [`../seeds/hub.sql`](../seeds/hub.sql) | Widgets |
| [`../seeds/ai.sql`](../seeds/ai.sql) | Agentes + prompts v1 |

## Legacy (no repetir)

- `../schemas/*.sql` — pack histórico; **no** es el camino de migraciones actuales.
- Migraciones ya aplicadas no se reordenan; nuevas van con el siguiente número libre.

# Schemas Supabase — índice

> Ejecutar en **SQL Editor** del proyecto Supabase de Core/Auth (no AkoeNet).  
> Después de `00`→`09`: [`../004-rls-lockdown-all.sql`](../004-rls-lockdown-all.sql) + [`../006b-rls-policies-missing-tables.sql`](../006b-rls-policies-missing-tables.sql).  
> Verificación: [`99-verify-all-tables.sql`](./99-verify-all-tables.sql).

## Orden de ejecución

| # | Archivo | Schema | Tablas |
|---|---------|--------|--------|
| 00 | [`00-bootstrap-schemas.sql`](./00-bootstrap-schemas.sql) | — | `dakinis_auth`, `dakinis_core`, `dakinis_core_dev`, `dakinis_core_prod` |
| 01 | [`01-dakinis-auth.sql`](./01-dakinis-auth.sql) | `dakinis_auth` | `users`, `refresh_tokens` |
| 02 | [`02-dakinis-core-prod.sql`](./02-dakinis-core-prod.sql) | `dakinis_core_prod` | `business`, `tenant_api_keys`, `users`, `tenant_records`, supply, stock, restaurant, `tenant_audit_logs`, `platform_kv` |
| 03 | [`03-whatsapp-messages.sql`](./03-whatsapp-messages.sql) | `dakinis_core_prod` | `tenant_whatsapp_contacts`, `tenant_whatsapp_messages` |
| 04 | [`04-crm-core.sql`](./04-crm-core.sql) | `dakinis_core_prod` | CRM + `tenant_whatsapp_conversations`; FK en `tenant_whatsapp_messages` |
| 05 | [`05-tenant-intelligence.sql`](./05-tenant-intelligence.sql) | `dakinis_core_prod` | `tenant_branches`, `tenant_module_overrides`, `tenant_api_key_webhooks` |
| 06 | [`06-tenant-intelligence-v2.sql`](./06-tenant-intelligence-v2.sql) | `dakinis_core_prod` | deals, goals, finance, KB, `tenant_module_usage`, `tenant_network_links` |
| 07 | [`07-bos-platform.sql`](./07-bos-platform.sql) | `dakinis_core_prod` | subscriptions, invoices, usage, IA, portal, automation, network orders, KB chunks |
| 08 | [`08-telemetry.sql`](./08-telemetry.sql) | `dakinis_core_prod` | `tenant_feature_usage` |
| 09 | [`09-feature-events.sql`](./09-feature-events.sql) | `dakinis_core_prod` | `tenant_feature_events` |
| 10 | [`10-user-credentials.sql`](./10-user-credentials.sql) | `dakinis_core_prod` | columnas `users`: reset, `must_change_password`, `confirmed_at` |
| 11 | [`11-inventory-lots.sql`](./11-inventory-lots.sql) | `dakinis_core_prod` | `tenant_stock_locations`, `tenant_stock_lots`; columnas `tenant_stock_movements.lot_id`, `tenant_stock_items.barcode` |
| 99 | [`99-verify-all-tables.sql`](./99-verify-all-tables.sql) | — | Diagnóstico (solo lectura) |

## Tablas `dakinis_core_prod` (39)

| Script | Tablas |
|--------|--------|
| 02 | `business`, `tenant_api_keys`, `users`, `tenant_records`, `tenant_supply_deliveries`, `tenant_supply_alerts`, `tenant_stock_items`, `tenant_recipes`, `tenant_production_batches`, `tenant_stock_movements`, `tenant_restaurant_profile`, `tenant_audit_logs`, `platform_kv` |
| 03 | `tenant_whatsapp_contacts`, `tenant_whatsapp_messages` |
| 04 | `tenant_crm_companies`, `tenant_crm_contacts`, `tenant_crm_activities`, `tenant_whatsapp_conversations` |
| 05 | `tenant_branches`, `tenant_module_overrides`, `tenant_api_key_webhooks` |
| 06 | `tenant_crm_deals`, `tenant_goals`, `tenant_finance_entries`, `tenant_knowledge_docs`, `tenant_module_usage`, `tenant_network_links` |
| 07 | `tenant_subscriptions`, `tenant_invoices`, `tenant_usage`, `tenant_ai_usage_log`, `tenant_pending_actions`, `tenant_automation_rules`, `tenant_network_orders`, `tenant_portal_settings`, `tenant_knowledge_chunks` |
| 08 | `tenant_feature_usage` |
| 09 | `tenant_feature_events` |
| 11 | `tenant_stock_locations`, `tenant_stock_lots` |

## Cobertura vs Core API

Auditoría contra `platform/core/api/src` (mayo 2026): **todas las tablas referenciadas en código tienen DDL en `02`–`09`.**

| Tabla | Uso en código | Script |
|-------|---------------|--------|
| `tenant_invoices` | Preparada (Stripe 🔜) | 07 |
| `tenant_api_key_webhooks` | Preparada (webhooks tenant) | 05 |

`tenant_api_keys.key_value` almacena hash bcrypt o valor legado en claro — no requiere migración DDL adicional.

## Staging

Copiar `02-dakinis-core-prod.sql` reemplazando `dakinis_core_prod` → `dakinis_core_dev`. No hace falta otro archivo en repo.

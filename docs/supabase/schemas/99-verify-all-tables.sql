-- Verificación post-migración (solo lectura)
-- Ejecutar tras 00 → 09 (+ 004 + 006b). Debe devolver 0 filas en "FALTAN".

WITH expected AS (
  SELECT * FROM (VALUES
    ('dakinis_auth', 'users'),
    ('dakinis_auth', 'refresh_tokens'),
    ('dakinis_core_prod', 'business'),
    ('dakinis_core_prod', 'tenant_api_keys'),
    ('dakinis_core_prod', 'users'),
    ('dakinis_core_prod', 'tenant_records'),
    ('dakinis_core_prod', 'tenant_supply_deliveries'),
    ('dakinis_core_prod', 'tenant_supply_alerts'),
    ('dakinis_core_prod', 'tenant_stock_items'),
    ('dakinis_core_prod', 'tenant_recipes'),
    ('dakinis_core_prod', 'tenant_production_batches'),
    ('dakinis_core_prod', 'tenant_stock_movements'),
    ('dakinis_core_prod', 'tenant_restaurant_profile'),
    ('dakinis_core_prod', 'tenant_audit_logs'),
    ('dakinis_core_prod', 'platform_kv'),
    ('dakinis_core_prod', 'tenant_whatsapp_contacts'),
    ('dakinis_core_prod', 'tenant_whatsapp_messages'),
    ('dakinis_core_prod', 'tenant_crm_companies'),
    ('dakinis_core_prod', 'tenant_crm_contacts'),
    ('dakinis_core_prod', 'tenant_crm_activities'),
    ('dakinis_core_prod', 'tenant_whatsapp_conversations'),
    ('dakinis_core_prod', 'tenant_branches'),
    ('dakinis_core_prod', 'tenant_module_overrides'),
    ('dakinis_core_prod', 'tenant_api_key_webhooks'),
    ('dakinis_core_prod', 'tenant_crm_deals'),
    ('dakinis_core_prod', 'tenant_goals'),
    ('dakinis_core_prod', 'tenant_finance_entries'),
    ('dakinis_core_prod', 'tenant_knowledge_docs'),
    ('dakinis_core_prod', 'tenant_module_usage'),
    ('dakinis_core_prod', 'tenant_network_links'),
    ('dakinis_core_prod', 'tenant_subscriptions'),
    ('dakinis_core_prod', 'tenant_invoices'),
    ('dakinis_core_prod', 'tenant_usage'),
    ('dakinis_core_prod', 'tenant_ai_usage_log'),
    ('dakinis_core_prod', 'tenant_pending_actions'),
    ('dakinis_core_prod', 'tenant_automation_rules'),
    ('dakinis_core_prod', 'tenant_network_orders'),
    ('dakinis_core_prod', 'tenant_portal_settings'),
    ('dakinis_core_prod', 'tenant_knowledge_chunks'),
    ('dakinis_core_prod', 'tenant_feature_usage'),
    ('dakinis_core_prod', 'tenant_feature_events')
  ) AS t(schema_name, table_name)
),
present AS (
  SELECT table_schema AS schema_name, table_name
  FROM information_schema.tables
  WHERE table_schema IN ('dakinis_auth', 'dakinis_core_prod')
    AND table_type = 'BASE TABLE'
)
SELECT e.schema_name, e.table_name, 'FALTA' AS status
FROM expected e
LEFT JOIN present p
  ON p.schema_name = e.schema_name AND p.table_name = e.table_name
WHERE p.table_name IS NULL
ORDER BY 1, 2;

-- Columnas CRM en tenant_whatsapp_messages (script 04)
SELECT
  column_name,
  CASE WHEN column_name IS NOT NULL THEN 'OK' ELSE 'FALTA' END AS status
FROM information_schema.columns
WHERE table_schema = 'dakinis_core_prod'
  AND table_name = 'tenant_whatsapp_messages'
  AND column_name IN ('contact_id', 'conversation_id')
ORDER BY column_name;

-- RLS sin política (debe ser 0 tras 006b)
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN ('dakinis_auth', 'dakinis_core_prod')
  AND NOT EXISTS (
    SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid
  )
ORDER BY 1, 2;

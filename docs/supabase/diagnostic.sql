-- Supabase — diagnóstico (solo lectura, SQL Editor)
-- Tablas Core + auditoría RLS básica

-- ── Core: tablas tenant (prod) ──
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name IN (
  'business',
  'users',
  'tenant_records',
  'tenant_supply_alerts',
  'tenant_supply_deliveries',
  'tenant_stock_items',
  'tenant_restaurant_profile'
)
  AND table_schema IN ('dakinis_core_prod', 'dakinis_core', 'dakinis_core_dev', 'public')
ORDER BY 1, 2;

SELECT to_regclass('dakinis_core_prod.business') AS business_tbl,
       to_regclass('dakinis_core_prod.tenant_supply_alerts') AS alerts_tbl,
       to_regclass('dakinis_core_prod.tenant_supply_deliveries') AS deliveries_tbl,
       to_regclass('dakinis_core_prod.tenant_restaurant_profile') AS kitchen_profile_tbl;

-- ── RLS desactivado (Security Advisor) ──
SELECT t.schemaname, t.tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE c.relkind = 'r'
  AND NOT c.relrowsecurity
  AND t.schemaname IN ('public', 'dakinis_auth', 'dakinis_core_prod', 'storage')
ORDER BY 1, 2;

-- Smoke Phase C (016–019) — pegar en Supabase SQL Editor tras ejecutar migraciones.
-- Esperado: todas las filas con ok = true.

SELECT '016 meta.function_versions' AS check_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'meta' AND table_name = 'function_versions') AS ok;

SELECT '016 ai.prompt_versions' AS check_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'ai' AND table_name = 'prompt_versions') AS ok;

SELECT '016 hub.dashboard_preferences' AS check_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hub' AND table_name = 'dashboard_preferences') AS ok;

SELECT '016 hub.recent_items' AS check_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hub' AND table_name = 'recent_items') AS ok;

SELECT '017 hub.v1_get_dashboard' AS check_name,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'hub' AND p.proname = 'v1_get_dashboard'
       ) AS ok;

SELECT '018 hub.dashboard view' AS check_name,
       EXISTS (
         SELECT 1 FROM information_schema.views
         WHERE table_schema = 'hub' AND table_name = 'dashboard'
       ) AS ok;

SELECT '018 hub.dashboard_stats mv' AS check_name,
       EXISTS (
         SELECT 1 FROM pg_matviews
         WHERE schemaname = 'hub' AND matviewname = 'dashboard_stats'
       ) AS ok;

SELECT '019 meta.cutover_core_checklist' AS check_name,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'meta' AND p.proname = 'cutover_core_checklist'
       ) AS ok;

SELECT '027 hub.mi_dia flag' AS check_name,
       EXISTS (
         SELECT 1 FROM meta.feature_flags
         WHERE flag_key = 'hub.mi_dia'
       ) AS ok;

SELECT '029 hub.v1_get_user_hub_products' AS check_name,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'hub' AND p.proname = 'v1_get_user_hub_products'
       ) AS ok;

SELECT '048 stream_automation in dashboard' AS check_name,
       (
         SELECT (hub.v1_get_dashboard(
           (SELECT id FROM dakinis_auth.users ORDER BY created_at LIMIT 1)
         )->>'stream_automation_total') IS NOT NULL
       ) AS ok;

-- Dashboard sample (reemplaza UUID por un user real de dakinis_auth.users)
-- SELECT hub.v1_get_dashboard('00000000-0000-0000-0000-000000000001'::uuid);

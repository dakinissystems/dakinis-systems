-- Verificación post-migración 037 — StreamAutomator Creator Suite
-- Ejecutar en Supabase SQL Editor tras 037_streamautomator_creator_suite.sql

-- 1) Tablas public (Sequelize)
SELECT
  'public.AutomationRules' AS check_name,
  CASE WHEN to_regclass('public."AutomationRules"') IS NOT NULL THEN 'ok' ELSE 'missing' END AS status
UNION ALL
SELECT
  'public.StreamDirectorSessions',
  CASE WHEN to_regclass('public."StreamDirectorSessions"') IS NOT NULL THEN 'ok' ELSE 'missing' END
UNION ALL
SELECT
  'stream.automation_rules',
  CASE WHEN to_regclass('stream.automation_rules') IS NOT NULL THEN 'ok' ELSE 'missing' END
UNION ALL
SELECT
  'stream.director_sessions',
  CASE WHEN to_regclass('stream.director_sessions') IS NOT NULL THEN 'ok' ELSE 'missing' END;

-- 2) Índices clave
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname IN ('public', 'stream')
  AND (
    indexname LIKE '%automation%'
    OR indexname LIKE '%director%'
  )
ORDER BY 1;

-- 3) Triggers sync
SELECT tgname, relname AS table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND (tgname LIKE 'trg_sync_%automation%' OR tgname LIKE 'trg_sync_%director%')
ORDER BY 1;

-- 4) RLS activo
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE (n.nspname, c.relname) IN (
  ('public', 'AutomationRules'),
  ('public', 'StreamDirectorSessions'),
  ('stream', 'automation_rules'),
  ('stream', 'director_sessions')
)
ORDER BY 1, 2;

-- 5) Migración registrada
SELECT migration_file, success, applied_at, notes
FROM meta.migration_history
WHERE migration_file = '037_streamautomator_creator_suite.sql';

-- 6) Smoke insert (rollback) — opcional: descomentar para probar en staging
/*
BEGIN;
INSERT INTO public."AutomationRules" ("userId", name, "triggerType", actions)
SELECT id, 'Test rule', 'stream.started', '[]'::jsonb
FROM public."Users"
LIMIT 1;
SELECT count(*) AS stream_mirror FROM stream.automation_rules WHERE name = 'Test rule';
ROLLBACK;
*/

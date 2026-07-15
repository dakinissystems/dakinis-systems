-- Verificación RLS — tablas con RLS activo pero sin ninguna política
-- Objetivo: 0 filas. Ejecutar tras 038_rls_security_advisor_gaps.sql

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN (
    'public', 'stream', 'meta', 'media', 'akoenet', 'hub', 'core', 'billing'
  )
  AND NOT EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid)
ORDER BY 1, 2;

-- Políticas dakinis_block en tablas objetivo (debe tener al menos 1 fila por tabla)
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE policyname = 'dakinis_block_anon_authenticated'
  AND schemaname IN ('media', 'meta', 'stream', 'public')
ORDER BY 1, 2;

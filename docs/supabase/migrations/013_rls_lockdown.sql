-- 013 — RLS lockdown en todos los schemas de producto
-- Ejecutar tras 002–012. Apps Railway usan postgres pooler, no anon key.

DO $$
DECLARE
  r RECORD;
  schemas text[] := ARRAY[
    'public',
    'dakinis_auth',
    'dakinis_core_prod',
    'dakinis_core_dev',
    'core',
    'billing',
    'stream',
    'akoenet',
    'lifeflow',
    'ai',
    'hub',
    'audit',
    'meta'
  ];
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = ANY (schemas)
      AND NOT c.relispartition
    ORDER BY 1, 2
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schema_name, r.table_name);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', r.schema_name, r.table_name);
    RAISE NOTICE 'RLS: %.%', r.schema_name, r.table_name;
  END LOOP;
END $$;

DO $$
DECLARE
  s text;
  schemas text[] := ARRAY[
    'public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev',
    'core', 'billing', 'stream', 'akoenet', 'lifeflow', 'ai', 'hub', 'audit', 'meta'
  ];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo REVOKE.';
    RETURN;
  END IF;

  FOREACH s IN ARRAY schemas
  LOOP
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = s) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM anon, authenticated', s);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM anon, authenticated', s);
    END IF;
  END LOOP;
END $$;

-- Verificación: debe devolver 0 filas con rls_enabled = false
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN (
    'dakinis_auth', 'core', 'billing', 'stream', 'akoenet',
    'lifeflow', 'ai', 'hub', 'audit', 'dakinis_core_prod', 'meta'
  )
  AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)
ORDER BY 1, 2;

-- 034 — RLS Security Advisor: políticas deny en tablas sin policy
-- Ejecutar en Supabase SQL Editor (prod). Idempotente.
--
-- Corrige: "RLS Enabled No Policy" en legacy_akoenet.*, meta.* (031),
-- akoenet.assistant_events (033) y cualquier tabla nueva con RLS sin política.
--
-- Modelo Dakinis: apps Railway usan postgres (pooler :6543), NO PostgREST anon.
-- Política dakinis_block_anon_authenticated: deny total a anon + authenticated.
-- Tablas que ya tienen políticas (p. ej. meta.workspaces) no se tocan.

-- ---------------------------------------------------------------------------
-- 1) Revocar PostgREST en legacy_akoenet (staging archivo)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'legacy_akoenet') THEN
    RAISE NOTICE 'Schema legacy_akoenet no existe; omitiendo REVOKE.';
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo REVOKE.';
    RETURN;
  END IF;
  REVOKE ALL ON ALL TABLES IN SCHEMA legacy_akoenet FROM anon, authenticated;
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA legacy_akoenet FROM anon, authenticated;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Políticas deny solo donde RLS activo y cero políticas
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
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
    'meta',
    'knowledge',
    'legacy_akoenet'
  ];
  created int := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo políticas.';
    RETURN;
  END IF;

  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = ANY (schemas)
      AND c.relrowsecurity
      AND NOT c.relispartition
      AND NOT EXISTS (
        SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid
      )
    ORDER BY 1, 2
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      pol_name, r.schema_name, r.table_name
    );
    EXECUTE format(
      $p$
      CREATE POLICY %I ON %I.%I
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
      $p$,
      pol_name,
      r.schema_name,
      r.table_name
    );
    created := created + 1;
    RAISE NOTICE 'Policy % on %.%', pol_name, r.schema_name, r.table_name;
  END LOOP;

  RAISE NOTICE 'Políticas creadas: %', created;
END $$;

-- ---------------------------------------------------------------------------
-- 3) Verificación (objetivo: 0 filas)
-- ---------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN (
    'public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev',
    'core', 'billing', 'stream', 'akoenet', 'lifeflow', 'ai', 'hub',
    'audit', 'meta', 'knowledge', 'legacy_akoenet'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid
  )
ORDER BY 1, 2;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('platform', 34, 'RLS deny policies — Security Advisor gaps', '034_rls_security_advisor_deny_policies.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 34),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

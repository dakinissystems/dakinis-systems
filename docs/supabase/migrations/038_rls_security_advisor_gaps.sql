-- 038 — RLS Security Advisor: políticas deny en tablas sin policy (media, meta, stream, public)
-- Ejecutar en Supabase SQL Editor (prod). Idempotente.
--
-- Corrige "RLS Enabled No Policy" tras 034b (media), 035–036 (workspace), 037 (Creator Suite).
-- Modelo Dakinis: apps Railway / Internal API usan rol postgres (pooler), NO PostgREST anon.
-- Política dakinis_block_anon_authenticated → deny total a anon + authenticated.

-- ---------------------------------------------------------------------------
-- 1) REVOKE PostgREST en schema media (nuevo en 034b)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'media') THEN
    RAISE NOTICE 'Schema media no existe; omitiendo REVOKE.';
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo REVOKE.';
    RETURN;
  END IF;
  REVOKE ALL ON ALL TABLES IN SCHEMA media FROM anon, authenticated;
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA media FROM anon, authenticated;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Políticas deny — barrido automático (incluye media)
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
    'media',
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
      AND NOT EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid)
    ORDER BY 1, 2
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_name, r.schema_name, r.table_name);
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

  RAISE NOTICE 'Políticas creadas (barrido): %', created;
END $$;

-- ---------------------------------------------------------------------------
-- 3) Explícito — tablas public con nombre PascalCase (Sequelize / 037)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol_name text := 'dakinis_block_anon_authenticated';
  tbl text;
  tables text[] := ARRAY['AutomationRules', 'StreamDirectorSessions'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RETURN;
  END IF;

  FOREACH tbl IN ARRAY tables
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, tbl);
    EXECUTE format(
      $p$
      CREATE POLICY %I ON public.%I
        FOR ALL TO anon, authenticated
        USING (false) WITH CHECK (false)
      $p$,
      pol_name, tbl
    );
    RAISE NOTICE 'Policy % on public.%', pol_name, tbl;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4) Verificación Security Advisor (objetivo: 0 filas)
-- ---------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  'RLS Enabled No Policy' AS issue
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN (
    'public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev',
    'core', 'billing', 'stream', 'akoenet', 'lifeflow', 'ai', 'hub',
    'audit', 'meta', 'knowledge', 'media', 'legacy_akoenet'
  )
  AND NOT EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid)
ORDER BY 1, 2;

-- ---------------------------------------------------------------------------
-- 5) Auditoría meta
-- ---------------------------------------------------------------------------
INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES ('038_rls_security_advisor_gaps.sql', true, 'RLS deny policies — media, meta, stream gaps')
ON CONFLICT (migration_file) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('platform', 38, 'RLS deny policies — media + workspace + stream gaps', '038_rls_security_advisor_gaps.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 38),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

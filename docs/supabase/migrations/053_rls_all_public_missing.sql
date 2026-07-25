-- 053 — RLS on ALL public tables missing it (Security Advisor: rls_disabled_in_public)
-- Ejecutar ENTERO en Supabase SQL Editor → proyecto dakinis-platform.
-- Idempotente. Backend Railway (postgres / bypassrls) no se ve afectado.
--
-- Modelo: PostgREST (anon/authenticated) → deny total.
-- Apps de producto usan connection string de servidor, no la anon key del browser.

DO $$
DECLARE
  pol_name text := 'dakinis_block_anon_authenticated';
  r RECORD;
  n int := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; nada que hacer.';
    RETURN;
  END IF;

  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace nsp ON nsp.oid = c.relnamespace
    WHERE nsp.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relispartition
      AND c.relname NOT LIKE 'pg_%'
      AND NOT c.relrowsecurity
    ORDER BY 1
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, r.table_name);
    EXECUTE format(
      $p$
      CREATE POLICY %I ON public.%I
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
      $p$,
      pol_name,
      r.table_name
    );
    n := n + 1;
    RAISE NOTICE 'RLS+deny on public.%', r.table_name;
  END LOOP;

  RAISE NOTICE 'Tablas public sin RLS corregidas: %', n;
END $$;

-- También: tablas public con RLS ON pero CERO policies (Advisor: rls_enabled_no_policy)
DO $$
DECLARE
  pol_name text := 'dakinis_block_anon_authenticated';
  r RECORD;
  n int := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace nsp ON nsp.oid = c.relnamespace
    WHERE nsp.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relispartition
      AND c.relrowsecurity
      AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid)
    ORDER BY 1
  LOOP
    EXECUTE format(
      $p$
      CREATE POLICY %I ON public.%I
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
      $p$,
      pol_name,
      r.table_name
    );
    n := n + 1;
    RAISE NOTICE 'deny policy on public.% (RLS was on, no policy)', r.table_name;
  END LOOP;

  RAISE NOTICE 'Policies deny añadidas (sin policy previa): %', n;
END $$;

-- Auto-enable RLS on future public tables created via SQL
CREATE OR REPLACE FUNCTION meta.trg_enable_rls_on_public_tables()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  cmd record;
  pol text := 'dakinis_block_anon_authenticated';
BEGIN
  FOR cmd IN
    SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS')
  LOOP
    IF cmd.schema_name = 'public' AND cmd.object_type = 'table' THEN
      BEGIN
        EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
        EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', cmd.object_identity);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %s', pol, cmd.object_identity);
        EXECUTE format(
          'CREATE POLICY %I ON %s FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
          pol,
          cmd.object_identity
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'trg_enable_rls: skip % (%)', cmd.object_identity, SQLERRM;
      END;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION meta.trg_enable_rls_on_public_tables() FROM PUBLIC;
REVOKE ALL ON FUNCTION meta.trg_enable_rls_on_public_tables() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION meta.trg_enable_rls_on_public_tables() TO postgres;

DROP EVENT TRIGGER IF EXISTS dakinis_rls_auto_enable_public;
CREATE EVENT TRIGGER dakinis_rls_auto_enable_public
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS')
  EXECUTE FUNCTION meta.trg_enable_rls_on_public_tables();

-- Verificación Advisor: debe devolver 0 filas
SELECT c.relname AS table_without_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relispartition
  AND NOT c.relrowsecurity
ORDER BY 1;

INSERT INTO meta.migration_history (migration_file, notes)
VALUES (
  '053_rls_all_public_missing.sql',
  'Enable RLS+deny on every public table missing it; event trigger for new public tables'
)
ON CONFLICT (migration_file) DO NOTHING;

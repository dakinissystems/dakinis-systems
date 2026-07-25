-- 054 — Lock down SECURITY DEFINER helpers (Advisor: security_definer_search_path / callable)
-- Corrige: public.rls_auto_enable() ejecutable por anon + authenticated.
-- Ejecutar ENTERO en SQL Editor. Idempotente.

-- 1) Revoke + drop legacy public helper (Supabase docs sample name)
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
    -- Event trigger must not depend on a publicly callable function.
    DROP FUNCTION public.rls_auto_enable();
    RAISE NOTICE 'Dropped public.rls_auto_enable()';
  END IF;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    -- Detach event triggers that point at it, then drop.
    RAISE NOTICE 'public.rls_auto_enable() has dependents; dropping event triggers first';
END $$;

-- Drop any event trigger still wired to the public helper
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT evtname
    FROM pg_event_trigger
    WHERE evtfoid = to_regprocedure('public.rls_auto_enable()')
  LOOP
    EXECUTE format('DROP EVENT TRIGGER IF EXISTS %I', r.evtname);
  END LOOP;
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    DROP FUNCTION public.rls_auto_enable();
  END IF;
END $$;

-- 2) Ensure locked-down meta helper + event trigger (from 053)
CREATE SCHEMA IF NOT EXISTS meta;

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

-- 3) Verificación: no debe quedar rls_auto_enable en public
SELECT n.nspname AS schema, p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'rls_auto_enable'
ORDER BY 1, 2;

INSERT INTO meta.migration_history (migration_file, notes)
VALUES (
  '054_lockdown_rls_auto_enable.sql',
  'Drop/revoke public.rls_auto_enable; keep SECURITY DEFINER helper only in meta with EXECUTE revoked from anon/authenticated'
)
ON CONFLICT (migration_file) DO NOTHING;

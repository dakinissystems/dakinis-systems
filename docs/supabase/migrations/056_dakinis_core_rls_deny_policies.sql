-- 056_dakinis_core_rls_deny_policies.sql
-- Security Advisor: "RLS Enabled No Policy" on dakinis_core (+ prod/dev twins).
--
-- Modelo Dakinis: Core API usa DATABASE_URL / pooler (rol con bypass o postgres),
-- NO supabase-js anon contra dakinis_core. Políticas deny-all para anon/authenticated
-- cierran PostgREST y satisfacen el linter sin romper la API Railway.
--
-- Ejecutar ENTERO en SQL Editor. Idempotente.

DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
  schemas text[] := ARRAY['dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev'];
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
      AND NOT c.relispartition
    ORDER BY 1, 2
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schema_name,
      r.table_name
    );
    -- FORCE: incluso table owner vía PostgREST queda sujeto a RLS
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',
        r.schema_name,
        r.table_name
      );
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'FORCE RLS skip %.% (privilegio)', r.schema_name, r.table_name;
    END;

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      pol_name,
      r.schema_name,
      r.table_name
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
    RAISE NOTICE 'Policy % on %.%', pol_name, r.schema_name, r.table_name;
  END LOOP;
END $$;

-- Verificación: debe devolver 0 filas
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN ('dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev')
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    WHERE p.polrelid = c.oid
  )
ORDER BY 1, 2;

DO $$
BEGIN
  IF to_regclass('meta.migration_history') IS NOT NULL THEN
    INSERT INTO meta.migration_history (migration_file, notes)
    VALUES (
      '056_dakinis_core_rls_deny_policies.sql',
      'Deny-all anon/authenticated on dakinis_core(+prod/dev) — fix Advisor RLS Enabled No Policy'
    )
    ON CONFLICT (migration_file) DO NOTHING;
  END IF;
END $$;

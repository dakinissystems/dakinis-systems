-- RLS "Enabled No Policy" — políticas explícitas de DENEGACIÓN para API pública
-- Ejecutar DESPUÉS de 004-rls-lockdown-all.sql
--
-- Modelo Dakinis: Auth/Core/AkoeNet usan Railway + URI postgres (pooler :6543).
-- NO usan supabase-js con anon key contra dakinis_*.
-- Estas políticas cierran PostgREST (anon/authenticated) y satisfacen el Security Advisor.
-- El rol postgres (superuser en Supabase) sigue accediendo vía pooler sin estas políticas.

-- ---------------------------------------------------------------------------
-- Política estándar por tabla: bloqueo total a anon + authenticated
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
  schemas text[] := ARRAY[
    'public',
    'dakinis_auth',
    'dakinis_core_prod',
    'dakinis_core_dev'
  ];
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
    ORDER BY 1, 2
  LOOP
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

-- ---------------------------------------------------------------------------
-- Verificación: tablas con RLS pero SIN ninguna política (objetivo: 0 filas)
-- ---------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN ('public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev')
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policy pol
    WHERE pol.polrelid = c.oid
  )
ORDER BY 1, 2;

-- Resumen de políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE policyname = 'dakinis_block_anon_authenticated'
ORDER BY 1, 2;

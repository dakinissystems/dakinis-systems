-- 023 — Security Advisor fixes (Supabase prod)
-- Resuelve: RLS disabled, RLS no policy, function search_path mutable, extensions in public
-- Ejecutar después de 022 (o en cualquier momento; idempotente).

-- ---------------------------------------------------------------------------
-- 1) Extensiones: mover vector y pg_trgm fuera de public
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;

GRANT USAGE ON SCHEMA extensions TO postgres;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE 'ALTER EXTENSION vector SET SCHEMA extensions';
    RAISE NOTICE 'vector → extensions';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    EXECUTE 'ALTER EXTENSION pg_trgm SET SCHEMA extensions';
    RAISE NOTICE 'pg_trgm → extensions';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Function search_path mutable
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dakinis_auth._safe_uuid_from_text(p text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path = dakinis_auth, extensions, pg_catalog, pg_temp
AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN gen_random_uuid();
  END IF;
  IF p ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RETURN p::uuid;
  END IF;
  RETURN gen_random_uuid();
END;
$$;

CREATE OR REPLACE FUNCTION meta.cutover_core_checklist()
RETURNS TABLE (step integer, action text, done boolean)
LANGUAGE sql
STABLE
SET search_path = meta, pg_catalog, pg_temp
AS $$
  SELECT * FROM (VALUES
    (1, 'Dual-read Core API: dakinis_core_prod.business + core.tenants', false),
    (2, 'Backfill business.id → core.tenants.legacy_business_id', false),
    (3, 'Dual-write tenant_records / CRM', false),
    (4, 'Switch POSTGRES_SCHEMA=core en Railway Core Back', false),
    (5, 'Monitorizar 48h', false),
    (6, 'CREATE VIEW dakinis_core_prod.business AS SELECT ... FROM core.* (compat)', false),
    (7, 'DROP SCHEMA dakinis_core_prod CASCADE', false)
  ) AS t(step, action, done);
$$;

-- Cualquier otra función en schemas de producto sin search_path fijado
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS func_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN (
      'public', 'dakinis_auth', 'meta', 'core', 'billing', 'stream',
      'akoenet', 'lifeflow', 'ai', 'hub', 'audit'
    )
      AND p.prokind IN ('f', 'p')
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = %I, pg_catalog, pg_temp',
        fn.schema_name,
        fn.func_name,
        fn.args,
        fn.schema_name
      );
      RAISE NOTICE 'search_path fijado: %.%(%)', fn.schema_name, fn.func_name, fn.args;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'No se pudo alterar %.%(%): %', fn.schema_name, fn.func_name, fn.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3) RLS: public.password_reset_tokens (legacy; PostgREST expone public)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.password_reset_tokens') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.password_reset_tokens FORCE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS habilitado: public.password_reset_tokens';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) Políticas deny anon/authenticated — todos los schemas con RLS (incl. ai.*)
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
    'audit'
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
-- Verificación (objetivo: 0 filas en cada SELECT)
-- ---------------------------------------------------------------------------

-- Tablas con RLS sin política
SELECT n.nspname AS schema_name, c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN (
    'public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev',
    'core', 'billing', 'stream', 'akoenet', 'lifeflow', 'ai', 'hub', 'audit'
  )
  AND NOT EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid)
ORDER BY 1, 2;

-- Tablas en public sin RLS (PostgREST)
SELECT n.nspname, c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND NOT c.relrowsecurity
  AND c.relname NOT LIKE 'pg_%'
ORDER BY 2;

-- Extensiones aún en public
SELECT e.extname, n.nspname AS schema_name
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE n.nspname = 'public'
  AND e.extname IN ('vector', 'pg_trgm')
ORDER BY 1;

-- Funciones sin search_path en schemas sensibles
SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('dakinis_auth', 'meta', 'public')
  AND p.prokind IN ('f', 'p')
  AND NOT EXISTS (
    SELECT 1 FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg
    WHERE cfg LIKE 'search_path=%'
  )
ORDER BY 1, 2;

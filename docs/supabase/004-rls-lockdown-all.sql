-- Dakinis Platform (Supabase) — RLS en TODAS las tablas expuestas a PostgREST
-- Ejecutar UNA VEZ en SQL Editor después de 00 → 01 → 02.
-- Corrige advisor: "RLS Disabled in Public" (p. ej. public.server_members).
--
-- Tus apps (Railway) conectan con postgres + pooler :6543 → no usan anon key para datos.
-- Esto bloquea lectura/escritura vía API Supabase (anon/authenticated).
-- Después ejecuta 006-rls-policies-deny-api.sql para políticas explícitas (advisor "No Policy").

-- ---------------------------------------------------------------------------
-- 1) Habilitar RLS + FORCE en schemas de producto
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  schemas text[] := ARRAY[
    'public',
    'dakinis_auth',
    'dakinis_core_prod',
    'dakinis_core_dev'
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
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schema_name,
      r.table_name
    );
    EXECUTE format(
      'ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',
      r.schema_name,
      r.table_name
    );
    RAISE NOTICE 'RLS: %.%', r.schema_name, r.table_name;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Revocar acceso PostgREST (anon / authenticated) — deny by default
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo REVOKE.';
    RETURN;
  END IF;

  REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

  REVOKE ALL ON ALL TABLES IN SCHEMA dakinis_auth FROM anon, authenticated;
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA dakinis_auth FROM anon, authenticated;

  REVOKE ALL ON ALL TABLES IN SCHEMA dakinis_core_prod FROM anon, authenticated;
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA dakinis_core_prod FROM anon, authenticated;

  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'dakinis_core_dev') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA dakinis_core_dev FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA dakinis_core_dev FROM anon, authenticated;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3) Verificación (debe devolver 0 filas en "sin RLS")
-- ---------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN ('public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev')
  AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)
ORDER BY 1, 2;

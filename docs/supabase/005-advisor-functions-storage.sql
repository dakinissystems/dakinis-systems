-- Supabase Security Advisor — funciones + storage
-- Ejecutar en SQL Editor después de 004-rls-lockdown-all.sql
-- Revisa NOTICE/WARNING; ajusta nombres de políticas si difieren en tu proyecto.

-- =============================================================================
-- 1) Function search_path mutable (p. ej. public.set_updated_at)
-- =============================================================================
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
    WHERE n.nspname = 'public'
      AND p.proname IN ('set_updated_at', 'handle_updated_at', 'update_updated_at_column')
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
      fn.schema_name,
      fn.func_name,
      fn.args
    );
    RAISE NOTICE 'search_path fijado: %.%(%)', fn.schema_name, fn.func_name, fn.args;
  END LOOP;
END $$;

-- Cualquier otra función en public sin search_path (advisor genérico)
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
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
        fn.schema_name,
        fn.func_name,
        fn.args
      );
      RAISE NOTICE 'search_path fijado (genérico): %.%(%)', fn.schema_name, fn.func_name, fn.args;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'No se pudo alterar %.%(%): %', fn.schema_name, fn.func_name, fn.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Verificación: funciones public sin search_path (idealmente 0 filas)
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  p.proconfig
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND NOT EXISTS (
    SELECT 1
    FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg
    WHERE cfg LIKE 'search_path=%'
  )
ORDER BY 2, 3;

-- =============================================================================
-- 2) Storage: bucket "images" — evitar listado público de todos los objetos
-- =============================================================================
-- El advisor se queja de políticas SELECT amplias en storage.objects.
-- Opción recomendada si el backend sube con service key: bucket PRIVADO + signed URLs.

UPDATE storage.buckets
SET public = false
WHERE id = 'images';

-- Elimina políticas de lectura/listado público amplias (nombres pueden variar)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        policyname ILIKE '%images%'
        OR policyname ILIKE '%public%read%'
        OR policyname = 'Public read images 1ffg0oo_0'
      )
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Política eliminada: %', pol.policyname;
  END LOOP;
END $$;

-- Acceso solo vía backend (service_role) o signed URLs generadas en API.
-- Si necesitas lectura anónima por URL directa SIN listado, deja public=true y NO
-- recrees políticas SELECT globales; usa signed URLs desde akoenet-backend.

-- Políticas mínimas para uploads autenticados (ajusta si usas Supabase Auth en front;
-- con dakinis-auth + API Node suele bastar service_role en servidor):
-- CREATE POLICY "service_upload_images"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'images');

-- Ver buckets y políticas restantes
SELECT id, name, public FROM storage.buckets WHERE id = 'images';

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

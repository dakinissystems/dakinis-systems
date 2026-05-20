-- Dakinis Platform — habilitar RLS y bloquear acceso anon/authenticated
-- Ejecutar DESPUÉS de 001-audit y revisar la salida.
-- Requiere: las apps backend usan service_role / secret key (nunca anon en servidor).

-- ---------------------------------------------------------------------------
-- A) Habilitar RLS en todas las tablas de usuario (public + dakinis_auth)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname IN ('public', 'dakinis_auth')
      AND n.nspname NOT LIKE 'pg_%'
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
    RAISE NOTICE 'RLS enabled: %.%', r.schema_name, r.table_name;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- B) Quitar acceso directo API (PostgREST) a tablas sensibles
--    El backend con service_role sigue funcionando (bypass RLS).
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE dakinis_auth.users FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA dakinis_auth FROM anon, authenticated;

-- Si users está en public (migración antigua), ajusta el nombre:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE public.users FROM anon, authenticated';
  END IF;
END $$;

-- Opcional: revocar todo public para anon/authenticated (máximo bloqueo).
-- Descomenta solo si NINGÚN cliente usa supabase-js con anon key contra estas tablas.
/*
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;
*/

-- ---------------------------------------------------------------------------
-- C) Políticas mínimas (solo si el FRONT usa Supabase Auth + anon key)
--    Por defecto Dakinis usa API Node + JWT: sin políticas = deny all vía anon.
-- ---------------------------------------------------------------------------

-- Ejemplo: perfil propio (SIN password_hash en la tabla expuesta al cliente).
-- CREATE POLICY users_select_own ON public.profiles
--   FOR SELECT TO authenticated
--   USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- D) Asegurar que password_hash no sea legible vía vistas
-- ---------------------------------------------------------------------------
-- No crear vistas que incluyan password_hash hacia roles anon/authenticated.

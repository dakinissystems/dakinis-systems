-- Diagnóstico: AkoeNet backend (akoenet-backend) usa public.users vía node-pg-migrate.
-- NO es lo mismo que schema akoenet de migr. 006/032 en Supabase platform.
-- Si public.users no existe → login devuelve 503 database_schema_outdated.

-- 1) ¿Existe public.users? (lo que espera akoenet-backend)
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'users'
) AS public_users_exists;

-- 2) Columnas que exige el login
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
  AND column_name IN ('email', 'password', 'deleted_at', 'totp_enabled', 'totp_secret', 'is_admin')
ORDER BY column_name;

-- 3) Schema platform akoenet (migr. 006) — distinto del backend legacy
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'akoenet' AND table_name = 'user_profiles'
) AS akoenet_schema_user_profiles;

-- Si public_users_exists = false → en Railway akoenet-backend:
--   npm run migrate   (o redeploy para runStartupMigrations)
-- DATABASE_URL debe apuntar a la BD donde corren esas migraciones.

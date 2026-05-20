-- Dakinis Platform (Supabase) — auditoría RLS y exposición API
-- Ejecutar en: SQL Editor → proyecto dakinis-platform (omdosutakaefpowscagp)
-- Solo lectura; no modifica datos.

-- 1) Tablas en public SIN row level security
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
  AND n.nspname NOT LIKE 'pg_temp%'
ORDER BY 1, 2;

-- 2) Tablas con RLS desactivado (las que dispara el advisor)
SELECT
  schemaname,
  tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE c.relkind = 'r'
  AND NOT c.relrowsecurity
  AND t.schemaname IN ('public', 'dakinis_auth', 'storage', 'graphql_public')
ORDER BY 1, 2;

-- 3) Columnas sensibles (password, secret, token, hash)
SELECT
  table_schema,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND (
    column_name ILIKE '%password%'
    OR column_name ILIKE '%secret%'
    OR column_name ILIKE '%token%'
    OR column_name ILIKE '%hash%'
  )
ORDER BY 1, 2, 3;

-- 4) Privilegios de anon/authenticated sobre tablas expuestas
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('anon', 'authenticated')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 2, 3, 1, 4;

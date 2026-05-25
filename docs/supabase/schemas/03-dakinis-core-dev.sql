-- Dakinis One Core — STAGING / DEV (misma estructura que prod, schema distinto)
-- POSTGRES_SCHEMA=dakinis_core_dev  CORE_SEED_DEMO=true

CREATE SCHEMA IF NOT EXISTS dakinis_core_dev;

-- Copia: en Supabase puedes ejecutar 02-dakinis-core-prod.sql
-- sustituyendo dakinis_core_prod por dakinis_core_dev en todo el archivo.
-- O usar: \i con psql local.

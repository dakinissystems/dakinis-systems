-- ⚠️ SOLO en el proyecto Supabase donde se ejecutaron por error (ej. AkoeNet).
-- NO ejecutar en el proyecto Dakinis Core / Auth (ahí deben quedar los schemas).
--
-- Elimina schemas creados por:
--   schemas/00-bootstrap-schemas.sql
--   schemas/02-dakinis-core-prod.sql
--   seeds/04-tenant-dumpling-house.sql (si también se corrió por error)

DROP SCHEMA IF EXISTS dakinis_core_prod CASCADE;
DROP SCHEMA IF EXISTS dakinis_core_dev CASCADE;
DROP SCHEMA IF EXISTS dakinis_core CASCADE;
DROP SCHEMA IF EXISTS dakinis_auth CASCADE;

-- Comprobar que ya no existen (debe devolver 0 filas):
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN ('dakinis_core_prod', 'dakinis_core_dev', 'dakinis_core', 'dakinis_auth')
ORDER BY 1;

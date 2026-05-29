-- Ejecutar ANTES del seed Dumpling House (solo lectura + mensaje)
SELECT
  to_regclass('dakinis_core_prod.business') AS prod_business,
  to_regclass('dakinis_core.business') AS legacy_business,
  to_regclass('public.business') AS public_business;

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'business'
  AND table_schema IN ('dakinis_core_prod', 'dakinis_core', 'dakinis_core_dev', 'public')
ORDER BY 1;

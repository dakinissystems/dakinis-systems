-- RLS "Enabled No Policy" — solo tablas NUEVAS sin política
-- Ejecutar después de schemas 03–09 (o cuando el Security Advisor reporte tablas sin policy).
-- Re-ejecutar 006-rls-policies-deny-api.sql también vale (recorre todas las tablas con RLS).
--
-- Modelo Dakinis: Core/Auth en Railway usan postgres vía pooler :6543 — NO PostgREST anon key.
-- Política: bloqueo total a anon + authenticated (satisface Security Advisor).

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
    'audit',
    'meta',
    'knowledge',
    'legacy_akoenet'
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
    RAISE NOTICE 'Policy % created on %.%', pol_name, r.schema_name, r.table_name;
  END LOOP;

  RAISE NOTICE 'Políticas creadas: %', created;
END $$;

-- Verificación: debe devolver 0 filas
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname IN (
    'public', 'dakinis_auth', 'dakinis_core_prod', 'dakinis_core_dev',
    'core', 'billing', 'stream', 'akoenet', 'lifeflow', 'ai', 'hub', 'audit', 'meta', 'knowledge',
    'legacy_akoenet'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid
  )
ORDER BY 1, 2;

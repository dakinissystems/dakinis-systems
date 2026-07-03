-- 026 — RLS deny policies for schema knowledge
-- Ejecutar tras 025_knowledge_schema.sql (Security Advisor: "RLS Enabled No Policy")
--
-- Modelo Dakinis: dakinis-knowledge usa postgres pooler :6543, no PostgREST anon key.
-- Política dakinis_block_anon_authenticated: bloqueo total a anon + authenticated.

DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; omitiendo políticas knowledge.';
    RETURN;
  END IF;

  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'knowledge'
      AND c.relkind = 'r'
      AND c.relrowsecurity
      AND NOT c.relispartition
    ORDER BY 1
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON knowledge.%I',
      pol_name,
      r.table_name
    );
    EXECUTE format(
      $p$
      CREATE POLICY %I ON knowledge.%I
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
      $p$,
      pol_name,
      r.table_name
    );
    RAISE NOTICE 'Policy % on knowledge.%', pol_name, r.table_name;
  END LOOP;
END $$;

-- Verificación: debe devolver 0 filas
SELECT n.nspname AS schema_name, c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND c.relrowsecurity
  AND n.nspname = 'knowledge'
  AND NOT EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid = c.oid)
ORDER BY 1, 2;

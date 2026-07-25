-- 052 — Enable RLS + deny policies on public tables flagged "RLS Disabled"
-- Ejecutar ENTERO en Supabase SQL Editor (no seleccionar solo un trozo).
-- Idempotente. Backend Railway (rol postgres) sigue con acceso total.

DO $$
DECLARE
  pol_name text := 'dakinis_block_anon_authenticated';
  tbl text;
  tables text[] := ARRAY[
    'AutomationRuns',
    'member_xp',
    'xp_ledger',
    'reputation_votes',
    'quest_progress',
    'server_moderation_warnings',
    'server_member_timeouts'
  ];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE NOTICE 'Roles anon/authenticated no existen; nada que hacer.';
  ELSE
    FOREACH tbl IN ARRAY tables
    LOOP
      IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, tbl);
        EXECUTE format(
          $p$
          CREATE POLICY %I ON public.%I
            FOR ALL
            TO anon, authenticated
            USING (false)
            WITH CHECK (false)
          $p$,
          pol_name,
          tbl
        );
        RAISE NOTICE 'RLS+deny on public.%', tbl;
      ELSE
        RAISE NOTICE 'Tabla public.% no existe; omitida', tbl;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Verificación: debe devolver 0 filas para esas tablas
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'AutomationRuns',
    'member_xp',
    'xp_ledger',
    'reputation_votes',
    'quest_progress',
    'server_moderation_warnings',
    'server_member_timeouts'
  )
ORDER BY 1;

INSERT INTO meta.migration_history (migration_file, notes)
VALUES (
  '052_rls_public_gamification_moderation.sql',
  'Enable RLS + deny anon/authenticated on public gamification/moderation/AutomationRuns'
)
ON CONFLICT (migration_file) DO NOTHING;

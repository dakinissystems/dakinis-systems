-- 019 — RLS por schema (plantillas explícitas; deny anon/authenticated)
-- Complementa 013. Apps Railway usan rol postgres vía pooler.

-- stream: deny all para roles PostgREST
DROP POLICY IF EXISTS stream_deny_anon ON stream.contents;
DROP POLICY IF EXISTS stream_deny_authenticated ON stream.contents;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'CREATE POLICY stream_deny_anon ON stream.contents FOR ALL TO anon USING (false) WITH CHECK (false)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'CREATE POLICY stream_deny_authenticated ON stream.contents FOR ALL TO authenticated USING (false) WITH CHECK (false)';
  END IF;
END $$;

-- Repetir patrón documentado; 013 ya FORCE RLS en todas las tablas.
-- Políticas por tabla se añaden en modules/{schema}/policies/ cuando haya acceso PostgREST.

COMMENT ON SCHEMA stream IS 'RLS: deny anon/authenticated; acceso vía postgres pooler + funciones v1';

-- Plan cutover dakinis_core_prod → core (NO ejecutar hasta Fase cutover Core)
CREATE OR REPLACE FUNCTION meta.cutover_core_checklist()
RETURNS TABLE (step integer, action text, done boolean)
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM (VALUES
    (1, 'Dual-read Core API: dakinis_core_prod.business + core.tenants', false),
    (2, 'Backfill business.id → core.tenants.legacy_business_id', false),
    (3, 'Dual-write tenant_records / CRM', false),
    (4, 'Switch POSTGRES_SCHEMA=core en Railway Core Back', false),
    (5, 'Monitorizar 48h', false),
    (6, 'CREATE VIEW dakinis_core_prod.business AS SELECT ... FROM core.* (compat)', false),
    (7, 'DROP SCHEMA dakinis_core_prod CASCADE', false)
  ) AS t(step, action, done);
$$;

COMMENT ON FUNCTION meta.cutover_core_checklist IS 'Checklist manual; NO automatizar drop hasta cutover validado';

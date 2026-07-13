-- 037 — StreamAutomator Creator Suite (automation + director)
-- Ejecutar en Supabase SQL Editor (prod). Idempotente.
--
-- Contexto:
--   - Railway / Sequelize escribe en public."AutomationRules" y public."StreamDirectorSessions"
--   - stream.* mantiene copia UUID para Hub, analytics y cutover futuro
--   - Requiere: 005 (stream), 014 (legacy_id_map), 016b (helpers sync) opcional pero recomendado
--
-- Tras aplicar: verificar con scripts/verify_streamautomator_creator_suite.sql

-- ============================================================================
-- 1) public — tablas legacy Sequelize (prod inmediato)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."AutomationRules" (
  id serial PRIMARY KEY,
  "userId" integer NOT NULL,
  name varchar(120) NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  "triggerType" varchar(64) NOT NULL,
  "triggerConfig" jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_trigger
  ON public."AutomationRules" ("userId", "triggerType");

CREATE TABLE IF NOT EXISTS public."StreamDirectorSessions" (
  id serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "contentId" integer,
  title varchar(500) NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'live',
  platform varchar(40),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  "startedAt" timestamptz,
  "endedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stream_director_sessions_user_status
  ON public."StreamDirectorSessions" ("userId", status);

COMMENT ON TABLE public."AutomationRules" IS
  'StreamAutomator IF/THEN rules — Sequelize prod (legacy public)';
COMMENT ON TABLE public."StreamDirectorSessions" IS
  'StreamAutomator Director mode sessions — Sequelize prod (legacy public)';

-- FKs solo si existen tablas legacy
DO $$
BEGIN
  IF to_regclass('public."Users"') IS NOT NULL THEN
    ALTER TABLE public."AutomationRules"
      DROP CONSTRAINT IF EXISTS "AutomationRules_userId_fkey";
    ALTER TABLE public."AutomationRules"
      ADD CONSTRAINT "AutomationRules_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;

    ALTER TABLE public."StreamDirectorSessions"
      DROP CONSTRAINT IF EXISTS "StreamDirectorSessions_userId_fkey";
    ALTER TABLE public."StreamDirectorSessions"
      ADD CONSTRAINT "StreamDirectorSessions_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;
  END IF;

  IF to_regclass('public."Contents"') IS NOT NULL THEN
    ALTER TABLE public."StreamDirectorSessions"
      DROP CONSTRAINT IF EXISTS "StreamDirectorSessions_contentId_fkey";
    ALTER TABLE public."StreamDirectorSessions"
      ADD CONSTRAINT "StreamDirectorSessions_contentId_fkey"
      FOREIGN KEY ("contentId") REFERENCES public."Contents"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 2) stream — modelo objetivo (UUID, legacy_id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stream.automation_rules (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  trigger_type text NOT NULL,
  trigger_config jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stream_automation_rules_user_trigger
  ON stream.automation_rules (user_id, trigger_type);

CREATE TABLE IF NOT EXISTS stream.director_sessions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  content_id bigint REFERENCES stream.contents(id) ON DELETE SET NULL,
  content_legacy_id integer,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'live',
  platform text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stream_director_sessions_user_status
  ON stream.director_sessions (user_id, status);

COMMENT ON TABLE stream.automation_rules IS
  'StreamAutomator automation rules — modelo stream (UUID)';
COMMENT ON TABLE stream.director_sessions IS
  'StreamAutomator Director sessions — modelo stream (UUID)';

-- ============================================================================
-- 3) Sync public → stream (convivencia, patrón 016b)
-- ============================================================================

-- Helper idempotente (también definido en 016b)
CREATE OR REPLACE FUNCTION stream._resolve_user_uuid(p_legacy_user_id integer)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = stream, dakinis_auth, pg_temp
AS $$
  SELECT m.user_id
  FROM dakinis_auth.legacy_id_map m
  WHERE m.legacy_schema = 'stream'
    AND m.legacy_table = 'Users'
    AND m.legacy_id = p_legacy_user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_automation_rules_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, dakinis_auth, public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := stream._resolve_user_uuid(NEW."userId");
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO stream.automation_rules (
    user_id, name, enabled, trigger_type, trigger_config, actions,
    legacy_id, created_at, updated_at
  )
  VALUES (
    v_user_id,
    NEW.name,
    coalesce(NEW.enabled, true),
    NEW."triggerType",
    NEW."triggerConfig",
    coalesce(NEW.actions, '[]'::jsonb),
    NEW.id,
    coalesce(NEW."createdAt", now()),
    coalesce(NEW."updatedAt", now())
  )
  ON CONFLICT (legacy_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    enabled = EXCLUDED.enabled,
    trigger_type = EXCLUDED.trigger_type,
    trigger_config = EXCLUDED.trigger_config,
    actions = EXCLUDED.actions,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_automation_rules_delete_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, public, pg_temp
AS $$
BEGIN
  DELETE FROM stream.automation_rules WHERE legacy_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_director_sessions_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, dakinis_auth, public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_content_id bigint;
BEGIN
  v_user_id := stream._resolve_user_uuid(NEW."userId");
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_content_id := NULL;
  IF NEW."contentId" IS NOT NULL THEN
    SELECT c.id INTO v_content_id
    FROM stream.contents c
    WHERE c.legacy_id = NEW."contentId"
    LIMIT 1;
  END IF;

  INSERT INTO stream.director_sessions (
    user_id, content_id, content_legacy_id, title, status, platform,
    steps, started_at, ended_at, legacy_id, created_at, updated_at
  )
  VALUES (
    v_user_id,
    v_content_id,
    NEW."contentId",
    NEW.title,
    coalesce(NEW.status, 'live'),
    NEW.platform,
    coalesce(NEW.steps, '[]'::jsonb),
    NEW."startedAt",
    NEW."endedAt",
    NEW.id,
    coalesce(NEW."createdAt", now()),
    coalesce(NEW."updatedAt", now())
  )
  ON CONFLICT (legacy_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    content_id = EXCLUDED.content_id,
    content_legacy_id = EXCLUDED.content_legacy_id,
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    platform = EXCLUDED.platform,
    steps = EXCLUDED.steps,
    started_at = EXCLUDED.started_at,
    ended_at = EXCLUDED.ended_at,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_director_sessions_delete_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, public, pg_temp
AS $$
BEGIN
  DELETE FROM stream.director_sessions WHERE legacy_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_automation_rules_insert ON public."AutomationRules";
CREATE TRIGGER trg_sync_automation_rules_insert
  AFTER INSERT ON public."AutomationRules"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_automation_rules_to_stream();

DROP TRIGGER IF EXISTS trg_sync_automation_rules_update ON public."AutomationRules";
CREATE TRIGGER trg_sync_automation_rules_update
  AFTER UPDATE ON public."AutomationRules"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_automation_rules_to_stream();

DROP TRIGGER IF EXISTS trg_sync_automation_rules_delete ON public."AutomationRules";
CREATE TRIGGER trg_sync_automation_rules_delete
  AFTER DELETE ON public."AutomationRules"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_automation_rules_delete_to_stream();

DROP TRIGGER IF EXISTS trg_sync_director_sessions_insert ON public."StreamDirectorSessions";
CREATE TRIGGER trg_sync_director_sessions_insert
  AFTER INSERT ON public."StreamDirectorSessions"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_director_sessions_to_stream();

DROP TRIGGER IF EXISTS trg_sync_director_sessions_update ON public."StreamDirectorSessions";
CREATE TRIGGER trg_sync_director_sessions_update
  AFTER UPDATE ON public."StreamDirectorSessions"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_director_sessions_to_stream();

DROP TRIGGER IF EXISTS trg_sync_director_sessions_delete ON public."StreamDirectorSessions";
CREATE TRIGGER trg_sync_director_sessions_delete
  AFTER DELETE ON public."StreamDirectorSessions"
  FOR EACH ROW EXECUTE FUNCTION stream.sync_public_director_sessions_delete_to_stream();

-- ============================================================================
-- 4) RLS + deny anon/authenticated (Security Advisor)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
BEGIN
  FOR r IN
    SELECT *
    FROM (VALUES
      ('public', 'AutomationRules'),
      ('public', 'StreamDirectorSessions'),
      ('stream', 'automation_rules'),
      ('stream', 'director_sessions')
    ) AS t(schema_name, table_name)
  LOOP
    IF to_regclass(format('%I.%I', r.schema_name, r.table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schema_name, r.table_name
    );
    EXECUTE format(
      'ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',
      r.schema_name, r.table_name
    );

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_name, r.schema_name, r.table_name);
      EXECUTE format(
        $p$
        CREATE POLICY %I ON %I.%I
          FOR ALL TO anon, authenticated
          USING (false) WITH CHECK (false)
        $p$,
        pol_name, r.schema_name, r.table_name
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 5) Auditoría meta
-- ============================================================================

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES (
  'stream',
  5,
  'Creator Suite: automation_rules + director_sessions',
  '037_streamautomator_creator_suite.sql'
)
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 5),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES ('037_streamautomator_creator_suite.sql', true, 'StreamAutomator Creator Suite tables')
ON CONFLICT (migration_file) DO NOTHING;

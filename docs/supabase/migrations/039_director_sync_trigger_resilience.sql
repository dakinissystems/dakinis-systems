-- 039 — Director/Automation sync triggers: no abortar INSERT en public si falla stream.*
-- Ejecutar en Supabase SQL Editor (prod). Idempotente.
--
-- Síntoma: POST /api/director/start → 500 cuando el trigger AFTER INSERT en
-- public."StreamDirectorSessions" falla al escribir en stream.director_sessions
-- (FK legacy_id_map, contenido no sincronizado, etc.) y revierte toda la fila.
--
-- Requiere: 037 (tablas + triggers). Verificar con scripts/verify_streamautomator_creator_suite.sql

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

  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'stream.automation_rules sync skipped for legacy %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
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

  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'stream.director_sessions sync skipped for legacy %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION stream.sync_public_director_sessions_to_stream() IS
  '039: sync public.StreamDirectorSessions → stream.director_sessions; failures do not roll back Sequelize INSERT';

-- 016b — Fase convivencia Stream: triggers public → stream
-- Fase 2 del cutover: apps siguen escribiendo en public; stream.* se mantiene sincronizado.
-- Desactivar en Fase 4: SELECT stream.disable_public_sync_triggers();

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

CREATE OR REPLACE FUNCTION stream._resolve_tenant_uuid(p_legacy_tenant_id bigint)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = stream, core, pg_temp
AS $$
  SELECT tl.tenant_id
  FROM core.tenant_legacy_map tl
  WHERE tl.legacy_bigint = p_legacy_tenant_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_contents_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, dakinis_auth, core, public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  v_user_id := stream._resolve_user_uuid(NEW."userId");
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  v_tenant_id := stream._resolve_tenant_uuid(NEW.tenant_id);

  INSERT INTO stream.contents (
    user_id, tenant_id, title, content, content_type, scheduled_for,
    hashtags, mentions, platforms, timezone, recurrence, files, status,
    discord_guild_id, discord_channel_id, published_at, publish_error,
    deleted_at, legacy_id, created_at, updated_at
  )
  VALUES (
    v_user_id,
    v_tenant_id,
    coalesce(nullif(trim(NEW.title), ''), '(sin título)'),
    coalesce(NEW.content, ''),
    coalesce(nullif(trim(NEW."contentType"), ''), 'post'),
    coalesce(NEW."scheduledFor", NEW."createdAt", now()),
    NEW.hashtags,
    NEW.mentions,
    coalesce(NEW.platforms, '[]'::jsonb),
    NEW.timezone,
    NEW.recurrence,
    NEW.files,
    coalesce(NEW.status, 'scheduled'),
    NEW."discordGuildId",
    NEW."discordChannelId",
    NEW."publishedAt",
    NEW."publishError",
    coalesce(NEW."deletedAt", NEW.deleted_at),
    NEW.id,
    coalesce(NEW."createdAt", now()),
    coalesce(NEW."updatedAt", now())
  )
  ON CONFLICT (legacy_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    tenant_id = EXCLUDED.tenant_id,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_type = EXCLUDED.content_type,
    scheduled_for = EXCLUDED.scheduled_for,
    hashtags = EXCLUDED.hashtags,
    mentions = EXCLUDED.mentions,
    platforms = EXCLUDED.platforms,
    timezone = EXCLUDED.timezone,
    recurrence = EXCLUDED.recurrence,
    files = EXCLUDED.files,
    status = EXCLUDED.status,
    discord_guild_id = EXCLUDED.discord_guild_id,
    discord_channel_id = EXCLUDED.discord_channel_id,
    published_at = EXCLUDED.published_at,
    publish_error = EXCLUDED.publish_error,
    deleted_at = EXCLUDED.deleted_at,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION stream.sync_public_contents_delete_to_stream()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, pg_temp
AS $$
BEGIN
  UPDATE stream.contents
  SET deleted_at = coalesce(deleted_at, now()), updated_at = now()
  WHERE legacy_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_contents_insert ON public."Contents";
CREATE TRIGGER trg_sync_contents_insert
  AFTER INSERT ON public."Contents"
  FOR EACH ROW
  EXECUTE FUNCTION stream.sync_public_contents_to_stream();

DROP TRIGGER IF EXISTS trg_sync_contents_update ON public."Contents";
CREATE TRIGGER trg_sync_contents_update
  AFTER UPDATE ON public."Contents"
  FOR EACH ROW
  EXECUTE FUNCTION stream.sync_public_contents_to_stream();

DROP TRIGGER IF EXISTS trg_sync_contents_delete ON public."Contents";
CREATE TRIGGER trg_sync_contents_delete
  AFTER DELETE ON public."Contents"
  FOR EACH ROW
  EXECUTE FUNCTION stream.sync_public_contents_delete_to_stream();

CREATE OR REPLACE FUNCTION stream.disable_public_sync_triggers()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  DROP TRIGGER IF EXISTS trg_sync_contents_insert ON public."Contents";
  DROP TRIGGER IF EXISTS trg_sync_contents_update ON public."Contents";
  DROP TRIGGER IF EXISTS trg_sync_contents_delete ON public."Contents";
  RAISE NOTICE 'Stream sync triggers disabled. Fase 3+: escribir directo en stream.contents';
END;
$$;

COMMENT ON FUNCTION stream.disable_public_sync_triggers IS 'Fase 4 cutover: ejecutar tras switch de app a stream.*';

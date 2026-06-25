-- 015 — Backfill opcional: Contents + Media desde public (StreamAutomator)
-- Ejecutar tras 014. Requiere legacy_id_map poblado para stream/Users.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Contents'
  ) THEN
    RAISE NOTICE 'public.Contents no existe; omitiendo.';
    RETURN;
  END IF;

  INSERT INTO stream.contents (
    user_id, tenant_id, title, content, content_type, scheduled_for,
    hashtags, mentions, platforms, timezone, recurrence, files, status,
    discord_guild_id, discord_channel_id, published_at, publish_error,
    deleted_at, legacy_id, created_at, updated_at
  )
  SELECT
    m.user_id,
    tl.tenant_id,
    coalesce(nullif(trim(c.title), ''), '(sin título)'),
    coalesce(c.content, ''),
    coalesce(nullif(trim(c."contentType"), ''), 'post'),
    coalesce(c."scheduledFor", c."createdAt", now()),
    c.hashtags,
    c.mentions,
    c.platforms,
    c.timezone,
    c.recurrence,
    c.files,
    coalesce(c.status, 'scheduled'),
    c."discordGuildId",
    c."discordChannelId",
    c."publishedAt",
    c."publishError",
    coalesce(c."deletedAt", c.deleted_at),
    c.id,
    coalesce(c."createdAt", now()),
    coalesce(c."updatedAt", now())
  FROM public."Contents" c
  JOIN dakinis_auth.legacy_id_map m
    ON m.legacy_schema = 'stream' AND m.legacy_table = 'Users' AND m.legacy_id = c."userId"
  LEFT JOIN core.tenant_legacy_map tl ON tl.legacy_bigint = c.tenant_id
  ON CONFLICT (legacy_id) DO NOTHING;

  RAISE NOTICE 'Backfill Contents: % filas', (SELECT count(*) FROM stream.contents);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Media'
  ) THEN
    RAISE NOTICE 'public.Media no existe; omitiendo.';
    RETURN;
  END IF;

  INSERT INTO stream.media (
    user_id, tenant_id, filename, original_name, mime_type, size, url,
    storage_path, thumbnail_url, metadata, deleted_at, legacy_id,
    created_at, updated_at
  )
  SELECT
    m.user_id,
    tl.tenant_id,
    med.filename,
    med."originalName",
    med."mimeType",
    med.size,
    med.url,
    med."storagePath",
    med."thumbnailUrl",
    med.metadata,
    med.deleted_at,
    med.id,
    coalesce(med."createdAt", now()),
    coalesce(med."updatedAt", now())
  FROM public."Media" med
  JOIN dakinis_auth.legacy_id_map m
    ON m.legacy_schema = 'stream' AND m.legacy_table = 'Users' AND m.legacy_id = med."userId"
  LEFT JOIN core.tenant_legacy_map tl ON tl.legacy_bigint = med.tenant_id
  ON CONFLICT (legacy_id) DO NOTHING;

  RAISE NOTICE 'Backfill Media: % filas', (SELECT count(*) FROM stream.media);
END $$;

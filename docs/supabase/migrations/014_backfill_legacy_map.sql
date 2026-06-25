-- 014 — Backfill opcional: mapear IDs legacy → dakinis_auth.users
-- Ejecutar SOLO cuando quieras empezar migración de datos desde public.*
--
-- Si falla password_hash NOT NULL → ejecutar primero 014a_auth_nullable_password.sql

-- 0) Asegurar columnas nullable (idempotente)
ALTER TABLE dakinis_auth.users ALTER COLUMN password_hash DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'dakinis_auth'
      AND table_name = 'users'
      AND column_name = 'tenant_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE dakinis_auth.users ALTER COLUMN tenant_id DROP NOT NULL;
  END IF;
END $$;

-- Helper: UUID seguro desde platformAuthSub (evita cast inválido)
CREATE OR REPLACE FUNCTION dakinis_auth._safe_uuid_from_text(p text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN gen_random_uuid();
  END IF;
  IF p ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RETURN p::uuid;
  END IF;
  RETURN gen_random_uuid();
END;
$$;

-- 1) Insertar usuarios Stream desde public."Users" (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Users'
  ) THEN
    INSERT INTO dakinis_auth.users (id, email, password_hash, role, created_at, updated_at)
    SELECT
      dakinis_auth._safe_uuid_from_text(u."platformAuthSub"),
      lower(trim(u.email)),
      nullif(trim(u."passwordHash"), ''),
      CASE WHEN u."isAdmin" THEN 'platform_admin' ELSE 'user' END,
      coalesce(u."createdAt", now()),
      coalesce(u."updatedAt", now())
    FROM public."Users" u
    WHERE u.email IS NOT NULL AND trim(u.email) <> ''
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO dakinis_auth.legacy_id_map (legacy_schema, legacy_table, legacy_id, user_id)
    SELECT 'stream', 'Users', u.id, au.id
    FROM public."Users" u
    JOIN dakinis_auth.users au ON lower(au.email) = lower(trim(u.email))
    ON CONFLICT DO NOTHING;

    -- OAuth vinculado (sin passwordHash)
    INSERT INTO dakinis_auth.oauth_accounts (user_id, provider, provider_user_id, metadata)
    SELECT DISTINCT ON (au.id, prov.provider)
      au.id,
      prov.provider,
      prov.provider_user_id,
      prov.metadata
    FROM public."Users" u
    JOIN dakinis_auth.users au ON lower(au.email) = lower(trim(u.email))
    CROSS JOIN LATERAL (
      SELECT 'google'::text AS provider, u."googleId" AS provider_user_id, '{}'::jsonb AS metadata
      WHERE u."googleId" IS NOT NULL AND trim(u."googleId") <> ''
      UNION ALL
      SELECT 'twitch', u."twitchId", '{}'::jsonb
      WHERE u."twitchId" IS NOT NULL AND trim(u."twitchId") <> ''
      UNION ALL
      SELECT 'discord', u."discordId", '{}'::jsonb
      WHERE u."discordId" IS NOT NULL AND trim(u."discordId") <> ''
      UNION ALL
      SELECT 'twitter', u."twitterId", '{}'::jsonb
      WHERE u."twitterId" IS NOT NULL AND trim(u."twitterId") <> ''
      UNION ALL
      SELECT coalesce(nullif(trim(u."oauthProvider"), ''), 'oauth'),
             u."oauthId",
             '{}'::jsonb
      WHERE u."oauthId" IS NOT NULL AND trim(u."oauthId") <> ''
    ) AS prov
    ORDER BY au.id, prov.provider
    ON CONFLICT (provider, provider_user_id) DO NOTHING;

    INSERT INTO stream.user_profiles (user_id, username, license_type, license_expires_at, profile_image_url)
    SELECT
      m.user_id,
      u.username,
      coalesce(u."licenseType", 'none'),
      u."licenseExpiresAt",
      u."profileImageUrl"
    FROM public."Users" u
    JOIN dakinis_auth.legacy_id_map m
      ON m.legacy_schema = 'stream' AND m.legacy_table = 'Users' AND m.legacy_id = u.id
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Backfill Stream Users completado.';
  ELSE
    RAISE NOTICE 'public.Users no existe; omitiendo backfill Stream.';
  END IF;
END $$;

-- 2) Insertar usuarios AkoeNet desde public.users (lowercase, si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    INSERT INTO dakinis_auth.users (id, email, password_hash, role, created_at, updated_at)
    SELECT
      coalesce(u.platform_user_id, gen_random_uuid()),
      lower(trim(u.email)),
      nullif(trim(u.password), ''),
      CASE WHEN u.is_admin THEN 'platform_admin' ELSE 'user' END,
      coalesce(u.created_at, now()),
      now()
    FROM public.users u
    WHERE u.email IS NOT NULL AND trim(u.email) <> '' AND u.deleted_at IS NULL
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO dakinis_auth.legacy_id_map (legacy_schema, legacy_table, legacy_id, user_id)
    SELECT 'akoenet', 'users', u.id, au.id
    FROM public.users u
    JOIN dakinis_auth.users au ON lower(au.email) = lower(trim(u.email))
    WHERE u.deleted_at IS NULL
    ON CONFLICT DO NOTHING;

    INSERT INTO akoenet.user_profiles (
      user_id, username, avatar_url, banner_url, bio, presence_status,
      twitch_username, legacy_id
    )
    SELECT
      m.user_id,
      u.username,
      u.avatar_url,
      u.banner_url,
      u.bio,
      u.presence_status,
      u.twitch_username,
      u.id
    FROM public.users u
    JOIN dakinis_auth.legacy_id_map m
      ON m.legacy_schema = 'akoenet' AND m.legacy_table = 'users' AND m.legacy_id = u.id
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Backfill AkoeNet users completado.';
  ELSE
    RAISE NOTICE 'public.users no existe; omitiendo backfill AkoeNet.';
  END IF;
END $$;

-- 3) Tenants public.tenants → core.tenants
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tenants'
  ) THEN
    INSERT INTO core.tenants (slug, name, plan, legacy_bigint, created_at)
    SELECT t.slug, t.name, coalesce(t.plan, 'free'), t.id, coalesce(t.created_at, now())
    FROM public.tenants t
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO core.tenant_legacy_map (legacy_bigint, tenant_id)
    SELECT t.id, ct.id
    FROM public.tenants t
    JOIN core.tenants ct ON ct.slug = t.slug
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Backfill tenants completado.';
  END IF;
END $$;

-- 4) Conteos de verificación
SELECT 'legacy Users' AS src, count(*)::bigint FROM public."Users"
UNION ALL SELECT 'dakinis_auth.users', count(*) FROM dakinis_auth.users
UNION ALL SELECT 'legacy_id_map', count(*) FROM dakinis_auth.legacy_id_map
UNION ALL SELECT 'stream profiles', count(*) FROM stream.user_profiles
UNION ALL SELECT 'legacy Contents', count(*) FROM public."Contents"
UNION ALL SELECT 'stream contents', count(*) FROM stream.contents
UNION ALL SELECT 'core.tenants', count(*) FROM core.tenants
UNION ALL SELECT 'akoenet profiles', count(*) FROM akoenet.user_profiles;

-- Usuarios OAuth-only (sin password — esperado)
SELECT u.email, u.password_hash IS NULL AS oauth_only
FROM dakinis_auth.users u
WHERE u.password_hash IS NULL;

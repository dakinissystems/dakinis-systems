-- Provisioning test user — velezcampeon_88@hotmail.com
-- Idempotente: re-ejecutar actualiza password y enlaces sin duplicar filas.
-- Password: DakinisTest2026! (bcrypt cost 10, compatible SA + IdP)

DO $$
DECLARE
  v_email text := 'velezcampeon_88@hotmail.com';
  v_username text := 'velezcampeon88';
  v_tenant_slug text := 'velez-test';
  v_fixed_uuid uuid := 'a1000088-0000-4000-8000-000000000088';
  v_password_hash text := '$2a$10$6LyUrVcUqPLsJBfNr6bYGe3MvCOoG7goNxaHvsoEyyTVpQ9LlVdPu';
  v_akoenet_sso_hash text := '$2a$10$1Ar5BXdgEnT9QqeJE8S34uCExxYkAIt3NDfSszhTzT.a8huK1ZOla';
  v_user_id uuid;
  v_tenant_id uuid;
  v_workspace_id uuid;
  v_sa_legacy_id bigint;
  v_ako_legacy_id bigint;
  v_trial_expires timestamptz := now() + interval '30 days';
BEGIN
  SELECT id INTO v_user_id
  FROM dakinis_auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := v_fixed_uuid;
    INSERT INTO dakinis_auth.users (
      id, email, password_hash, role, tenant_id,
      email_verified_at, last_password_change, created_at, updated_at
    )
    VALUES (
      v_user_id, lower(v_email), v_password_hash, 'user', v_tenant_slug,
      now(), now(), now(), now()
    );
  ELSE
    UPDATE dakinis_auth.users
    SET
      password_hash = v_password_hash,
      tenant_id = coalesce(nullif(trim(tenant_id), ''), v_tenant_slug),
      email_verified_at = coalesce(email_verified_at, now()),
      last_password_change = now(),
      is_disabled = false,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Core tenant + membership
  INSERT INTO core.tenants (slug, name, plan)
  VALUES (v_tenant_slug, 'Velez Test Workspace', 'pro')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_tenant_id FROM core.tenants WHERE lower(slug) = lower(v_tenant_slug);

  INSERT INTO core.tenant_memberships (user_id, tenant_id, role)
  VALUES (v_user_id, v_tenant_id, 'owner')
  ON CONFLICT (user_id, tenant_id) DO UPDATE SET role = 'owner';

  INSERT INTO hub.tenant_product_access (tenant_slug, products)
  VALUES (
    v_tenant_slug,
    '["core","lifeflow","streamautomator","akoenet","tabletop"]'::jsonb
  )
  ON CONFLICT (tenant_slug) DO UPDATE SET
    products = EXCLUDED.products,
    updated_at = now();

  -- Hub workspace (meta.*)
  INSERT INTO meta.workspaces (name, slug, core_tenant_slug, owner_id, plan, status)
  VALUES ('Velez Test', v_tenant_slug, v_tenant_slug, v_user_id, 'pro', 'active')
  ON CONFLICT (slug) DO UPDATE SET
    owner_id = EXCLUDED.owner_id,
    plan = 'pro',
    status = 'active',
    updated_at = now();

  SELECT id INTO v_workspace_id FROM meta.workspaces WHERE lower(slug) = lower(v_tenant_slug);

  INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
  VALUES (v_workspace_id, v_user_id, 'owner', 'active', now())
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET
    role = 'owner',
    status = 'active',
    accepted_at = coalesce(meta.workspace_members.accepted_at, now()),
    updated_at = now();

  INSERT INTO meta.workspace_products (workspace_id, product_slug, enabled)
  SELECT v_workspace_id, p.slug, true
  FROM (VALUES ('core'), ('lifeflow'), ('streamautomator'), ('akoenet'), ('tabletop')) AS p(slug)
  ON CONFLICT (workspace_id, product_slug) DO UPDATE SET
    enabled = true,
    deactivated_at = NULL;

  -- StreamAutomator legacy Users + stream profile
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Users'
  ) THEN
    SELECT u.id INTO v_sa_legacy_id
    FROM public."Users" u
    WHERE lower(trim(coalesce(u.email, ''))) = lower(v_email);

    IF v_sa_legacy_id IS NULL THEN
      INSERT INTO public."Users" (
        username, email, "passwordHash", "platformAuthSub",
        "licenseType", "licenseExpiresAt", "hasUsedTrial",
        "isAdmin", "isDisabled", "createdAt", "updatedAt"
      )
      VALUES (
        v_username, lower(v_email), v_password_hash, v_user_id::text,
        'trial', v_trial_expires, true,
        false, false, now(), now()
      )
      RETURNING id INTO v_sa_legacy_id;
    ELSE
      UPDATE public."Users"
      SET
        username = v_username,
        "passwordHash" = v_password_hash,
        "platformAuthSub" = v_user_id::text,
        "licenseType" = coalesce(nullif(trim("licenseType"), ''), 'trial'),
        "licenseExpiresAt" = coalesce("licenseExpiresAt", v_trial_expires),
        "hasUsedTrial" = true,
        "isDisabled" = false,
        "updatedAt" = now()
      WHERE id = v_sa_legacy_id;
    END IF;

    INSERT INTO dakinis_auth.legacy_id_map (legacy_schema, legacy_table, legacy_id, user_id)
    VALUES ('stream', 'Users', v_sa_legacy_id, v_user_id)
    ON CONFLICT (legacy_schema, legacy_table, legacy_id) DO UPDATE SET user_id = EXCLUDED.user_id;

    INSERT INTO stream.user_profiles (
      user_id, username, license_type, license_expires_at, has_used_trial
    )
    VALUES (v_user_id, v_username, 'trial', v_trial_expires, true)
    ON CONFLICT (user_id) DO UPDATE SET
      username = EXCLUDED.username,
      license_type = 'trial',
      license_expires_at = coalesce(stream.user_profiles.license_expires_at, EXCLUDED.license_expires_at),
      has_used_trial = true,
      updated_at = now();
  END IF;

  -- AkoeNet legacy users + akoenet profile
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    SELECT u.id INTO v_ako_legacy_id
    FROM public.users u
    WHERE lower(trim(coalesce(u.email, ''))) = lower(v_email)
      AND u.deleted_at IS NULL;

    IF v_ako_legacy_id IS NULL THEN
      INSERT INTO public.users (username, email, password, platform_user_id, is_admin)
      VALUES (v_username, lower(v_email), v_akoenet_sso_hash, v_user_id, false)
      RETURNING id INTO v_ako_legacy_id;
    ELSE
      UPDATE public.users
      SET
        username = v_username,
        password = v_akoenet_sso_hash,
        platform_user_id = v_user_id,
        is_admin = false,
        deleted_at = NULL
      WHERE id = v_ako_legacy_id;
    END IF;

    INSERT INTO dakinis_auth.legacy_id_map (legacy_schema, legacy_table, legacy_id, user_id)
    VALUES ('akoenet', 'users', v_ako_legacy_id, v_user_id)
    ON CONFLICT (legacy_schema, legacy_table, legacy_id) DO UPDATE SET user_id = EXCLUDED.user_id;

    INSERT INTO akoenet.user_profiles (user_id, username, legacy_id, presence_status)
    VALUES (v_user_id, v_username, v_ako_legacy_id, 'online')
    ON CONFLICT (user_id) DO UPDATE SET
      username = EXCLUDED.username,
      legacy_id = EXCLUDED.legacy_id,
      deleted_at = NULL,
      updated_at = now();
  END IF;

  -- LifeFlow bridge (Hub widgets / score_history)
  INSERT INTO lifeflow.app_user_links (app_user_id, platform_user_id, email)
  VALUES (v_username, v_user_id, lower(v_email))
  ON CONFLICT (app_user_id) DO UPDATE SET
    platform_user_id = EXCLUDED.platform_user_id,
    email = EXCLUDED.email,
    updated_at = now();

  RAISE NOTICE 'Provisioned % → %', v_email, v_user_id;
END $$;

-- Verificación
SELECT
  u.id AS platform_user_id,
  u.email,
  u.role,
  u.tenant_id,
  u.email_verified_at IS NOT NULL AS email_verified,
  EXISTS (SELECT 1 FROM stream.user_profiles sp WHERE sp.user_id = u.id) AS has_stream,
  EXISTS (SELECT 1 FROM akoenet.user_profiles ap WHERE ap.user_id = u.id) AS has_akoenet,
  EXISTS (SELECT 1 FROM lifeflow.app_user_links l WHERE l.platform_user_id = u.id) AS has_lifeflow,
  hub.v1_get_user_hub_products(u.id) AS hub_products
FROM dakinis_auth.users u
WHERE lower(u.email) = lower('velezcampeon_88@hotmail.com');

SELECT
  m.legacy_schema,
  m.legacy_table,
  m.legacy_id,
  m.user_id
FROM dakinis_auth.legacy_id_map m
JOIN dakinis_auth.users u ON u.id = m.user_id
WHERE lower(u.email) = lower('velezcampeon_88@hotmail.com')
ORDER BY m.legacy_schema, m.legacy_table;

SELECT w.slug AS workspace_slug, wm.role, wm.status
FROM meta.workspaces w
JOIN meta.workspace_members wm ON wm.workspace_id = w.id
JOIN dakinis_auth.users u ON u.id = wm.user_id
WHERE lower(u.email) = lower('velezcampeon_88@hotmail.com');

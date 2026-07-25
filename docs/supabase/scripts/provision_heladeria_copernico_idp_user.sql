-- Fix: IdP user for Hub login (admin@heladeria-copernico.local).
-- Password: Copernico2026!  (bcrypt cost 10)
-- Hub needs dakinis_auth.users — Core-only users cannot log into Hub.

DO $$
DECLARE
  v_email text := 'admin@heladeria-copernico.local';
  v_tenant_slug text := 'heladeria-copernico';
  v_fixed_uuid uuid := 'c0ce0000-0000-4000-8000-00000000c0ce';
  -- bcryptjs hash for Copernico2026! ($2b$ → store as $2a$ for IdP compatibility)
  v_password_hash text := '$2a$10$fLxpamZycZ8eP5SZB/OAROiONeiUlm3gGiCvhvtjpMlK6O5lFn46u';
  v_user_id uuid;
  v_tenant_id uuid;
  v_workspace_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM dakinis_auth.users WHERE lower(email) = lower(v_email);

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
      tenant_id = v_tenant_slug,
      email_verified_at = coalesce(email_verified_at, now()),
      last_password_change = now(),
      is_disabled = false,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  SELECT id INTO v_tenant_id FROM core.tenants WHERE lower(slug) = lower(v_tenant_slug);
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant % missing — run provision_heladeria_copernico.sql first', v_tenant_slug;
  END IF;

  INSERT INTO core.tenant_memberships (user_id, tenant_id, role)
  VALUES (v_user_id, v_tenant_id, 'owner')
  ON CONFLICT (user_id, tenant_id) DO UPDATE SET role = 'owner';

  SELECT id INTO v_workspace_id FROM meta.workspaces WHERE lower(slug) = lower(v_tenant_slug);
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace % missing', v_tenant_slug;
  END IF;

  INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
  VALUES (v_workspace_id, v_user_id, 'owner', 'active', now())
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET
    role = 'owner',
    status = 'active',
    accepted_at = coalesce(meta.workspace_members.accepted_at, now()),
    updated_at = now();

  RAISE NOTICE 'IdP Hub login OK for % (tenant %)', v_email, v_tenant_slug;
END $$;

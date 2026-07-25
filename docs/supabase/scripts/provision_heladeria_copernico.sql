-- Heladería Copérnico — workspace Hub + tenant plataforma (plan pro, full productos, sin coste).
-- Idempotente. Owner: christiandvillar@gmail.com (debe existir en dakinis_auth.users).
-- Core ERP/menú: platform/core/api/scripts/seed-heladeria-copernico.mjs

DO $$
DECLARE
  v_email text := 'christiandvillar@gmail.com';
  v_tenant_slug text := 'heladeria-copernico';
  v_user_id uuid;
  v_tenant_id uuid;
  v_workspace_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM dakinis_auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'IdP user % not found — register or provision first', v_email;
  END IF;

  INSERT INTO core.tenants (slug, name, plan)
  VALUES (v_tenant_slug, 'Heladería Copérnico', 'pro')
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    plan = 'pro';

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

  INSERT INTO meta.workspaces (name, slug, core_tenant_slug, owner_id, plan, status)
  VALUES ('Heladería Copérnico', v_tenant_slug, v_tenant_slug, v_user_id, 'pro', 'active')
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    owner_id = EXCLUDED.owner_id,
    core_tenant_slug = EXCLUDED.core_tenant_slug,
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

  RAISE NOTICE 'Heladería Copérnico workspace OK id=% plan=pro products=all owner=%', v_workspace_id, v_email;
END $$;

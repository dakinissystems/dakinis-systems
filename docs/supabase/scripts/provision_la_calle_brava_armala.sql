-- Provision La Calle Brava Group + Ármala (estructura Hub) — IDEMPOTENTE.
--
-- PRECONDICIONES:
--   1) Migración 058 aplicada.
--   2) Owner existe en dakinis_auth.users.
--
-- IMPORTANTE — DOMINIOS / GOOGLE WORKSPACE:
--   Este script NO inserta dominios ni asume Cloudflare/Workspace contratados.
--   Primero verificar disponibilidad (ver RUNBOOKS/google-workspace-domains.md §0)
--   y solo después ejecutar provision_org_domains_candidates.sql (opcional).
--
-- Ajusta v_owner_email antes de ejecutar.

DO $$
DECLARE
  v_owner_email text := 'christiandvillar@gmail.com'; -- temporal hasta @lacallebravagroup.es
  v_owner_id uuid;
  v_ws_id uuid;
  v_venture_id uuid;
  v_loc_id uuid;
BEGIN
  SELECT id INTO v_owner_id
  FROM dakinis_auth.users
  WHERE lower(email) = lower(v_owner_email);

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'IdP user % not found — provision IdP first', v_owner_email;
  END IF;

  INSERT INTO meta.workspaces (name, slug, core_tenant_slug, owner_id, plan, status, settings)
  VALUES (
    'La Calle Brava Group',
    'la-calle-brava-group',
    'la-calle-brava-group',
    v_owner_id,
    'pro',
    'active',
    jsonb_build_object(
      'legal_name', 'La Calle Brava Group',
      'country', 'ES',
      'currency', 'EUR',
      'timezone', 'Europe/Madrid',
      'domains_status', 'unchecked',
      'mail_status', 'not_provisioned'
    )
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    owner_id = coalesce(meta.workspaces.owner_id, EXCLUDED.owner_id),
    plan = 'pro',
    status = 'active',
    settings = meta.workspaces.settings || EXCLUDED.settings,
    updated_at = now()
  RETURNING id INTO v_ws_id;

  SELECT id INTO v_ws_id FROM meta.workspaces WHERE slug = 'la-calle-brava-group';

  INSERT INTO core.tenants (slug, name, plan)
  VALUES ('la-calle-brava-group', 'La Calle Brava Group', 'pro')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO core.tenant_memberships (user_id, tenant_id, role)
  SELECT v_owner_id, t.id, 'owner'
  FROM core.tenants t
  WHERE lower(t.slug) = 'la-calle-brava-group'
  ON CONFLICT (user_id, tenant_id) DO UPDATE SET role = 'owner';

  INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
  VALUES (v_ws_id, v_owner_id, 'owner', 'active', now())
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET
    role = 'owner',
    status = 'active',
    accepted_at = coalesce(meta.workspace_members.accepted_at, now()),
    updated_at = now();

  INSERT INTO meta.workspace_products (workspace_id, product_slug, enabled)
  SELECT v_ws_id, p.slug, true
  FROM (VALUES ('core'), ('lifeflow')) AS p(slug)
  ON CONFLICT (workspace_id, product_slug) DO UPDATE SET enabled = true;

  INSERT INTO meta.ventures (workspace_id, name, slug, type, status, brand_domain, settings)
  VALUES (
    v_ws_id,
    'Ármala',
    'armala',
    'restaurant',
    'active',
    NULL, -- no asumir armala.es hasta verificar/comprar
    jsonb_build_object(
      'tagline', 'Hamburguesas hechas a tu manera',
      'brand_domain_status', 'unchecked'
    )
  )
  ON CONFLICT (workspace_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    type = 'restaurant',
    status = 'active',
    brand_domain = coalesce(meta.ventures.brand_domain, EXCLUDED.brand_domain),
    settings = meta.ventures.settings || EXCLUDED.settings,
    updated_at = now()
  RETURNING id INTO v_venture_id;

  SELECT id INTO v_venture_id
  FROM meta.ventures
  WHERE workspace_id = v_ws_id AND slug = 'armala';

  INSERT INTO meta.venture_locations (
    venture_id, name, slug, city, country, timezone, core_business_slug
  )
  VALUES (
    v_venture_id,
    'Málaga Centro',
    'malaga-centro',
    'Málaga',
    'ES',
    'Europe/Madrid',
    NULL -- rellenar cuando exista business Core del local
  )
  ON CONFLICT (venture_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = now()
  RETURNING id INTO v_loc_id;

  RAISE NOTICE 'OK workspace=% venture=% location=% (sin dominios — verificar CF/Workspace primero)',
    v_ws_id, v_venture_id, v_loc_id;
END $$;

SELECT w.slug AS org,
       w.settings->>'domains_status' AS domains_status,
       w.settings->>'mail_status' AS mail_status,
       v.slug AS venture,
       v.brand_domain,
       l.slug AS location,
       l.core_business_slug
FROM meta.workspaces w
LEFT JOIN meta.ventures v ON v.workspace_id = w.id
LEFT JOIN meta.venture_locations l ON l.venture_id = v.id
WHERE w.slug = 'la-calle-brava-group'
ORDER BY v.slug, l.slug;

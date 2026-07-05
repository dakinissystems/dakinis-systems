-- 029 — Hub: acceso a productos del ecosistema por tenant + super-admin plataforma

CREATE TABLE IF NOT EXISTS hub.tenant_product_access (
  tenant_slug text PRIMARY KEY,
  products jsonb NOT NULL DEFAULT '["core"]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE hub.tenant_product_access IS
  'Productos Hub visibles por slug de tenant (Core admin). Default solo core.';

-- Plataforma Dakinis: acceso total
INSERT INTO hub.tenant_product_access (tenant_slug, products)
VALUES (
  'dakinis-platform',
  '["core","lifeflow","streamautomator","akoenet","tabletop"]'::jsonb
)
ON CONFLICT (tenant_slug) DO UPDATE SET
  products = EXCLUDED.products,
  updated_at = now();

CREATE OR REPLACE FUNCTION hub.v1_get_user_hub_products(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = hub, core, dakinis_auth, pg_temp
AS $$
DECLARE
  v_email text;
  v_is_admin boolean := false;
  v_all jsonb := '["core","lifeflow","streamautomator","akoenet","tabletop"]'::jsonb;
  v_tenant_access jsonb;
  v_products jsonb;
BEGIN
  SELECT lower(email) INTO v_email FROM dakinis_auth.users WHERE id = p_user_id;

  v_is_admin := lower(coalesce(v_email, '')) = 'christiandvillar@gmail.com'
    OR EXISTS (
      SELECT 1 FROM dakinis_auth.users u
      WHERE u.id = p_user_id AND lower(u.role) = 'platform_admin'
    )
    OR EXISTS (
      SELECT 1 FROM core.tenant_memberships tm
      JOIN core.tenants t ON t.id = tm.tenant_id
      WHERE tm.user_id = p_user_id AND lower(t.slug) = 'dakinis-platform'
    );

  IF v_is_admin THEN
    RETURN jsonb_build_object(
      'products', v_all,
      'is_platform_admin', true,
      'email', v_email,
      'tenant_hub_access', '[]'::jsonb
    );
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'slug', t.slug,
    'products', coalesce(tpa.products, '["core"]'::jsonb)
  ) ORDER BY t.slug), '[]'::jsonb)
  INTO v_tenant_access
  FROM core.tenant_memberships tm
  JOIN core.tenants t ON t.id = tm.tenant_id
  LEFT JOIN hub.tenant_product_access tpa ON lower(tpa.tenant_slug) = lower(t.slug)
  WHERE tm.user_id = p_user_id;

  SELECT coalesce(jsonb_agg(to_jsonb(p)), '["core"]'::jsonb)
  INTO v_products
  FROM (
    SELECT DISTINCT p
    FROM (
      SELECT 'core'::text AS p
      UNION ALL
      SELECT jsonb_array_elements_text(coalesce(row.products, '["core"]'::jsonb))
      FROM jsonb_to_recordset(coalesce(v_tenant_access, '[]'::jsonb)) AS row(products jsonb)
    ) merged
    WHERE p IN ('core', 'lifeflow', 'streamautomator', 'akoenet', 'tabletop')
  ) deduped;

  RETURN jsonb_build_object(
    'products', coalesce(v_products, '["core"]'::jsonb),
    'is_platform_admin', false,
    'email', v_email,
    'tenant_hub_access', coalesce(v_tenant_access, '[]'::jsonb)
  );
END;
$$;

COMMENT ON FUNCTION hub.v1_get_user_hub_products IS
  'Productos Hub visibles para user UUID; christiandvillar@gmail.com y platform_admin → todos';

-- Super-admin IdP (ajusta si el UUID difiere en prod)
UPDATE dakinis_auth.users
SET role = 'platform_admin', tenant_id = coalesce(tenant_id, 'dakinis-platform')
WHERE lower(email) = lower('christiandvillar@gmail.com');

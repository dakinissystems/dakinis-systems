-- 022 — Billing SQL functions: tenant_id / user_id as text (post-021)
-- PostgreSQL no permite CREATE OR REPLACE al cambiar tipos de argumentos → DROP + CREATE.

DROP FUNCTION IF EXISTS billing.v1_get_active_subscription(uuid);
DROP FUNCTION IF EXISTS billing.v1_activate_plan(uuid, uuid, text);
DROP FUNCTION IF EXISTS billing.get_active_subscription(uuid);

CREATE OR REPLACE FUNCTION billing.v1_get_active_subscription(p_tenant_id text)
RETURNS TABLE (
  plan text,
  status text,
  current_period_end timestamptz,
  stripe_subscription_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = billing, pg_temp
AS $$
  SELECT s.plan, s.status, s.current_period_end, s.stripe_subscription_id
  FROM billing.subscriptions s
  WHERE s.tenant_id = p_tenant_id
    AND s.status IN ('active', 'trialing', 'past_due')
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION billing.v1_activate_plan(
  p_tenant_id text,
  p_user_id text,
  p_plan_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = billing, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM billing.plans WHERE code = p_plan_code AND active) THEN
    RAISE EXCEPTION 'plan_not_found: %', p_plan_code;
  END IF;
  INSERT INTO billing.subscriptions (tenant_id, user_id, plan, status)
  VALUES (p_tenant_id, p_user_id, p_plan_code, 'active')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Alias deprecado (011) — misma firma text para compat con 021
CREATE OR REPLACE FUNCTION billing.get_active_subscription(p_tenant_id text)
RETURNS TABLE (
  plan text,
  status text,
  current_period_end timestamptz,
  stripe_subscription_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = billing, pg_temp
AS $$
  SELECT s.plan, s.status, s.current_period_end, s.stripe_subscription_id
  FROM billing.subscriptions s
  WHERE s.tenant_id = p_tenant_id
    AND s.status IN ('active', 'trialing', 'past_due')
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION billing.v1_get_active_subscription(text) IS 'v1 — suscripción activa por business_id (text, ej. biz_...)';
COMMENT ON FUNCTION billing.v1_activate_plan(text, text, text) IS 'v1 — activar plan manual (tenant/user text)';
COMMENT ON FUNCTION billing.get_active_subscription(text) IS 'DEPRECATED: usar billing.v1_get_active_subscription(text)';

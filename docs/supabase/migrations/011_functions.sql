-- 011 — Funciones por dominio (SECURITY DEFINER acotado)

CREATE OR REPLACE FUNCTION billing.get_active_subscription(p_tenant_id uuid)
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

CREATE OR REPLACE FUNCTION stream.get_scheduled_contents(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
RETURNS SETOF stream.contents
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = stream, pg_temp
AS $$
  SELECT *
  FROM stream.contents
  WHERE user_id = p_user_id
    AND scheduled_for >= p_from
    AND scheduled_for <= p_to
    AND deleted_at IS NULL
  ORDER BY scheduled_for;
$$;

CREATE OR REPLACE FUNCTION core.get_tenant_by_slug(p_slug text)
RETURNS SETOF core.tenants
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = core, pg_temp
AS $$
  SELECT *
  FROM core.tenants
  WHERE lower(slug) = lower(trim(p_slug))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION lifeflow.get_latest_score(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lifeflow, pg_temp
AS $$
  SELECT score
  FROM lifeflow.score_history
  WHERE user_id = p_user_id
  ORDER BY recorded_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION hub.get_unread_notification_count(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = hub, pg_temp
AS $$
  SELECT count(*)::bigint
  FROM hub.notifications n
  WHERE n.user_id = p_user_id
    AND n.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM hub.notification_reads r
      WHERE r.notification_id = n.id AND r.user_id = p_user_id
    );
$$;

CREATE OR REPLACE FUNCTION audit.log_action(
  p_user_id uuid,
  p_tenant_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO audit.logs (user_id, tenant_id, action, resource_type, resource_id, metadata)
  VALUES (p_user_id, p_tenant_id, p_action, p_resource_type, p_resource_id, coalesce(p_metadata, '{}'))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 017 — API SQL versionada (v1): Node llama funciones, no tablas directamente
-- Registrar en meta.function_versions. Para v2: crear funciones nuevas, no REPLACE v1.

-- ─── stream v1 ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION stream.v1_get_contents(
  p_user_id uuid,
  p_from timestamptz DEFAULT now() - interval '30 days',
  p_to timestamptz DEFAULT now() + interval '365 days',
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  title text,
  content_type text,
  scheduled_for timestamptz,
  status text,
  platforms jsonb,
  legacy_id integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = stream, pg_temp
AS $$
  SELECT c.id, c.title, c.content_type, c.scheduled_for, c.status, c.platforms, c.legacy_id
  FROM stream.contents c
  WHERE c.user_id = p_user_id
    AND c.scheduled_for >= p_from
    AND c.scheduled_for <= p_to
    AND c.deleted_at IS NULL
    AND (p_status IS NULL OR c.status = p_status)
  ORDER BY c.scheduled_for;
$$;

CREATE OR REPLACE FUNCTION stream.v1_schedule_content(
  p_user_id uuid,
  p_title text,
  p_content text,
  p_content_type text,
  p_scheduled_for timestamptz,
  p_platforms jsonb DEFAULT '[]'::jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, pg_temp
AS $$
DECLARE
  v_id bigint;
BEGIN
  INSERT INTO stream.contents (user_id, title, content, content_type, scheduled_for, platforms, status)
  VALUES (p_user_id, p_title, p_content, p_content_type, p_scheduled_for, p_platforms, 'scheduled')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION stream.v1_publish_content(p_content_id bigint, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stream, pg_temp
AS $$
BEGIN
  UPDATE stream.contents
  SET status = 'published', published_at = now(), updated_at = now()
  WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NULL;
  RETURN FOUND;
END;
$$;

-- ─── billing v1 ──────────────────────────────────────────────
-- tenant_id / user_id as text (compatible con 021+; pre-021 usa tenant_id::text en WHERE)
DROP FUNCTION IF EXISTS billing.v1_get_active_subscription(uuid);
DROP FUNCTION IF EXISTS billing.v1_activate_plan(uuid, uuid, text);

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
  WHERE s.tenant_id::text = p_tenant_id
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

-- ─── core v1 ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION core.v1_get_tenant_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  plan text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = core, pg_temp
AS $$
  SELECT t.id, t.slug, t.name, t.plan
  FROM core.tenants t
  WHERE lower(t.slug) = lower(trim(p_slug))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION core.v1_create_order(
  p_tenant_id uuid,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, audit, pg_temp
AS $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  PERFORM audit.log_action(NULL, p_tenant_id, 'order.create', 'order', v_id::text, p_payload);
  RETURN v_id;
END;
$$;

-- ─── lifeflow v1 ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION lifeflow.v1_calculate_score(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = lifeflow, pg_temp
AS $$
DECLARE
  v_score numeric := 50;
  v_tx_count integer;
  v_goal_ratio numeric;
BEGIN
  SELECT count(*) INTO v_tx_count
  FROM lifeflow.transactions t
  WHERE t.user_id = p_user_id AND t.occurred_at >= now() - interval '30 days';

  SELECT coalesce(avg(
    CASE WHEN g.target_amount > 0 THEN least(g.current_amount / g.target_amount, 1) ELSE 0 END
  ), 0) INTO v_goal_ratio
  FROM lifeflow.goals g
  WHERE g.user_id = p_user_id AND g.status = 'active';

  v_score := least(100, greatest(0, 40 + v_tx_count * 2 + v_goal_ratio * 40));
  RETURN round(v_score, 2);
END;
$$;

CREATE OR REPLACE FUNCTION lifeflow.v1_get_latest_score(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lifeflow, pg_temp
AS $$
  SELECT score FROM lifeflow.score_history
  WHERE user_id = p_user_id
  ORDER BY recorded_at DESC
  LIMIT 1;
$$;

-- ─── ai v1 ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ai.v1_register_usage(
  p_tenant_id uuid,
  p_user_id uuid,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_feature text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ai, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO ai.usage (tenant_id, user_id, model, input_tokens, output_tokens, feature)
  VALUES (p_tenant_id, p_user_id, p_model, p_input_tokens, p_output_tokens, p_feature)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ─── hub v1 ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION hub.v1_get_unread_count(p_user_id uuid)
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

CREATE OR REPLACE FUNCTION hub.v1_get_dashboard(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = hub, stream, billing, lifeflow, core, dakinis_auth, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'email', (SELECT email FROM dakinis_auth.users WHERE id = p_user_id),
    'unread_notifications', hub.v1_get_unread_count(p_user_id),
    'scheduled_contents', (
      SELECT count(*) FROM stream.contents c
      WHERE c.user_id = p_user_id AND c.status = 'scheduled' AND c.deleted_at IS NULL
    ),
    'lifeflow_score', lifeflow.v1_get_latest_score(p_user_id),
    'tenants', coalesce((
      SELECT jsonb_agg(jsonb_build_object('slug', t.slug, 'plan', t.plan))
      FROM core.tenant_memberships tm
      JOIN core.tenants t ON t.id = tm.tenant_id
      WHERE tm.user_id = p_user_id
    ), '[]'::jsonb),
    'recent_items', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'product', r.product_code, 'ref', r.item_ref, 'label', r.label, 'at', r.accessed_at
      ) ORDER BY r.accessed_at DESC)
      FROM (
        SELECT * FROM hub.recent_items ri
        WHERE ri.user_id = p_user_id
        ORDER BY ri.accessed_at DESC
        LIMIT 10
      ) r
    ), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- ─── audit v1 ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit.v1_log_api_request(
  p_service text,
  p_method text,
  p_path text,
  p_status_code integer,
  p_duration_ms integer,
  p_user_id uuid DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO audit.api_requests (service, method, path, status_code, duration_ms, user_id, tenant_id)
  VALUES (p_service, p_method, p_path, p_status_code, p_duration_ms, p_user_id, p_tenant_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ─── Deprecar funciones sin versión (mantener alias temporal) ─
COMMENT ON FUNCTION stream.get_scheduled_contents IS 'DEPRECATED: usar stream.v1_get_contents';
COMMENT ON FUNCTION billing.get_active_subscription IS 'DEPRECATED: usar billing.v1_get_active_subscription';
COMMENT ON FUNCTION hub.get_unread_notification_count IS 'DEPRECATED: usar hub.v1_get_unread_count';

-- ─── Registro meta ───────────────────────────────────────────
INSERT INTO meta.function_versions (schema_name, function_name, version, is_current, migration_file)
VALUES
  ('stream', 'v1_get_contents', 1, true, '017_functions_v1.sql'),
  ('stream', 'v1_schedule_content', 1, true, '017_functions_v1.sql'),
  ('stream', 'v1_publish_content', 1, true, '017_functions_v1.sql'),
  ('billing', 'v1_get_active_subscription', 1, true, '017_functions_v1.sql'),
  ('billing', 'v1_activate_plan', 1, true, '017_functions_v1.sql'),
  ('core', 'v1_get_tenant_by_slug', 1, true, '017_functions_v1.sql'),
  ('core', 'v1_create_order', 1, true, '017_functions_v1.sql'),
  ('lifeflow', 'v1_calculate_score', 1, true, '017_functions_v1.sql'),
  ('lifeflow', 'v1_get_latest_score', 1, true, '017_functions_v1.sql'),
  ('ai', 'v1_register_usage', 1, true, '017_functions_v1.sql'),
  ('hub', 'v1_get_dashboard', 1, true, '017_functions_v1.sql'),
  ('hub', 'v1_get_unread_count', 1, true, '017_functions_v1.sql'),
  ('audit', 'v1_log_api_request', 1, true, '017_functions_v1.sql')
ON CONFLICT (schema_name, function_name, version) DO UPDATE
  SET is_current = EXCLUDED.is_current, migration_file = EXCLUDED.migration_file;

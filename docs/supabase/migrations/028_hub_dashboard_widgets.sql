-- 028 — Hub dashboard: métricas cross-producto para widgets Mi día
-- Ejecutar tras 027. Reemplaza hub.v1_get_dashboard con payload ampliado.

CREATE OR REPLACE FUNCTION hub.v1_get_dashboard(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = hub, stream, billing, lifeflow, core, akoenet, ai, dakinis_auth, pg_temp
AS $$
DECLARE
  v_result jsonb;
  v_score numeric;
BEGIN
  v_score := coalesce(
    lifeflow.v1_get_latest_score(p_user_id),
    lifeflow.v1_calculate_score(p_user_id)
  );

  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'email', (SELECT email FROM dakinis_auth.users WHERE id = p_user_id),
    'unread_notifications', hub.v1_get_unread_count(p_user_id),
    'scheduled_contents', (
      SELECT count(*)::int FROM stream.contents c
      WHERE c.user_id = p_user_id AND c.status = 'scheduled' AND c.deleted_at IS NULL
    ),
    'stream_scheduled_week', (
      SELECT count(*)::int FROM stream.contents c
      WHERE c.user_id = p_user_id AND c.deleted_at IS NULL
        AND c.scheduled_for >= date_trunc('week', now() AT TIME ZONE 'UTC')
        AND c.scheduled_for < date_trunc('week', now() AT TIME ZONE 'UTC') + interval '7 days'
    ),
    'stream_next_at', (
      SELECT min(c.scheduled_for) FROM stream.contents c
      WHERE c.user_id = p_user_id AND c.status = 'scheduled' AND c.deleted_at IS NULL
        AND c.scheduled_for >= now()
    ),
    'stream_upcoming', (
      SELECT count(*)::int FROM stream.contents c
      WHERE c.user_id = p_user_id AND c.deleted_at IS NULL
        AND c.scheduled_for >= now()
        AND c.scheduled_for < now() + interval '7 days'
    ),
    'lifeflow_score', v_score,
    'lifeflow_active_goals', (
      SELECT count(*)::int FROM lifeflow.goals g
      WHERE g.user_id = p_user_id AND g.status = 'active'
    ),
    'lifeflow_tx_month', (
      SELECT count(*)::int FROM lifeflow.transactions t
      WHERE t.user_id = p_user_id
        AND t.occurred_at >= date_trunc('month', now() AT TIME ZONE 'UTC')
    ),
    'lifeflow_coach_tip', (
      SELECT left(trim(coalesce(cs.response, '')), 120)
      FROM lifeflow.coach_sessions cs
      WHERE cs.user_id = p_user_id AND coalesce(trim(cs.response), '') <> ''
      ORDER BY cs.created_at DESC
      LIMIT 1
    ),
    'core_tenant_count', (
      SELECT count(*)::int FROM core.tenant_memberships tm WHERE tm.user_id = p_user_id
    ),
    'core_appointments_today', (
      SELECT count(*)::int FROM hub.timeline t
      WHERE t.user_id = p_user_id
        AND t.event_type ILIKE 'appointment%'
        AND t.occurred_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
    ),
    'core_orders_pending', (
      SELECT count(*)::int FROM hub.timeline t
      WHERE t.user_id = p_user_id
        AND t.event_type ILIKE 'order%'
        AND coalesce(t.payload->>'status', 'pending') = 'pending'
    ),
    'core_sales_today', (
      SELECT coalesce(sum((t.payload->>'amount')::numeric), 0)
      FROM hub.timeline t
      WHERE t.user_id = p_user_id
        AND t.event_type ILIKE 'sale%'
        AND t.occurred_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
    ),
    'akoenet_unread_dm', (
      SELECT count(*)::int
      FROM akoenet.direct_messages dm
      JOIN akoenet.direct_conversations dc ON dc.id = dm.conversation_id
      WHERE dm.sender_id <> p_user_id
        AND (dc.user_low_id = p_user_id OR dc.user_high_id = p_user_id)
        AND dm.created_at >= now() - interval '7 days'
    ),
    'akoenet_new_members_week', (
      SELECT count(*)::int
      FROM akoenet.server_members sm
      WHERE sm.server_id IN (
        SELECT server_id FROM akoenet.server_members WHERE user_id = p_user_id
      )
        AND sm.user_id <> p_user_id
        AND sm.joined_at >= now() - interval '7 days'
    ),
    'akoenet_online', (
      SELECT count(*)::int
      FROM akoenet.presence p
      WHERE p.status IN ('online', 'idle', 'dnd')
        AND p.user_id IN (
          SELECT sm.user_id FROM akoenet.server_members sm
          WHERE sm.server_id IN (
            SELECT server_id FROM akoenet.server_members WHERE user_id = p_user_id
          )
        )
    ),
    'ai_usage_week', (
      SELECT count(*)::int FROM ai.usage u
      WHERE u.user_id = p_user_id
        AND u.created_at >= now() - interval '7 days'
    ),
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
    ), '[]'::jsonb),
    'timeline', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'event_type', tl.event_type,
        'title', tl.title,
        'at', tl.occurred_at
      ) ORDER BY tl.occurred_at DESC)
      FROM (
        SELECT * FROM hub.timeline tl
        WHERE tl.user_id = p_user_id
        ORDER BY tl.occurred_at DESC
        LIMIT 8
      ) tl
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

INSERT INTO meta.function_versions (schema_name, function_name, version, is_current, migration_file)
VALUES ('hub', 'v1_get_dashboard', 1, true, '028_hub_dashboard_widgets.sql')
ON CONFLICT (schema_name, function_name, version) DO UPDATE
  SET migration_file = EXCLUDED.migration_file;

COMMENT ON FUNCTION hub.v1_get_dashboard IS
  'Payload Hub Mi día — stream, lifeflow, core tenants, akoenet, ai, timeline';

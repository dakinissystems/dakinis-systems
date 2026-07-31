-- Seed Hub Mi día KPIs for ≥2 products (LifeFlow + StreamAutomator).
-- Target: test user velezcampeon (a1000088-…088).
-- Run in Supabase SQL Editor after 028/048/051 and provision_test_user_velezcampeon.sql.
-- Idempotent: skips duplicate score / pilot stream rows / automation rule.

DO $$
DECLARE
  v_user_id uuid := 'a1000088-0000-4000-8000-000000000088'::uuid;
  v_server_id bigint;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dakinis_auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User % missing — run provision_test_user_velezcampeon.sql first', v_user_id;
  END IF;

  -- Ensure Mi día flag is on (027)
  UPDATE meta.feature_flags
  SET enabled = true, updated_at = now()
  WHERE flag_key = 'hub.mi_dia' AND enabled IS DISTINCT FROM true;

  -- ── LifeFlow: score (widget lifeflow-score / financial-health) ───────────
  INSERT INTO lifeflow.score_history (user_id, score, factors, recorded_at)
  SELECT
    v_user_id,
    72,
    jsonb_build_object('source', 'pilot_seed', 'note', 'Hub Mi día widgets ≥2 productos'),
    now()
  WHERE NOT EXISTS (
    SELECT 1
    FROM lifeflow.score_history
    WHERE user_id = v_user_id
      AND recorded_at > now() - interval '7 days'
  );

  INSERT INTO lifeflow.coach_sessions (user_id, prompt, response, metadata)
  SELECT
    v_user_id,
    'pilot_seed',
    'Mantén el ritmo: score estable y gastos revisados esta semana.',
    jsonb_build_object('source', 'pilot_seed')
  WHERE NOT EXISTS (
    SELECT 1 FROM lifeflow.coach_sessions
    WHERE user_id = v_user_id AND coalesce(metadata->>'source', '') = 'pilot_seed'
  );

  -- ── StreamAutomator: scheduled content + automation rule ────────────────
  INSERT INTO stream.contents (
    user_id, title, content, content_type, scheduled_for, platforms, status
  )
  SELECT
    v_user_id,
    'Pilot Hub — próximo directo',
    'Seed para widgets stream-next-live / stream-upcoming / stream-posts-week',
    'stream',
    now() + interval '2 days',
    '["twitch"]'::jsonb,
    'scheduled'
  WHERE NOT EXISTS (
    SELECT 1 FROM stream.contents c
    WHERE c.user_id = v_user_id
      AND c.deleted_at IS NULL
      AND c.title = 'Pilot Hub — próximo directo'
  );

  INSERT INTO stream.automation_rules (
    user_id, name, enabled, trigger_type, trigger_config, actions
  )
  SELECT
    v_user_id,
    'Pilot Hub IF/THEN',
    true,
    'schedule',
    jsonb_build_object('source', 'pilot_seed'),
    '[{"type":"announce","channel":"discord"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM stream.automation_rules ar
    WHERE ar.user_id = v_user_id AND ar.name = 'Pilot Hub IF/THEN'
  );

  -- ── AkoeNet XP (optional): only if user already belongs to a server ─────
  SELECT sm.server_id INTO v_server_id
  FROM akoenet.server_members sm
  WHERE sm.user_id = v_user_id
  ORDER BY sm.joined_at NULLS LAST
  LIMIT 1;

  IF v_server_id IS NOT NULL THEN
    INSERT INTO akoenet.member_xp (server_id, user_id, xp_total, level, coins)
    VALUES (v_server_id, v_user_id, 1250, 5, 40)
    ON CONFLICT (server_id, user_id) DO UPDATE SET
      xp_total = GREATEST(akoenet.member_xp.xp_total, EXCLUDED.xp_total),
      level = GREATEST(akoenet.member_xp.level, EXCLUDED.level),
      coins = GREATEST(akoenet.member_xp.coins, EXCLUDED.coins),
      updated_at = now();
  END IF;
END $$;

-- Verify dashboard KPIs for screenshot / smoke
SELECT
  hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'lifeflow_score' AS lifeflow_score,
  hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'stream_upcoming' AS stream_upcoming,
  hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'stream_automation_enabled' AS stream_automation_enabled,
  hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'akoenet_level' AS akoenet_level,
  hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'akoenet_xp_total' AS akoenet_xp_total;

SELECT enabled AS mi_dia_enabled
FROM meta.feature_flags
WHERE flag_key = 'hub.mi_dia';

SELECT hub.v1_get_user_hub_products('a1000088-0000-4000-8000-000000000088'::uuid) AS enabled_products;

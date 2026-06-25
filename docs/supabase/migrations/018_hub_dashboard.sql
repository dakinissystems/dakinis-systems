-- 018 — Hub dashboard: vista + materialized view + refresh
-- Consumir: SELECT * FROM hub.v1_get_dashboard($user_id) o hub.dashboard_stats

CREATE OR REPLACE VIEW hub.dashboard AS
SELECT
  u.id AS user_id,
  u.email,
  hub.v1_get_unread_count(u.id) AS unread_notifications,
  (SELECT count(*) FROM stream.contents c
   WHERE c.user_id = u.id AND c.status = 'scheduled' AND c.deleted_at IS NULL) AS scheduled_contents,
  lifeflow.v1_get_latest_score(u.id) AS lifeflow_score,
  (SELECT count(*) FROM core.tenant_memberships tm WHERE tm.user_id = u.id) AS tenant_count
FROM dakinis_auth.users u
WHERE u.is_disabled = false;

CREATE MATERIALIZED VIEW IF NOT EXISTS hub.dashboard_stats AS
SELECT
  u.id AS user_id,
  u.email,
  hub.v1_get_unread_count(u.id) AS unread_notifications,
  (SELECT count(*) FROM stream.contents c
   WHERE c.user_id = u.id AND c.status = 'scheduled' AND c.deleted_at IS NULL) AS scheduled_contents,
  coalesce(lifeflow.v1_get_latest_score(u.id), 0) AS lifeflow_score,
  now() AS refreshed_at
FROM dakinis_auth.users u
WHERE u.is_disabled = false
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_hub_dashboard_stats_user
  ON hub.dashboard_stats (user_id);

CREATE OR REPLACE FUNCTION hub.refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = hub, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY hub.dashboard_stats;
END;
$$;

COMMENT ON MATERIALIZED VIEW hub.dashboard_stats IS
  'Refrescar cada 5 min (pg_cron o Railway cron): SELECT hub.refresh_dashboard_stats();';
COMMENT ON VIEW hub.dashboard IS 'Vista en vivo; prod Hub preferir v1_get_dashboard o dashboard_stats';

-- Poblar MV inicial
REFRESH MATERIALIZED VIEW hub.dashboard_stats;

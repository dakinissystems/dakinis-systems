-- Seed LifeFlow score for Hub Mi dia widget (test user velezcampeon).
-- Run in Supabase SQL Editor after 030 app_user_links is healthy.

INSERT INTO lifeflow.score_history (user_id, score, factors, recorded_at)
SELECT
  'a1000088-0000-4000-8000-000000000088'::uuid,
  72,
  jsonb_build_object('source', 'pilot_seed', 'note', 'Hub lifeflow_score widget'),
  now()
WHERE EXISTS (
  SELECT 1 FROM dakinis_auth.users WHERE id = 'a1000088-0000-4000-8000-000000000088'::uuid
)
AND NOT EXISTS (
  SELECT 1
  FROM lifeflow.score_history
  WHERE user_id = 'a1000088-0000-4000-8000-000000000088'::uuid
    AND recorded_at > now() - interval '7 days'
);

-- Verify dashboard payload includes score
SELECT hub.v1_get_dashboard('a1000088-0000-4000-8000-000000000088'::uuid)->'lifeflow_score' AS lifeflow_score;

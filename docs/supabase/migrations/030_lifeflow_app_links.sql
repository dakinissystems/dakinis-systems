-- 030 — LifeFlow app ↔ platform user links (SQLite usr_* → dakinis_auth.users)

CREATE TABLE IF NOT EXISTS lifeflow.app_user_links (
  app_user_id text PRIMARY KEY,
  platform_user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  email text,
  linked_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform_user_id)
);

CREATE INDEX IF NOT EXISTS idx_lifeflow_app_links_platform
  ON lifeflow.app_user_links (platform_user_id);

COMMENT ON TABLE lifeflow.app_user_links IS
  'Puente LifeFlow API (SQLite) ↔ identidad dakinis_auth para Hub widgets y score_history';

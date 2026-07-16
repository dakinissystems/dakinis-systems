-- 049 — StreamAutomator automation execution logs (platform mirror; SA API also has Sequelize AutomationRuns)

CREATE TABLE IF NOT EXISTS stream.automation_runs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  rule_legacy_id integer,
  trigger_type text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stream_automation_runs_user_created
  ON stream.automation_runs (user_id, created_at DESC);

COMMENT ON TABLE stream.automation_runs IS
  'Execution log for SA automation rules (mirror; primary write is SA AutomationRuns table)';

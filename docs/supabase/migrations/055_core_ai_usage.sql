-- 055_core_ai_usage.sql
-- Core API (dakinis-core-api) expects public-name table ai_usage via search_path=dakinis_core_prod.
-- Missing in prod caused Sentry: relation "ai_usage" does not exist (tenant-intelligence / advisor quota).

CREATE TABLE IF NOT EXISTS dakinis_core_prod.ai_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  user_id TEXT,
  usage_type TEXT NOT NULL DEFAULT 'advisor',
  year_month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_business_month
  ON dakinis_core_prod.ai_usage (business_id, usage_type, year_month);

ALTER TABLE dakinis_core_prod.ai_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'dakinis_core_prod'
      AND tablename = 'ai_usage'
      AND policyname = 'ai_usage_deny_anon'
  ) THEN
    CREATE POLICY ai_usage_deny_anon ON dakinis_core_prod.ai_usage
      FOR ALL TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;

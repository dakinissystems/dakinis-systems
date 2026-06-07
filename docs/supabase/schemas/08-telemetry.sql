-- Telemetría de adopción por tenant (qué módulo usa cada usuario y cuánto tiempo)
-- Ejecutar tras 07-bos-platform.sql
-- Complementa tenant_ai_usage_log (solo consumo IA)

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_feature_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  user_id TEXT REFERENCES dakinis_core_prod.users(id),
  feature TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_business
  ON dakinis_core_prod.tenant_feature_usage(business_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature
  ON dakinis_core_prod.tenant_feature_usage(business_id, feature, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user
  ON dakinis_core_prod.tenant_feature_usage(business_id, user_id, started_at DESC);

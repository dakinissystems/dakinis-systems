-- Eventos de valor por tenant (acciones reales, no solo tiempo en pantalla)
-- Ejecutar tras 08-telemetry.sql

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_feature_events (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  user_id TEXT REFERENCES dakinis_core_prod.users(id),
  event_key TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_feature_events_business
  ON dakinis_core_prod.tenant_feature_events(business_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_events_key
  ON dakinis_core_prod.tenant_feature_events(business_id, event_key, occurred_at DESC);

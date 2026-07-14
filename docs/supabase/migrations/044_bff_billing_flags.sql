-- 044 — BFF + billing flags (Fase 1.3)
-- Ejecutar tras 043. Idempotente.

INSERT INTO meta.feature_flags (flag_key, name, enabled, description, scope, rollout_percentage)
VALUES
  ('billing.unified', 'Billing Dakinis unificado', false,
   'Nuevos usuarios usan billing central; SA Stripe legacy hasta migración', 'global', 0),
  ('hub.bff_cache', 'Hub BFF Redis cache', true,
   'Internal API cachea hub/dashboard/aggregated y workspace/summary', 'global', 100)
ON CONFLICT (flag_key) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 6, 'BFF flags + billing unified prep', '044_bff_billing_flags.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 6),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

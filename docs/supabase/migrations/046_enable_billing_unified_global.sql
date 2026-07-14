-- 046 — Activar billing unificado globalmente (greenfield, sin usuarios legacy SA)
-- Ejecutar tras 045. Idempotente.
-- Reversible: UPDATE meta.feature_flags SET enabled = false WHERE flag_key = 'billing.unified';

UPDATE meta.feature_flags
SET
  enabled = true,
  rollout_percentage = 100,
  description = 'Billing central activo — checkout SA via dakinis-billing (greenfield jul 2026)',
  updated_at = now()
WHERE flag_key = 'billing.unified';

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 7, 'Billing unified global enable', '046_enable_billing_unified_global.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 7),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

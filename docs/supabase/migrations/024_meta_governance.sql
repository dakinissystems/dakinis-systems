-- 024 — meta schema: gobernanza (schema versions, migrations, feature flags)
-- Ejecutar tras 023. Complementa meta.function_versions (016).

CREATE SCHEMA IF NOT EXISTS meta;

CREATE TABLE IF NOT EXISTS meta.schema_versions (
  id bigserial PRIMARY KEY,
  schema_name text NOT NULL UNIQUE,
  version integer NOT NULL DEFAULT 1,
  description text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  migration_file text
);

CREATE TABLE IF NOT EXISTS meta.migration_history (
  id bigserial PRIMARY KEY,
  migration_file text NOT NULL,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text DEFAULT current_user,
  success boolean NOT NULL DEFAULT true,
  notes text,
  UNIQUE (migration_file)
);

CREATE INDEX IF NOT EXISTS idx_meta_migration_applied
  ON meta.migration_history (applied_at DESC);

CREATE TABLE IF NOT EXISTS meta.feature_flags (
  id bigserial PRIMARY KEY,
  flag_key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  scope text NOT NULL DEFAULT 'global',
  tenant_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_feature_flags_scope
  ON meta.feature_flags (scope, tenant_id) WHERE tenant_id IS NOT NULL;

COMMENT ON TABLE meta.schema_versions IS 'Versión lógica por schema Supabase';
COMMENT ON TABLE meta.migration_history IS 'Auditoría de migraciones aplicadas en prod';
COMMENT ON TABLE meta.feature_flags IS 'Flags platform/product; scope: global | tenant | product';

-- Seed inicial (idempotente)
INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES
  ('dakinis_auth', 1, 'Identity platform', '002_dakinis_auth.sql'),
  ('billing', 1, 'Billing platform prod', '004_billing.sql'),
  ('ai', 1, 'AI platform', '008_ai.sql'),
  ('hub', 1, 'Hub platform', '009_hub.sql'),
  ('meta', 1, 'Governance tables', '024_meta_governance.sql')
ON CONFLICT (schema_name) DO NOTHING;

INSERT INTO meta.feature_flags (flag_key, enabled, description, scope)
VALUES
  ('billing.e2e_live', false, 'Checkout Live E2E Core', 'global'),
  ('hub.mi_dia', false, 'Hub dashboard Mi día first', 'global'),
  ('knowledge.ingest', false, 'Knowledge document ingest', 'global')
ON CONFLICT (flag_key) DO NOTHING;

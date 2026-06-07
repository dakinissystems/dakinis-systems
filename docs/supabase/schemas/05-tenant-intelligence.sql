-- Dakinis One — Tenant inteligente (sucursales, módulos, webhooks)
-- Ejecutar en Supabase tras 04-crm-core.sql. Schema: dakinis_core_prod

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_branches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  is_default BOOLEAN NOT NULL DEFAULT false,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_branches_business ON dakinis_core_prod.tenant_branches(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_module_overrides (
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  module_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, module_key)
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_api_key_webhooks (
  id TEXT PRIMARY KEY,
  api_key_value TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_api_keys(key_value),
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  webhook_url TEXT NOT NULL,
  events_json TEXT NOT NULL DEFAULT '[]',
  secret TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_business ON dakinis_core_prod.tenant_api_key_webhooks(business_id);

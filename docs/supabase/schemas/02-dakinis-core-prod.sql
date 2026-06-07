-- Dakinis One Core — PRODUCCIÓN (Supabase)
-- Proyecto: Supabase de Core (mismo DATABASE_URL que Railway), NO AkoeNet.
-- Ejecutar tras 00-bootstrap-schemas.sql (mismo proyecto que Railway Core)
-- Railway Core Back: POSTGRES_SCHEMA=dakinis_core_prod  CORE_SEED_DEMO=false
-- Tablas con schema explícito (el SQL Editor de Supabase no aplica SET search_path de forma fiable).

CREATE SCHEMA IF NOT EXISTS dakinis_core_prod;

CREATE TABLE IF NOT EXISTS dakinis_core_prod.business (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  config_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_api_keys (
  key_value TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  role TEXT NOT NULL CHECK (role IN ('full-access', 'read-only'))
);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_business ON dakinis_core_prod.tenant_api_keys(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.users (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  platform_user_id TEXT UNIQUE,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_business ON dakinis_core_prod.users(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  entity TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tenant_records_business_entity ON dakinis_core_prod.tenant_records(business_id, entity);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_supply_deliveries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  supplier TEXT NOT NULL,
  arrival_window TEXT NOT NULL,
  contents TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Programado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supply_deliveries_business ON dakinis_core_prod.tenant_supply_deliveries(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_supply_alerts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  title TEXT NOT NULL,
  product_ref TEXT NOT NULL DEFAULT '',
  condition_text TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supply_alerts_business ON dakinis_core_prod.tenant_supply_alerts(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_stock_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'u',
  quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  min_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_stock_items_business ON dakinis_core_prod.tenant_stock_items(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_recipes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  output_label TEXT NOT NULL DEFAULT '',
  output_quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
  output_unit TEXT NOT NULL DEFAULT 'u',
  lines_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_recipes_business ON dakinis_core_prod.tenant_recipes(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_production_batches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  label TEXT NOT NULL DEFAULT '',
  plan_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_production_batches_business ON dakinis_core_prod.tenant_production_batches(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_stock_movements (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  stock_item_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_stock_items(id),
  delta DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON dakinis_core_prod.tenant_stock_movements(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_restaurant_profile (
  business_id TEXT PRIMARY KEY REFERENCES dakinis_core_prod.business(id),
  public_token TEXT UNIQUE NOT NULL,
  venue_name TEXT NOT NULL DEFAULT '',
  allergies_json TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_audit_logs (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES dakinis_core_prod.business(id),
  actor_user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON dakinis_core_prod.tenant_audit_logs(business_id, created_at DESC);

-- Catálogo Hub/Landing editable desde panel plataforma (GET/PUT /api/platform/catalog)
CREATE TABLE IF NOT EXISTS dakinis_core_prod.platform_kv (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

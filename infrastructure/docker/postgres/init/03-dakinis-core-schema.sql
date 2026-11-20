-- Dakinis Core API — schema dakinis_core (PostgreSQL)
CREATE SCHEMA IF NOT EXISTS dakinis_core;
SET search_path TO dakinis_core, public;

CREATE TABLE IF NOT EXISTS business (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  config_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_api_keys (
  key_value TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  role TEXT NOT NULL CHECK (role IN ('full-access', 'read-only'))
);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_business ON tenant_api_keys(business_id);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  platform_user_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);

CREATE TABLE IF NOT EXISTS tenant_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  entity TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tenant_records_business_entity ON tenant_records(business_id, entity);

CREATE TABLE IF NOT EXISTS tenant_supply_deliveries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  supplier TEXT NOT NULL,
  arrival_window TEXT NOT NULL,
  contents TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Programado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supply_deliveries_business ON tenant_supply_deliveries(business_id);

CREATE TABLE IF NOT EXISTS tenant_supply_alerts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  title TEXT NOT NULL,
  product_ref TEXT NOT NULL DEFAULT '',
  condition_text TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supply_alerts_business ON tenant_supply_alerts(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'u',
  quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  min_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_stock_items_business ON tenant_stock_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_recipes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  output_label TEXT NOT NULL DEFAULT '',
  output_quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
  output_unit TEXT NOT NULL DEFAULT 'u',
  lines_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_recipes_business ON tenant_recipes(business_id);

CREATE TABLE IF NOT EXISTS tenant_production_batches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  label TEXT NOT NULL DEFAULT '',
  plan_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_production_batches_business ON tenant_production_batches(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_movements (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  stock_item_id TEXT NOT NULL REFERENCES tenant_stock_items(id),
  delta DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON tenant_stock_movements(business_id);

CREATE TABLE IF NOT EXISTS tenant_restaurant_profile (
  business_id TEXT PRIMARY KEY REFERENCES business(id),
  public_token TEXT UNIQUE NOT NULL,
  venue_name TEXT NOT NULL DEFAULT '',
  allergies_json TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

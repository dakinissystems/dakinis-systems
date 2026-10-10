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

-- Cuota advisor / tenant-intelligence (Core API · search_path)
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

-- Hospitality floor / menu / delivery (059)
CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_menu_categories (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON dakinis_core_prod.tenant_menu_categories(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_menu_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  category_id TEXT REFERENCES dakinis_core_prod.tenant_menu_categories(id),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  station TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON dakinis_core_prod.tenant_menu_items(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_menu_prices (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  item_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_menu_items(id),
  channel TEXT NOT NULL DEFAULT 'salon',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (business_id, item_id, channel)
);
CREATE INDEX IF NOT EXISTS idx_menu_prices_business ON dakinis_core_prod.tenant_menu_prices(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_menu_modifiers (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  allergen_tags_json TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_menu_modifiers_business ON dakinis_core_prod.tenant_menu_modifiers(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_menu_item_modifiers (
  item_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_menu_items(id),
  modifier_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_menu_modifiers(id),
  required INTEGER NOT NULL DEFAULT 0,
  max_qty INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (item_id, modifier_id)
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_tables (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  zone TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  seats INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'libre',
  meta_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tables_business ON dakinis_core_prod.tenant_tables(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_table_sessions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  table_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_tables(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  cart_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  waiter_user_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_table_sessions_business ON dakinis_core_prod.tenant_table_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_open ON dakinis_core_prod.tenant_table_sessions(business_id, table_id, closed_at);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_price_lists (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0,
  markup_pct DOUBLE PRECISION,
  markup_fixed_cents INTEGER,
  round_to_cents INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE (business_id, key)
);
CREATE INDEX IF NOT EXISTS idx_price_lists_business ON dakinis_core_prod.tenant_price_lists(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_price_list_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  price_list_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_price_lists(id),
  item_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_menu_items(id),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (price_list_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_price_list_items_business ON dakinis_core_prod.tenant_price_list_items(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_delivery_integrations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  provider TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  api_key TEXT,
  refresh_token TEXT,
  store_id TEXT,
  location TEXT,
  webhook_secret TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE (business_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_delivery_integrations_business ON dakinis_core_prod.tenant_delivery_integrations(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_delivery_jobs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  provider TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_business ON dakinis_core_prod.tenant_delivery_jobs(business_id, status);

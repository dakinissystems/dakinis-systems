-- Dakinis Core: lotes, caducidades y ubicaciones (nevera, congelador, almacén).
-- Ejecutar en Supabase tras 02-dakinis-core-prod.sql. Schema: dakinis_core_prod

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_stock_locations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'storage' CHECK (kind IN ('fridge', 'freezer', 'storage', 'floor', 'prep')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_stock_locations_business ON dakinis_core_prod.tenant_stock_locations(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_stock_lots (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id) ON DELETE CASCADE,
  label_code TEXT NOT NULL,
  stock_item_id TEXT REFERENCES dakinis_core_prod.tenant_stock_items(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_barcode TEXT NOT NULL DEFAULT '',
  supplier_lot TEXT NOT NULL DEFAULT '',
  expiry_date DATE NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  quantity_remaining DOUBLE PRECISION NOT NULL,
  location_id TEXT REFERENCES dakinis_core_prod.tenant_stock_locations(id) ON DELETE SET NULL,
  supplier TEXT NOT NULL DEFAULT '',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'waste')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, label_code)
);

CREATE INDEX IF NOT EXISTS idx_stock_lots_business_expiry ON dakinis_core_prod.tenant_stock_lots(business_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_lots_business_status ON dakinis_core_prod.tenant_stock_lots(business_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_lots_location ON dakinis_core_prod.tenant_stock_lots(business_id, location_id);

ALTER TABLE dakinis_core_prod.tenant_stock_movements ADD COLUMN IF NOT EXISTS lot_id TEXT;
ALTER TABLE dakinis_core_prod.tenant_stock_items ADD COLUMN IF NOT EXISTS barcode TEXT NOT NULL DEFAULT '';

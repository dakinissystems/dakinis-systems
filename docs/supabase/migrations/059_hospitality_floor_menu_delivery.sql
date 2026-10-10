-- 059_hospitality_floor_menu_delivery.sql
-- Floor / carta / tarifas / delivery para Core API (hospitality).
-- Corrige Sentry: relation "tenant_tables|tenant_price_lists|tenant_delivery_*" does not exist.
-- Idempotente. Solo schemas Core que ya tengan `business`.

DO $$
DECLARE
  sch text;
  schemas text[] := ARRAY['dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev'];
BEGIN
  FOREACH sch IN ARRAY schemas
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = sch) THEN
      RAISE NOTICE 'Schema % no existe; omitiendo hospitality.', sch;
      CONTINUE;
    END IF;

    IF to_regclass(format('%I.business', sch)) IS NULL THEN
      RAISE NOTICE 'Schema % sin tabla business; omitiendo hospitality.', sch;
      CONTINUE;
    END IF;

    -- Menu
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_menu_categories (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON %I.tenant_menu_categories(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_menu_items (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        category_id TEXT REFERENCES %I.tenant_menu_categories(id),
        name TEXT NOT NULL,
        name_es TEXT NOT NULL DEFAULT '''',
        description TEXT NOT NULL DEFAULT '''',
        active INTEGER NOT NULL DEFAULT 1,
        station TEXT,
        meta_json TEXT NOT NULL DEFAULT ''{}''
      )', sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_items_business ON %I.tenant_menu_items(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_menu_prices (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        item_id TEXT NOT NULL REFERENCES %I.tenant_menu_items(id),
        channel TEXT NOT NULL DEFAULT ''salon'',
        price_cents INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT ''EUR'',
        UNIQUE (business_id, item_id, channel)
      )', sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_prices_business ON %I.tenant_menu_prices(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_menu_modifiers (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL DEFAULT 0,
        allergen_tags_json TEXT NOT NULL DEFAULT ''[]''
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_modifiers_business ON %I.tenant_menu_modifiers(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_menu_item_modifiers (
        item_id TEXT NOT NULL REFERENCES %I.tenant_menu_items(id),
        modifier_id TEXT NOT NULL REFERENCES %I.tenant_menu_modifiers(id),
        required INTEGER NOT NULL DEFAULT 0,
        max_qty INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (item_id, modifier_id)
      )', sch, sch, sch);

    -- Floor
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_tables (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        zone TEXT NOT NULL DEFAULT '''',
        label TEXT NOT NULL,
        x DOUBLE PRECISION NOT NULL DEFAULT 0,
        y DOUBLE PRECISION NOT NULL DEFAULT 0,
        seats INTEGER NOT NULL DEFAULT 2,
        status TEXT NOT NULL DEFAULT ''libre'',
        meta_json TEXT NOT NULL DEFAULT ''{}''
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_tables_business ON %I.tenant_tables(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_table_sessions (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        table_id TEXT NOT NULL REFERENCES %I.tenant_tables(id),
        opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        closed_at TIMESTAMPTZ,
        cart_json TEXT NOT NULL DEFAULT ''[]'',
        notes TEXT NOT NULL DEFAULT '''',
        waiter_user_id TEXT
      )', sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_table_sessions_business ON %I.tenant_table_sessions(business_id)',
      sch
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_table_sessions_open ON %I.tenant_table_sessions(business_id, table_id, closed_at)',
      sch
    );

    -- Price lists
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_price_lists (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        channel TEXT NOT NULL DEFAULT '''',
        is_default INTEGER NOT NULL DEFAULT 0,
        markup_pct DOUBLE PRECISION,
        markup_fixed_cents INTEGER,
        round_to_cents INTEGER,
        active INTEGER NOT NULL DEFAULT 1,
        UNIQUE (business_id, key)
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_price_lists_business ON %I.tenant_price_lists(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_price_list_items (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        price_list_id TEXT NOT NULL REFERENCES %I.tenant_price_lists(id),
        item_id TEXT NOT NULL REFERENCES %I.tenant_menu_items(id),
        price_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT ''EUR'',
        UNIQUE (price_list_id, item_id)
      )', sch, sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_price_list_items_business ON %I.tenant_price_list_items(business_id)',
      sch
    );

    -- Delivery
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_delivery_integrations (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        provider TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 0,
        api_key TEXT,
        refresh_token TEXT,
        store_id TEXT,
        location TEXT,
        webhook_secret TEXT,
        status TEXT NOT NULL DEFAULT ''disconnected'',
        last_sync_at TIMESTAMPTZ,
        last_error TEXT,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        UNIQUE (business_id, provider)
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_delivery_integrations_business ON %I.tenant_delivery_integrations(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_delivery_jobs (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        provider TEXT NOT NULL,
        job_type TEXT NOT NULL,
        payload_json TEXT NOT NULL DEFAULT ''{}'',
        status TEXT NOT NULL DEFAULT ''pending'',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_delivery_jobs_business ON %I.tenant_delivery_jobs(business_id, status)',
      sch
    );

    RAISE NOTICE 'Hospitality floor/menu/delivery OK en %.', sch;
  END LOOP;
END $$;

-- 057_tenant_crm_core.sql
-- CRM contacts / companies / activities for Core API (/api/v1/crm/*).
-- Idempotente. Solo crea en schemas Core que ya tengan `business`.

DO $$
DECLARE
  sch text;
  schemas text[] := ARRAY['dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev'];
BEGIN
  FOREACH sch IN ARRAY schemas
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = sch) THEN
      RAISE NOTICE 'Schema % no existe; omitiendo CRM.', sch;
      CONTINUE;
    END IF;

    IF to_regclass(format('%I.business', sch)) IS NULL THEN
      RAISE NOTICE 'Schema % sin tabla business; omitiendo CRM.', sch;
      CONTINUE;
    END IF;

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_crm_companies (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        name TEXT NOT NULL,
        vat_number TEXT NOT NULL DEFAULT '''',
        phone TEXT NOT NULL DEFAULT '''',
        email TEXT NOT NULL DEFAULT '''',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_crm_companies_business ON %I.tenant_crm_companies(business_id)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_crm_contacts (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        company_id TEXT REFERENCES %I.tenant_crm_companies(id),
        first_name TEXT NOT NULL DEFAULT '''',
        last_name TEXT NOT NULL DEFAULT '''',
        phone TEXT NOT NULL DEFAULT '''',
        email TEXT NOT NULL DEFAULT '''',
        source TEXT NOT NULL DEFAULT '''',
        tags_json TEXT NOT NULL DEFAULT ''[]'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_business ON %I.tenant_crm_contacts(business_id)',
      sch
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON %I.tenant_crm_contacts(business_id, phone)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_crm_activities (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        contact_id TEXT NOT NULL REFERENCES %I.tenant_crm_contacts(id),
        type TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '''',
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch, sch);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON %I.tenant_crm_activities(contact_id, created_at DESC)',
      sch
    );

    RAISE NOTICE 'CRM tables OK en %.', sch;
  END LOOP;
END $$;

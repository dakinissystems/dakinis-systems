-- 060_fiscal_invoicing_verifactu.sql
-- Módulo fiscal independiente (base VERI*FACTU): settings, facturas encadenadas, eventos.
-- Idempotente. Solo schemas Core que ya tengan `business`.
-- NO sustituye la declaración responsable AEAT ni la certificación del software.

DO $$
DECLARE
  sch text;
  schemas text[] := ARRAY['dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev'];
BEGIN
  FOREACH sch IN ARRAY schemas
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = sch) THEN
      RAISE NOTICE 'Schema % no existe; omitiendo fiscal.', sch;
      CONTINUE;
    END IF;

    IF to_regclass(format('%I.business', sch)) IS NULL THEN
      RAISE NOTICE 'Schema % sin tabla business; omitiendo fiscal.', sch;
      CONTINUE;
    END IF;

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_fiscal_settings (
        business_id TEXT PRIMARY KEY REFERENCES %I.business(id),
        enabled INTEGER NOT NULL DEFAULT 0,
        mode TEXT NOT NULL DEFAULT ''disabled''
          CHECK (mode IN (''disabled'', ''verifactu'', ''no_verifactu'')),
        series TEXT NOT NULL DEFAULT ''A'',
        issuer_name TEXT NOT NULL DEFAULT '''',
        issuer_tax_id TEXT NOT NULL DEFAULT '''',
        issuer_address TEXT NOT NULL DEFAULT '''',
        default_tax_rate DOUBLE PRECISION NOT NULL DEFAULT 10,
        software_id TEXT NOT NULL DEFAULT ''dakinis-one-fiscal'',
        software_version TEXT NOT NULL DEFAULT ''0.1.0'',
        declaration_ref TEXT NOT NULL DEFAULT '''',
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch);

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_fiscal_invoices (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        series TEXT NOT NULL,
        number INTEGER NOT NULL,
        invoice_number TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT ''standard''
          CHECK (kind IN (''standard'', ''simplified'', ''rectificative'')),
        status TEXT NOT NULL DEFAULT ''issued''
          CHECK (status IN (''draft'', ''issued'', ''rectified'', ''void'', ''submitted'', ''rejected'')),
        customer_name TEXT NOT NULL DEFAULT '''',
        customer_tax_id TEXT NOT NULL DEFAULT '''',
        customer_address TEXT NOT NULL DEFAULT '''',
        lines_json TEXT NOT NULL DEFAULT ''[]'',
        base_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        tax_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
        tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT ''EUR'',
        issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        record_hash TEXT NOT NULL,
        previous_record_hash TEXT NOT NULL DEFAULT '''',
        qr_payload TEXT NOT NULL DEFAULT '''',
        qr_url TEXT NOT NULL DEFAULT '''',
        rectifies_id TEXT REFERENCES %I.tenant_fiscal_invoices(id),
        hospitality_invoice_id TEXT,
        aeat_submission_id TEXT,
        aeat_submitted_at TIMESTAMPTZ,
        aeat_status TEXT NOT NULL DEFAULT '''',
        immutable INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (business_id, series, number)
      )', sch, sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_business ON %I.tenant_fiscal_invoices(business_id, issued_at DESC)',
      sch
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_hash ON %I.tenant_fiscal_invoices(business_id, record_hash)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_fiscal_events (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        invoice_id TEXT REFERENCES %I.tenant_fiscal_invoices(id),
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL DEFAULT ''{}'',
        record_hash TEXT NOT NULL DEFAULT '''',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_fiscal_events_business ON %I.tenant_fiscal_events(business_id, created_at DESC)',
      sch
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_fiscal_events_invoice ON %I.tenant_fiscal_events(invoice_id, created_at ASC)',
      sch
    );

    RAISE NOTICE 'Fiscal VERI*FACTU base aplicada en %.', sch;
  END LOOP;
END $$;

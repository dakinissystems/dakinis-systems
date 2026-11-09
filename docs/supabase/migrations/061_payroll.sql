-- 061_payroll.sql
-- Nómina genérica: el mercado entra como datos (jurisdicción, conceptos, tramos).
-- Importes en unidades mínimas (céntimos, yen, …). Idempotente.
-- No incluye tablas legales de ningún país.

DO $$
DECLARE
  sch text;
  tbl text;
  schemas text[] := ARRAY['dakinis_core', 'dakinis_core_prod', 'dakinis_core_dev'];
  tables text[] := ARRAY[
    'tenant_payroll_settings',
    'tenant_payroll_jurisdictions',
    'tenant_payroll_components',
    'tenant_payroll_brackets',
    'tenant_payroll_engagements',
    'tenant_payroll_periods',
    'tenant_payroll_runs',
    'tenant_payroll_slips',
    'tenant_payroll_payments'
  ];
BEGIN
  FOREACH sch IN ARRAY schemas
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = sch) THEN
      RAISE NOTICE 'Schema % no existe; omitiendo nómina.', sch;
      CONTINUE;
    END IF;

    IF to_regclass(format('%I.business', sch)) IS NULL THEN
      RAISE NOTICE 'Schema % sin tabla business; omitiendo nómina.', sch;
      CONTINUE;
    END IF;

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_settings (
        business_id TEXT PRIMARY KEY REFERENCES %I.business(id),
        enabled BOOLEAN NOT NULL DEFAULT false,
        default_currency TEXT NOT NULL DEFAULT ''EUR'',
        default_jurisdiction TEXT NOT NULL DEFAULT ''GENERIC'',
        rounding TEXT NOT NULL DEFAULT ''half_up''
          CHECK (rounding IN (''half_up'', ''half_even'')),
        exponent INTEGER NOT NULL DEFAULT 2 CHECK (exponent BETWEEN 0 AND 6),
        allow_negative_net BOOLEAN NOT NULL DEFAULT false,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch);

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_jurisdictions (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        code TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '''',
        currency TEXT NOT NULL,
        exponent INTEGER NOT NULL DEFAULT 2 CHECK (exponent BETWEEN 0 AND 6),
        rounding TEXT NOT NULL DEFAULT ''half_up''
          CHECK (rounding IN (''half_up'', ''half_even'')),
        identifier_labels_json TEXT NOT NULL DEFAULT ''{}'',
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (business_id, code)
      )', sch, sch);

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_components (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        jurisdiction_code TEXT NOT NULL DEFAULT '''',
        code TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '''',
        kind TEXT NOT NULL
          CHECK (kind IN (''earning'', ''deduction'', ''employer_contribution'', ''informational'')),
        method TEXT NOT NULL
          CHECK (method IN (''contract'', ''flat'', ''percent'', ''brackets'')),
        party TEXT NOT NULL DEFAULT ''worker''
          CHECK (party IN (''worker'', ''employer'', ''info'')),
        base_code TEXT NOT NULL DEFAULT ''gross'',
        rate_bps INTEGER,
        amount_minor BIGINT,
        floor_minor BIGINT,
        ceiling_minor BIGINT,
        sequence INTEGER NOT NULL DEFAULT 100,
        taxable BOOLEAN NOT NULL DEFAULT true,
        reduces_taxable BOOLEAN NOT NULL DEFAULT false,
        effective_from DATE NOT NULL DEFAULT DATE ''1970-01-01'',
        effective_to DATE,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (business_id, jurisdiction_code, code, effective_from)
      )', sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_payroll_components_business ON %I.tenant_payroll_components(business_id, jurisdiction_code)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_brackets (
        id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL REFERENCES %I.tenant_payroll_components(id) ON DELETE CASCADE,
        sequence INTEGER NOT NULL,
        up_to_minor BIGINT,
        rate_bps INTEGER NOT NULL CHECK (rate_bps >= 0),
        UNIQUE (component_id, sequence)
      )', sch, sch);

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_engagements (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        worker_ref TEXT NOT NULL,
        display_name TEXT NOT NULL DEFAULT '''',
        worker_kind TEXT NOT NULL DEFAULT ''employee''
          CHECK (worker_kind IN (''employee'', ''contractor'', ''casual'', ''director'')),
        jurisdiction_code TEXT NOT NULL DEFAULT ''GENERIC'',
        currency TEXT NOT NULL,
        pay_basis TEXT NOT NULL
          CHECK (pay_basis IN (''salary'', ''hourly'', ''daily'', ''piece'')),
        amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
        pay_frequency TEXT NOT NULL DEFAULT ''monthly''
          CHECK (pay_frequency IN (''weekly'', ''biweekly'', ''semimonthly'', ''monthly'', ''four_weekly'', ''custom'')),
        proration TEXT NOT NULL DEFAULT ''none''
          CHECK (proration IN (''none'', ''calendar_days'')),
        external_ids_json TEXT NOT NULL DEFAULT ''{}'',
        active BOOLEAN NOT NULL DEFAULT true,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_payroll_engagements_worker ON %I.tenant_payroll_engagements(business_id, worker_ref)',
      sch
    );
    EXECUTE format(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_engagement_one_active ON %I.tenant_payroll_engagements(business_id, worker_ref) WHERE active',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_periods (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        jurisdiction_code TEXT NOT NULL DEFAULT '''',
        frequency TEXT NOT NULL,
        start_on DATE NOT NULL,
        end_on DATE NOT NULL,
        pay_on DATE NOT NULL,
        status TEXT NOT NULL DEFAULT ''open''
          CHECK (status IN (''open'', ''calculated'', ''approved'', ''paid'', ''void'')),
        CHECK (end_on >= start_on),
        UNIQUE (business_id, jurisdiction_code, start_on, end_on)
      )', sch, sch);

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_runs (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        period_id TEXT NOT NULL REFERENCES %I.tenant_payroll_periods(id),
        status TEXT NOT NULL DEFAULT ''draft''
          CHECK (status IN (''draft'', ''calculated'', ''approved'', ''paid'', ''void'')),
        calculated_at TIMESTAMPTZ,
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON %I.tenant_payroll_runs(period_id, created_at DESC)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_slips (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        run_id TEXT NOT NULL REFERENCES %I.tenant_payroll_runs(id),
        engagement_id TEXT NOT NULL REFERENCES %I.tenant_payroll_engagements(id),
        currency TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT ''calculated''
          CHECK (status IN (''calculated'', ''approved'', ''paid'', ''void'')),
        gross_minor BIGINT NOT NULL,
        deduction_minor BIGINT NOT NULL,
        net_minor BIGINT NOT NULL,
        employer_minor BIGINT NOT NULL,
        informational_minor BIGINT NOT NULL DEFAULT 0,
        lines_json TEXT NOT NULL DEFAULT ''[]'',
        inputs_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (run_id, engagement_id)
      )', sch, sch, sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_payroll_slips_business ON %I.tenant_payroll_slips(business_id, created_at DESC)',
      sch
    );

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.tenant_payroll_payments (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES %I.business(id),
        slip_id TEXT NOT NULL REFERENCES %I.tenant_payroll_slips(id),
        method TEXT NOT NULL
          CHECK (method IN (''bank_transfer'', ''cash'', ''check'', ''wallet'', ''other'')),
        amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
        currency TEXT NOT NULL,
        instrument_ref TEXT NOT NULL DEFAULT '''',
        status TEXT NOT NULL DEFAULT ''pending''
          CHECK (status IN (''pending'', ''submitted'', ''settled'', ''failed'', ''void'')),
        settled_at TIMESTAMPTZ,
        meta_json TEXT NOT NULL DEFAULT ''{}'',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', sch, sch, sch);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_payroll_payments_slip ON %I.tenant_payroll_payments(slip_id)',
      sch
    );

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      FOREACH tbl IN ARRAY tables
      LOOP
        IF to_regclass(format('%I.%I', sch, tbl)) IS NULL THEN
          CONTINUE;
        END IF;
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', sch, tbl);
        BEGIN
          EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', sch, tbl);
        EXCEPTION
          WHEN insufficient_privilege THEN
            RAISE NOTICE 'FORCE RLS skip %.% (privilegio)', sch, tbl;
        END;
        EXECUTE format(
          'DROP POLICY IF EXISTS dakinis_block_anon_authenticated ON %I.%I',
          sch,
          tbl
        );
        EXECUTE format(
          'CREATE POLICY dakinis_block_anon_authenticated ON %I.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
          sch,
          tbl
        );
      END LOOP;
    END IF;

    RAISE NOTICE 'Nómina aplicada en %.', sch;
  END LOOP;
END $$;

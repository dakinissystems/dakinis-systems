-- 058 — Organization hierarchy: ventures, locations, domains
-- Ejecutar tras 057. Idempotente.
-- Mapping: meta.workspaces = Organization (billing) · ventures = emprendimientos · locations → Core business

CREATE TABLE IF NOT EXISTS meta.ventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL DEFAULT 'restaurant',
  status text NOT NULL DEFAULT 'active',
  brand_domain text,
  logo_url text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, slug),
  CONSTRAINT meta_ventures_type_check
    CHECK (type IN ('restaurant', 'cafe', 'ecommerce', 'services', 'other')),
  CONSTRAINT meta_ventures_status_check
    CHECK (status IN ('active', 'paused', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_meta_ventures_workspace
  ON meta.ventures (workspace_id) WHERE status = 'active';

COMMENT ON TABLE meta.ventures IS
  'Emprendimientos/marcas bajo un workspace (organización). type=restaurant etc.';

CREATE TABLE IF NOT EXISTS meta.venture_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES meta.ventures(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  address text,
  city text,
  country text NOT NULL DEFAULT 'ES',
  timezone text NOT NULL DEFAULT 'Europe/Madrid',
  -- Enlace a Core ERP (dakinis_core_prod.business.slug o business.id)
  core_business_slug text,
  core_business_id text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venture_id, slug),
  CONSTRAINT meta_venture_locations_status_check
    CHECK (status IN ('active', 'paused', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_meta_venture_locations_venture
  ON meta.venture_locations (venture_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_meta_venture_locations_core_slug
  ON meta.venture_locations (lower(core_business_slug))
  WHERE core_business_slug IS NOT NULL;

COMMENT ON TABLE meta.venture_locations IS
  'Locales físicos/operativos. core_business_slug enlaza el TPV/Core del local.';

CREATE TABLE IF NOT EXISTS meta.organization_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES meta.ventures(id) ON DELETE CASCADE,
  domain text NOT NULL,
  kind text NOT NULL DEFAULT 'brand',
  primary_domain boolean NOT NULL DEFAULT false,
  mail_provider text NOT NULL DEFAULT 'google_workspace',
  -- Alias funcionales: [{ "local": "hola", "routes_to": ["christian@…"] }, …]
  email_aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
  dns_status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, domain),
  CONSTRAINT meta_org_domains_kind_check
    CHECK (kind IN ('corporate', 'brand', 'redirect')),
  CONSTRAINT meta_org_domains_dns_check
    CHECK (dns_status IN ('pending', 'verified', 'mx_ok', 'error')),
  CONSTRAINT meta_org_domains_domain_lower_check
    CHECK (domain = lower(domain))
);

CREATE INDEX IF NOT EXISTS idx_meta_org_domains_workspace
  ON meta.organization_domains (workspace_id);

COMMENT ON TABLE meta.organization_domains IS
  'Dominios y aliases de correo del cliente (Workspace/CF). No son cuentas Dakinis.';

-- Preferencias de contexto Hub (último venture/location elegido por usuario)
CREATE TABLE IF NOT EXISTS meta.user_org_context (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES meta.ventures(id) ON DELETE SET NULL,
  location_id uuid REFERENCES meta.venture_locations(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 9, 'Org ventures locations domains', '058_org_venture_location.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 9),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

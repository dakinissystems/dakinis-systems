-- 003 — Core tenancy (schema core)
-- Fuente de verdad de tenants/slug/plan. ERP sigue en dakinis_core_prod hasta cutover.
-- tenant_id en stream/akoenet es UUID sin FK cross-schema (validar en API).

CREATE TABLE IF NOT EXISTS core.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  legacy_bigint bigint UNIQUE,
  legacy_business_id text UNIQUE,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_core_tenants_slug ON core.tenants (lower(slug));
CREATE INDEX IF NOT EXISTS idx_core_tenants_legacy_bigint ON core.tenants (legacy_bigint);

CREATE TABLE IF NOT EXISTS core.tenant_memberships (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON core.tenant_memberships (tenant_id);

-- Usuario dentro de un tenant (rol ERP) — distinto de dakinis_auth.users
CREATE TABLE IF NOT EXISTS core.tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  platform_user_id uuid,
  must_change_password boolean NOT NULL DEFAULT false,
  totp_secret text,
  totp_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON core.tenant_users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_auth ON core.tenant_users (auth_user_id);

CREATE TABLE IF NOT EXISTS core.feature_flags (
  id bigserial PRIMARY KEY,
  tenant_id uuid REFERENCES core.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key)
);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant ON core.feature_flags (tenant_id);

-- Puente public.tenants (bigint) → core.tenants (uuid)
CREATE TABLE IF NOT EXISTS core.tenant_legacy_map (
  legacy_bigint bigint PRIMARY KEY,
  tenant_id uuid NOT NULL UNIQUE REFERENCES core.tenants(id) ON DELETE CASCADE
);

-- dakinis (POSTGRES_DB): schema IdP — fuente canónica: docs/supabase/schemas/01-dakinis-auth.sql
CREATE SCHEMA IF NOT EXISTS dakinis_auth;

CREATE TABLE IF NOT EXISTS dakinis_auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  tenant_id text NOT NULL,
  role text NOT NULL DEFAULT 'user'
);

CREATE INDEX IF NOT EXISTS users_tenant_idx ON dakinis_auth.users (tenant_id);

CREATE TABLE IF NOT EXISTS dakinis_auth.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON dakinis_auth.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_family_idx ON dakinis_auth.refresh_tokens (family_id);

-- RLS: sin políticas para anon/authenticated → deny vía PostgREST; service_role (backend) bypass.
ALTER TABLE dakinis_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dakinis_auth.users FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE dakinis_auth.users FROM PUBLIC;
-- En Supabase los roles API son anon/authenticated (no existen en Postgres local hasta crear rol).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE dakinis_auth.users FROM anon, authenticated;
  END IF;
END $$;

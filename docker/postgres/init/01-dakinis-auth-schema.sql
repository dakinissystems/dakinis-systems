-- dakinis (POSTGRES_DB): schema for platform/auth (see platform/auth/docs/supabase-schema.sql).
CREATE SCHEMA IF NOT EXISTS dakinis_auth;

CREATE TABLE IF NOT EXISTS dakinis_auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  tenant_id text NOT NULL,
  role text NOT NULL DEFAULT 'user'
);

CREATE INDEX IF NOT EXISTS users_tenant_idx ON dakinis_auth.users (tenant_id);

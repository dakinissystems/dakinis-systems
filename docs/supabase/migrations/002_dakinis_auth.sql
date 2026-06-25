-- 002 — Identidad unificada (dakinis_auth)
-- Ejecutar tras 001. Amplía schemas/01-dakinis-auth.sql si ya lo tienes.

CREATE TABLE IF NOT EXISTS dakinis_auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  role text NOT NULL DEFAULT 'user',
  tenant_id text,
  email_verified_at timestamptz,
  totp_secret text,
  totp_enabled boolean NOT NULL DEFAULT false,
  is_disabled boolean NOT NULL DEFAULT false,
  last_password_change timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS totp_secret text;
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS totp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS last_password_change timestamptz;
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE dakinis_auth.users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Compat: tabla creada por 01-dakinis-auth.sql exigía NOT NULL; OAuth no tiene password
ALTER TABLE dakinis_auth.users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dakinis_auth_users_tenant ON dakinis_auth.users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_dakinis_auth_users_role ON dakinis_auth.users (role);

CREATE TABLE IF NOT EXISTS dakinis_auth.oauth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON dakinis_auth.oauth_accounts (user_id);

CREATE TABLE IF NOT EXISTS dakinis_auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON dakinis_auth.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON dakinis_auth.sessions (expires_at);

CREATE TABLE IF NOT EXISTS dakinis_auth.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON dakinis_auth.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON dakinis_auth.refresh_tokens (family_id);

CREATE TABLE IF NOT EXISTS dakinis_auth.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON dakinis_auth.password_resets (user_id);

CREATE TABLE IF NOT EXISTS dakinis_auth.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dakinis_auth.mfa_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  factor_type text NOT NULL DEFAULT 'totp',
  secret_encrypted text,
  is_primary boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mfa_factors_user ON dakinis_auth.mfa_factors (user_id);

CREATE TABLE IF NOT EXISTS dakinis_auth.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  email_attempted text,
  success boolean NOT NULL,
  ip_address inet,
  user_agent text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON dakinis_auth.login_history (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_auth.registration_tokens (
  id bigserial PRIMARY KEY,
  email_norm text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invite_token text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_email ON dakinis_auth.registration_tokens (email_norm);

-- Puente integer legacy (Stream Users / AkoeNet users) → uuid
CREATE TABLE IF NOT EXISTS dakinis_auth.legacy_id_map (
  legacy_schema text NOT NULL,
  legacy_table text NOT NULL,
  legacy_id bigint NOT NULL,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (legacy_schema, legacy_table, legacy_id)
);
CREATE INDEX IF NOT EXISTS idx_legacy_id_map_user ON dakinis_auth.legacy_id_map (user_id);

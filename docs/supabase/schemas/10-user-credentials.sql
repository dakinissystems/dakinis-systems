-- Credenciales de usuario: onboarding, reset de contraseña y confirmación
-- Ejecutar tras 09-feature-events.sql

ALTER TABLE dakinis_core_prod.users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE dakinis_core_prod.users
  ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT;

ALTER TABLE dakinis_core_prod.users
  ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

ALTER TABLE dakinis_core_prod.users
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_hash
  ON dakinis_core_prod.users (password_reset_token_hash)
  WHERE password_reset_token_hash IS NOT NULL;

-- 014a — Ejecutar ANTES de reintentar 014 si falló password_hash NOT NULL
-- Usuarios OAuth (Google/Twitch/Discord) no tienen passwordHash en public."Users".

ALTER TABLE dakinis_auth.users ALTER COLUMN password_hash DROP NOT NULL;

-- tenant_id opcional para identidad global (no solo un tenant)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'dakinis_auth'
      AND table_name = 'users'
      AND column_name = 'tenant_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE dakinis_auth.users ALTER COLUMN tenant_id DROP NOT NULL;
  END IF;
END $$;

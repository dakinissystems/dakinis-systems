-- Dakinis Core — control de acceso tenant (degradación por pago + suspensión admin)
-- Ejecutar tras 07-bos-platform.sql

ALTER TABLE dakinis_core_prod.tenant_subscriptions
  ADD COLUMN IF NOT EXISTS entitled_plan TEXT,
  ADD COLUMN IF NOT EXISTS access_state TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS access_reason TEXT,
  ADD COLUMN IF NOT EXISTS access_note TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

COMMENT ON COLUMN dakinis_core_prod.tenant_subscriptions.entitled_plan IS 'Plan comercial de pago (restaurar al normalizar)';
COMMENT ON COLUMN dakinis_core_prod.tenant_subscriptions.access_state IS 'active | degraded | suspended | closed';
COMMENT ON COLUMN dakinis_core_prod.tenant_subscriptions.access_reason IS 'payment_past_due, admin_legal, etc.';

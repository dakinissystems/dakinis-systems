-- 021 — Billing tenant ids as text (Core business_id = biz_..., not UUID)
-- Depends on billing.v_active_subscriptions (012) — drop before ALTER, recreate after.

DROP VIEW IF EXISTS billing.v_active_subscriptions;

ALTER TABLE billing.subscriptions
  ALTER COLUMN tenant_id TYPE text USING tenant_id::text;

ALTER TABLE billing.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE billing.subscriptions
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE billing.usage
  ALTER COLUMN tenant_id TYPE text USING tenant_id::text;

ALTER TABLE billing.usage
  DROP CONSTRAINT IF EXISTS usage_user_id_fkey;

ALTER TABLE billing.usage
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE billing.customers
  DROP CONSTRAINT IF EXISTS customers_user_id_fkey;

ALTER TABLE billing.customers
  ALTER COLUMN user_id TYPE text USING user_id::text;

CREATE INDEX IF NOT EXISTS idx_billing_subs_business ON billing.subscriptions (tenant_id)
  WHERE tenant_id IS NOT NULL;

-- Recreate view (012_views_hub.sql) — tenant_id / user_id now text
CREATE OR REPLACE VIEW billing.v_active_subscriptions AS
SELECT
  s.id,
  s.tenant_id,
  s.user_id,
  s.plan,
  s.status,
  s.current_period_end,
  s.stripe_subscription_id,
  c.stripe_customer_id
FROM billing.subscriptions s
LEFT JOIN billing.customers c ON c.user_id = s.user_id
WHERE s.status IN ('active', 'trialing');

COMMENT ON VIEW billing.v_active_subscriptions IS 'Billing — suscripciones activas';

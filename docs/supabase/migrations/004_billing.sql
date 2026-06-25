-- 004 — Billing (schema billing)

CREATE TABLE IF NOT EXISTS billing.plans (
  code text PRIMARY KEY,
  name text NOT NULL,
  stripe_price_id text,
  interval text NOT NULL DEFAULT 'month',
  metadata jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  email text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON billing.customers (stripe_customer_id);

CREATE TABLE IF NOT EXISTS billing.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  plan text NOT NULL DEFAULT 'free',
  billing_cycle text,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_subs_tenant ON billing.subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_subs_user ON billing.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subs_status ON billing.subscriptions (status);

CREATE TABLE IF NOT EXISTS billing.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES billing.customers(id) ON DELETE CASCADE,
  stripe_payment_method_id text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'card',
  is_default boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  license_type text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'stripe',
  reference text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_recurring boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_payments_user ON billing.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_tenant ON billing.payments (tenant_id);

CREATE TABLE IF NOT EXISTS billing.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES billing.customers(id) ON DELETE CASCADE,
  stripe_invoice_id text UNIQUE,
  amount_due numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  metric text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_usage_tenant_metric ON billing.usage (tenant_id, metric, period_start);

CREATE TABLE IF NOT EXISTS billing.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  license_type text NOT NULL DEFAULT 'none',
  license_key text,
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'subscription',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_licenses_user ON billing.licenses (user_id);

CREATE TABLE IF NOT EXISTS billing.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'license',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_user ON billing.entitlements (user_id);

CREATE TABLE IF NOT EXISTS billing.stripe_webhook_events (
  id bigserial PRIMARY KEY,
  stripe_event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

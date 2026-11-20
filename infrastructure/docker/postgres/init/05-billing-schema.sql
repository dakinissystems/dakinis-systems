-- Billing schema — local Docker (canónico: docs/supabase/migrations/004_billing.sql)
CREATE SCHEMA IF NOT EXISTS billing;

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
  user_id text NOT NULL UNIQUE,
  stripe_customer_id text UNIQUE,
  email text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON billing.customers (stripe_customer_id);

CREATE TABLE IF NOT EXISTS billing.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  user_id text,
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

CREATE TABLE IF NOT EXISTS billing.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  user_id text,
  metric text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_usage_tenant_metric ON billing.usage (tenant_id, metric, period_start);

CREATE TABLE IF NOT EXISTS billing.stripe_webhook_events (
  id bigserial PRIMARY KEY,
  stripe_event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO billing.plans (code, name, interval, active)
VALUES
  ('free', 'Free', 'month', true),
  ('starter', 'Starter', 'month', true),
  ('growth', 'Growth', 'month', true),
  ('pro', 'Pro', 'month', true),
  ('lifeflow-plus', 'LifeFlow Plus', 'month', true)
ON CONFLICT (code) DO NOTHING;

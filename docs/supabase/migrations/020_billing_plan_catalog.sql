-- 020 — Billing plan catalog (growth + LifeFlow Plus)
        -- ejecutar tras 004

INSERT INTO billing.plans (code, name, interval, active)
VALUES
  ('growth', 'Growth', 'month', true),
  ('lifeflow-plus', 'LifeFlow Plus', 'month', true)
ON CONFLICT (code) DO NOTHING;

COMMENT ON COLUMN billing.plans.stripe_price_id IS
  'Stripe Price ID — billing service maps STRIPE_PRICE_* env at runtime; optional manual UPDATE here';

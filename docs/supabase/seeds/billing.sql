-- Seeds — billing.plans (ejecutar tras 004 + 020)
-- stripe_price_id: opcional en Supabase; el servicio billing usa STRIPE_PRICE_* en Railway.

INSERT INTO billing.plans (code, name, interval, active)
VALUES
  ('free', 'Free', 'month', true),
  ('starter', 'Starter', 'month', true),
  ('growth', 'Growth', 'month', true),
  ('pro', 'Pro', 'month', true),
  ('platform', 'Platform', 'month', true),
  ('lifeflow-plus', 'LifeFlow Plus', 'month', true)
ON CONFLICT (code) DO NOTHING;

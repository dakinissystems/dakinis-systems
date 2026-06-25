-- Seeds — billing.plans (ejecutar tras 004)

INSERT INTO billing.plans (code, name, interval, active)
VALUES
  ('free', 'Free', 'month', true),
  ('starter', 'Starter', 'month', true),
  ('pro', 'Pro', 'month', true),
  ('platform', 'Platform', 'month', true)
ON CONFLICT (code) DO NOTHING;

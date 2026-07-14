-- 045 — StreamAutomator plans in billing catalog (Fase 1.2 unified billing)
-- Run after 044. Seeds product_key metadata for legacy SA license mapping.

INSERT INTO billing.plans (code, name, interval, active, metadata)
VALUES
  (
    'sa-creator-monthly',
    'StreamAutomator Creator (monthly)',
    'month',
    true,
    '{"product_key":"streamautomator","sa_license_type":"monthly","currency":"USD"}'::jsonb
  ),
  (
    'sa-pro-monthly',
    'StreamAutomator Pro (monthly)',
    'month',
    true,
    '{"product_key":"streamautomator","sa_license_type":"quarterly","currency":"USD"}'::jsonb
  ),
  (
    'sa-lifetime',
    'StreamAutomator Lifetime',
    'once',
    true,
    '{"product_key":"streamautomator","sa_license_type":"lifetime","currency":"USD"}'::jsonb
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  interval = EXCLUDED.interval,
  active = EXCLUDED.active,
  metadata = billing.plans.metadata || EXCLUDED.metadata;

COMMENT ON TABLE billing.plans IS
  'Plan catalog. metadata.product_key: streamautomator | core | lifeflow | akoenet';

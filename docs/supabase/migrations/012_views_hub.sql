-- 012 — Vistas Hub (lectura cross-schema; solo backend, no PostgREST anon)

CREATE OR REPLACE VIEW hub.v_user_launcher AS
SELECT
  u.id AS user_id,
  u.email,
  tm.tenant_id,
  t.slug AS tenant_slug,
  t.name AS tenant_name,
  t.plan AS tenant_plan,
  tm.role AS membership_role
FROM dakinis_auth.users u
JOIN core.tenant_memberships tm ON tm.user_id = u.id
JOIN core.tenants t ON t.id = tm.tenant_id
WHERE u.is_disabled = false;

CREATE OR REPLACE VIEW hub.v_user_products AS
SELECT
  u.id AS user_id,
  u.email,
  EXISTS (SELECT 1 FROM stream.user_profiles sp WHERE sp.user_id = u.id) AS has_stream,
  EXISTS (SELECT 1 FROM akoenet.user_profiles ap WHERE ap.user_id = u.id) AS has_akoenet,
  EXISTS (SELECT 1 FROM lifeflow.accounts la WHERE la.user_id = u.id LIMIT 1) AS has_lifeflow,
  EXISTS (SELECT 1 FROM core.tenant_memberships tm WHERE tm.user_id = u.id LIMIT 1) AS has_core_tenant
FROM dakinis_auth.users u
WHERE u.is_disabled = false;

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

COMMENT ON VIEW hub.v_user_launcher IS 'Hub launcher — memberships por tenant';
COMMENT ON VIEW hub.v_user_products IS 'Hub — flags de productos activos por usuario';
COMMENT ON VIEW billing.v_active_subscriptions IS 'Billing — suscripciones activas';

-- Limpia stripe_customer_id inválidos en billing.customers (p. ej. smoke_cus_test del smoke LiveSync).
-- Ejecutar en Supabase SQL Editor si POST /billing/v1/checkout devuelve 502 para un usuario con billing.unified.

-- Usuario test velezcampeon (opcional, descomentar):
-- UPDATE billing.customers
-- SET stripe_customer_id = NULL, updated_at = now()
-- WHERE user_id = 'a1000088-0000-4000-8000-000000000088'::uuid
--   AND (stripe_customer_id IS NULL OR stripe_customer_id NOT LIKE 'cus_%');

-- Todos los registros con ID que no parece Stripe customer:
UPDATE billing.customers
SET stripe_customer_id = NULL, updated_at = now()
WHERE stripe_customer_id IS NOT NULL
  AND stripe_customer_id !~ '^cus_[A-Za-z0-9]+$';

-- Verificar:
SELECT user_id, stripe_customer_id, email, updated_at
FROM billing.customers
WHERE user_id = 'a1000088-0000-4000-8000-000000000088'::uuid;

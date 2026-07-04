-- Seed — negocio plataforma en Core prod (requerido para IdP exchange con slug dakinis-platform)
-- Ejecutar en Supabase SQL Editor (proyecto Core / mismo DATABASE_URL que Railway Core API)

INSERT INTO dakinis_core_prod.business (id, slug, name, type, plan, config_json)
VALUES (
  'biz_dakinis_platform',
  'dakinis-platform',
  'Dakinis Plataforma',
  'platform',
  'platform',
  '{}'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  plan = EXCLUDED.plan;

-- Opcional: alinear tenant_id en IdP (ajusta email si aplica)
-- UPDATE dakinis_auth.users
-- SET tenant_id = 'dakinis-platform', role = 'platform_admin'
-- WHERE lower(email) = lower('christiandvillar@gmail.com');

SELECT id, slug, name, type FROM dakinis_core_prod.business WHERE slug = 'dakinis-platform';

-- Si ya hiciste exchange IdP con rol admin, corrige a platform_admin:
UPDATE dakinis_core_prod.users
SET role = 'platform_admin'
WHERE lower(email) = lower('christiandvillar@gmail.com')
  AND business_id = (SELECT id FROM dakinis_core_prod.business WHERE slug = 'dakinis-platform' LIMIT 1);

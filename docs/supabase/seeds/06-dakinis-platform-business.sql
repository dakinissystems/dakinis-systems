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

-- Si ya hiciste exchange IdP con rol admin, corrige a platform_admin:
UPDATE dakinis_core_prod.users
SET role = 'platform_admin'
WHERE lower(email) = lower('christiandvillar@gmail.com')
  AND business_id = (SELECT id FROM dakinis_core_prod.business WHERE slug = 'dakinis-platform' LIMIT 1);

-- IdP Supabase (Hub super-admin — acceso total al ecosistema):
-- UPDATE dakinis_auth.users
-- SET role = 'platform_admin', tenant_id = 'dakinis-platform'
-- WHERE lower(email) = lower('christiandvillar@gmail.com');

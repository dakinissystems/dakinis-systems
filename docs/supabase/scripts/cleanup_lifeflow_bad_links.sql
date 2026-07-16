-- Limpia filas mal provisionadas en lifeflow.app_user_links
-- (app_user_id que no es usr_* del SQLite LifeFlow).
-- Ejecutar tras 030. Hub SSO / finance-api reescribe el link correcto al login.

-- Ver antes:
SELECT app_user_id, platform_user_id, email, linked_at
FROM lifeflow.app_user_links
WHERE app_user_id NOT LIKE 'usr_%';

DELETE FROM lifeflow.app_user_links
WHERE app_user_id NOT LIKE 'usr_%';

-- Verificacion (usuario test):
SELECT app_user_id, platform_user_id, email
FROM lifeflow.app_user_links
WHERE platform_user_id = 'a1000088-0000-4000-8000-000000000088'::uuid;

-- Activa TODOS los módulos AkoeNet Assistant en servidores del perfil platform admin
-- (email christiandvillar@gmail.com o Twitch vinculado christiandvillar)
--
-- Equivalente a tener todo activo como "Administrador de AkoeNet" en Ajustes → Assistant.
-- Requiere: 032 + 033 aplicadas.
-- Idempotente.

INSERT INTO akoenet.server_modules (server_id, module_key, enabled, config)
SELECT DISTINCT s.id, am.key, true, '{}'::jsonb
FROM akoenet.servers s
JOIN dakinis_auth.users u ON u.id = s.owner_id
LEFT JOIN akoenet.user_profiles p ON p.user_id = u.id
CROSS JOIN akoenet.assistant_modules am
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
   OR lower(coalesce(p.twitch_username, '')) = lower('christiandvillar')
   OR lower(coalesce(p.username, '')) = lower('christiandvillar')
ON CONFLICT (server_id, module_key) DO UPDATE SET
  enabled = true,
  updated_at = now(),
  deactivated_at = NULL;

-- También servidores donde es miembro con rol admin (slug admin / owner)
INSERT INTO akoenet.server_modules (server_id, module_key, enabled, config)
SELECT DISTINCT s.id, am.key, true, '{}'::jsonb
FROM akoenet.servers s
JOIN akoenet.server_members sm ON sm.server_id = s.id
JOIN dakinis_auth.users u ON u.id = sm.user_id
JOIN akoenet.user_role_assignments ura ON ura.user_id = u.id
JOIN akoenet.roles r ON r.id = ura.role_id AND r.server_id = s.id
LEFT JOIN akoenet.user_profiles p ON p.user_id = u.id
CROSS JOIN akoenet.assistant_modules am
WHERE r.slug IN ('admin', 'owner', 'administrator')
  AND (
    lower(u.email) = lower('christiandvillar@gmail.com')
    OR lower(coalesce(p.twitch_username, '')) = lower('christiandvillar')
    OR lower(coalesce(p.username, '')) = lower('christiandvillar')
  )
ON CONFLICT (server_id, module_key) DO UPDATE SET
  enabled = true,
  updated_at = now(),
  deactivated_at = NULL;

-- Vincular Twitch al perfil si falta (cuenta platform admin)
UPDATE akoenet.user_profiles p
SET twitch_username = 'christiandvillar', updated_at = now()
FROM dakinis_auth.users u
WHERE p.user_id = u.id
  AND lower(u.email) = lower('christiandvillar@gmail.com')
  AND (p.twitch_username IS NULL OR trim(p.twitch_username) = '');

-- Verificación
SELECT s.name AS server_name, count(*) FILTER (WHERE sm.enabled) AS modules_enabled
FROM akoenet.servers s
JOIN akoenet.server_modules sm ON sm.server_id = s.id
JOIN dakinis_auth.users u ON u.id = s.owner_id
LEFT JOIN akoenet.user_profiles p ON p.user_id = u.id
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
   OR lower(coalesce(p.twitch_username, '')) = lower('christiandvillar')
GROUP BY s.id, s.name
ORDER BY s.name;

SELECT am.key, am.name, sm.enabled
FROM akoenet.server_modules sm
JOIN akoenet.assistant_modules am ON am.key = sm.module_key
JOIN akoenet.servers s ON s.id = sm.server_id
JOIN dakinis_auth.users u ON u.id = s.owner_id
LEFT JOIN akoenet.user_profiles p ON p.user_id = u.id
WHERE (lower(u.email) = lower('christiandvillar@gmail.com')
    OR lower(coalesce(p.twitch_username, '')) = lower('christiandvillar'))
  AND sm.server_id = (
    SELECT s2.id FROM akoenet.servers s2
    JOIN dakinis_auth.users u2 ON u2.id = s2.owner_id
    LEFT JOIN akoenet.user_profiles p2 ON p2.user_id = u2.id
    WHERE lower(u2.email) = lower('christiandvillar@gmail.com')
       OR lower(coalesce(p2.twitch_username, '')) = lower('christiandvillar')
    ORDER BY s2.is_system DESC, s2.created_at
    LIMIT 1
  )
ORDER BY am.key;

-- Activa TODOS los addons Dakinis Workspace para el workspace platform admin
-- (mismo nivel que productos Hub en provision_workspace_christiandvillar.sql)
--
-- Requiere: 031 + 035 aplicadas.
-- Idempotente.

INSERT INTO meta.workspace_addon_installs (workspace_id, addon_key, enabled, pinned, config)
SELECT w.id, wa.key, true,
  wa.key IN ('command-palette', 'activity-center', 'dashboard', 'marketplace', 'settings', 'ai-workspace', 'media-player'),
  '{}'::jsonb
FROM meta.workspaces w
CROSS JOIN meta.workspace_addons wa
WHERE lower(w.slug) = 'dakinis-platform'
ON CONFLICT (workspace_id, addon_key) DO UPDATE SET
  enabled = true,
  updated_at = now();

-- Verificación
SELECT wa.key, wa.category, wa.phase, wai.enabled, wai.pinned
FROM meta.workspace_addon_installs wai
JOIN meta.workspace_addons wa ON wa.key = wai.addon_key
JOIN meta.workspaces w ON w.id = wai.workspace_id
WHERE lower(w.slug) = 'dakinis-platform'
ORDER BY wa.sort_order, wa.key;

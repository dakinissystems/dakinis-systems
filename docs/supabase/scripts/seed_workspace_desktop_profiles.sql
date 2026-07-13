-- Perfiles de layout Dakinis Desktop — presets + perfiles guardados (catálogo desktop-layouts.json)
-- Requiere: 031 + 036 aplicadas · workspace slug dakinis-platform
-- Idempotente.

INSERT INTO meta.workspace_desktop_profiles (
  workspace_id,
  profile_key,
  name,
  base_layout,
  window_state,
  dock_pins,
  widget_grid,
  is_default
)
SELECT
  w.id,
  p.profile_key,
  p.name,
  p.base_layout,
  p.window_state::jsonb,
  p.dock_pins,
  '{}'::jsonb,
  p.is_default
FROM meta.workspaces w
CROSS JOIN (
  VALUES
    (
      'gaming',
      'Gaming',
      NULL,
      '{"icon":"gamepad-2","opens":[{"addonId":"media-player","windows":["player","friends"]},{"addonId":"soundboard","windows":["favorites","hotkeys"]}]}',
      ARRAY['media-player', 'command-palette', 'activity-center']::text[],
      false
    ),
    (
      'streaming',
      'Streaming',
      NULL,
      '{"icon":"radio","opens":[{"addonId":"obs-companion","windows":["scenes","streaming","chat"]},{"addonId":"stream-deck","windows":["buttons","macros"]},{"addonId":"media-player","windows":["mini-player"]},{"addonId":"dashboard","windows":["streams","analytics"]},{"addonId":"live-dashboard","windows":["meeting","notes"]}]}',
      ARRAY['obs-companion', 'stream-deck', 'media-player']::text[],
      false
    ),
    (
      'developer',
      'Developer',
      NULL,
      '{"icon":"terminal","opens":[{"addonId":"terminal","windows":["terminal","logs","railway"]},{"addonId":"devops","windows":["deployments","metrics"]},{"addonId":"monitor","windows":["overview"]},{"addonId":"ai-actions","windows":["actions"]},{"addonId":"notes","windows":["editor"]},{"addonId":"code-editor","windows":["editor","git"]}]}',
      ARRAY['terminal', 'monitor', 'ai-actions', 'code-editor']::text[],
      false
    ),
    (
      'office',
      'Office',
      NULL,
      '{"icon":"briefcase","opens":[{"addonId":"calendar","windows":["agenda","week"]},{"addonId":"kanban","windows":["boards","tasks"]},{"addonId":"notes","windows":["wiki","search"]},{"addonId":"dashboard","windows":["widgets"]}]}',
      ARRAY['calendar', 'kanban', 'notes', 'dashboard']::text[],
      false
    ),
    (
      'morning',
      'Morning',
      NULL,
      '{"icon":"sunrise","hint":"Calendar + Activity Center + quick notes","opens":[{"addonId":"calendar","windows":["agenda"]},{"addonId":"activity-center","windows":["feed"]},{"addonId":"notes","windows":["editor"]}]}',
      ARRAY['calendar', 'activity-center', 'command-palette']::text[],
      true
    ),
    (
      'streaming-session',
      'Streaming session',
      'streaming',
      '{"icon":"video","baseLayout":"streaming"}',
      ARRAY['obs-companion', 'stream-deck', 'media-player']::text[],
      false
    ),
    (
      'office-day',
      'Office day',
      'office',
      '{"icon":"building-2","baseLayout":"office"}',
      ARRAY['calendar', 'kanban', 'dashboard']::text[],
      false
    ),
    (
      'coding',
      'Coding',
      'developer',
      '{"icon":"code","baseLayout":"developer"}',
      ARRAY['terminal', 'code-editor', 'monitor', 'ai-actions']::text[],
      false
    ),
    (
      'music',
      'Music',
      NULL,
      '{"icon":"music","opens":[{"addonId":"media-player","windows":["player","playlist","visualizer"]}]}',
      ARRAY['media-player']::text[],
      false
    )
) AS p(profile_key, name, base_layout, window_state, dock_pins, is_default)
WHERE lower(w.slug) = 'dakinis-platform'
ON CONFLICT (workspace_id, profile_key) DO UPDATE SET
  name = EXCLUDED.name,
  base_layout = EXCLUDED.base_layout,
  window_state = EXCLUDED.window_state,
  dock_pins = EXCLUDED.dock_pins,
  is_default = EXCLUDED.is_default,
  updated_at = now();

-- Perfil por defecto único
UPDATE meta.workspace_desktop_profiles p
SET is_default = (p.profile_key = 'morning')
FROM meta.workspaces w
WHERE p.workspace_id = w.id AND lower(w.slug) = 'dakinis-platform';

-- Verificación (usa enabled, NO status)
SELECT p.profile_key, p.name, p.base_layout, p.is_default
FROM meta.workspace_desktop_profiles p
JOIN meta.workspaces w ON w.id = p.workspace_id
WHERE lower(w.slug) = 'dakinis-platform'
ORDER BY p.is_default DESC, p.profile_key;

SELECT count(*) AS desktop_profiles
FROM meta.workspace_desktop_profiles p
JOIN meta.workspaces w ON w.id = p.workspace_id
WHERE lower(w.slug) = 'dakinis-platform';

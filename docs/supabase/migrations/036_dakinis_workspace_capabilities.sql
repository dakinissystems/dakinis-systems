-- 036 — Dakinis Workspace: tiers, 3 addons nuevos, perfiles de layout
-- Ejecutar tras 035. Idempotente.

ALTER TABLE meta.workspace_addons
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'productivity';

ALTER TABLE meta.workspace_addons
  ADD COLUMN IF NOT EXISTS admission text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN meta.workspace_addons.tier IS
  'Jerarquía launcher: core | productivity | developer | stream | media | entertainment | system';

-- Backfill tiers (035 catalog)
UPDATE meta.workspace_addons SET tier = 'core', admission = ARRAY['reusable']
WHERE key IN ('command-palette', 'activity-center', 'dashboard', 'marketplace');

UPDATE meta.workspace_addons SET tier = 'productivity'
WHERE key IN ('calendar', 'notes', 'whiteboard', 'kanban', 'live-dashboard', 'ai-workspace');

UPDATE meta.workspace_addons SET tier = 'developer'
WHERE key IN ('terminal', 'devops', 'code-editor', 'automation-builder');

UPDATE meta.workspace_addons SET tier = 'stream'
WHERE key IN ('stream-deck', 'obs-companion', 'clip-studio');

UPDATE meta.workspace_addons SET tier = 'media' WHERE key = 'media-player';

UPDATE meta.workspace_addons SET tier = 'entertainment'
WHERE key IN ('soundboard', 'game-launcher');

UPDATE meta.workspace_addons SET tier = 'system'
WHERE key IN ('file-explorer', 'theme-studio', 'downloads');

-- Nuevos addons core / developer / productivity
INSERT INTO meta.workspace_addons (key, name, description, category, tier, phase, icon, sort_order, permissions, windows, builtin, admission, i18n)
VALUES
  ('settings', 'Settings', 'Appearance, accounts, privacy, developer', 'system', 'core', 'mvp', 'settings', 5,
   ARRAY['auth','storage','notifications'],
   ARRAY['appearance','themes','accounts','language','privacy','notifications','storage','developer'],
   true, ARRAY['reusable'],
   '{"name":{"en":"Settings","es":"Ajustes"},"description":{"en":"Appearance, themes, accounts, language, privacy, notifications and developer options.","es":"Apariencia, temas, cuentas, idioma, privacidad, notificaciones y opciones de desarrollador."}}'::jsonb),
  ('monitor', 'Monitor', 'CPU, RAM, Railway, Redis, Supabase', 'developer', 'developer', 'growth', 'activity', 105,
   ARRAY['metrics','network'],
   ARRAY['overview','cpu','ram','network','railway','api','redis','supabase'],
   false, ARRAY['reusable','improves-product'],
   '{"name":{"en":"Monitor","es":"Monitor"},"description":{"en":"CPU, RAM, network, Railway, API, Redis and Supabase at a glance.","es":"CPU, RAM, red, Railway, API, Redis y Supabase de un vistazo."}}'::jsonb),
  ('ai-actions', 'AI Actions', 'Summarize, Translate, Deploy, Fix, Review', 'productivity', 'productivity', 'growth', 'zap', 65,
   ARRAY['ai','notifications'],
   ARRAY['actions','summarize','translate','explain','generate','deploy','fix','review'],
   false, ARRAY['reusable','improves-akoenet','improves-product'],
   '{"name":{"en":"AI Actions","es":"Acciones IA"},"description":{"en":"Action list, not chat — Summarize, Translate, Explain, Generate, Deploy, Fix, Review.","es":"Lista de acciones, no chat — Resumir, Traducir, Explicar, Generar, Deploy, Corregir, Revisar."}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  tier = EXCLUDED.tier,
  admission = EXCLUDED.admission,
  sort_order = EXCLUDED.sort_order,
  i18n = EXCLUDED.i18n,
  updated_at = now();

-- Perfiles de layout guardados por workspace
CREATE TABLE IF NOT EXISTS meta.workspace_desktop_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  profile_key text NOT NULL,
  name text NOT NULL,
  base_layout text,
  window_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  dock_pins text[] NOT NULL DEFAULT '{}',
  widget_grid jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, profile_key)
);

CREATE INDEX IF NOT EXISTS idx_meta_workspace_desktop_profiles_ws
  ON meta.workspace_desktop_profiles (workspace_id);

COMMENT ON TABLE meta.workspace_desktop_profiles IS
  'Layouts guardados Dakinis Desktop — Morning, Coding, Streaming, etc.';

INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES ('036_dakinis_workspace_capabilities.sql', true, 'manual prod')
ON CONFLICT (migration_file) DO NOTHING;

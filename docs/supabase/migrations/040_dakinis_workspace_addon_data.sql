-- 040 — Workspace addon content sync (kanban, calendar, notes, code-editor)
-- Ejecutar tras 039_director_sync_trigger_resilience. Idempotente.
-- Renombrado desde 039_dakinis_workspace_addon_data para evitar colisión con 039 director.

CREATE TABLE IF NOT EXISTS meta.workspace_addon_data (
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  addon_key    text NOT NULL REFERENCES meta.workspace_addons(key) ON DELETE CASCADE,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision     bigint NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, addon_key)
);

ALTER TABLE meta.workspace_addon_data
  ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_workspace_addon_data_updated
  ON meta.workspace_addon_data (updated_at DESC);

COMMENT ON TABLE meta.workspace_addon_data IS
  'Blob sync per workspace addon (kanban boards, calendar events, notes). revision for optimistic concurrency.';

COMMENT ON COLUMN meta.workspace_addon_data.revision IS
  'Monotonic counter incremented on each successful write; clients send expected revision on PUT.';

-- Workspace addon visibility flags (Fase 0 feature flags)
INSERT INTO meta.feature_flags (flag_key, name, enabled, description, scope, rollout_percentage)
VALUES
  ('workspace.addon.calendar', 'Workspace Calendar', true, 'Calendar addon in AkoeNet workspace', 'global', 100),
  ('workspace.addon.code-editor', 'Workspace Code Editor', true, 'Code editor addon', 'global', 100),
  ('workspace.addon.terminal', 'Workspace Terminal', true, 'Terminal addon', 'global', 100),
  ('workspace.addon.kanban', 'Workspace Kanban', true, 'Kanban addon', 'global', 100),
  ('workspace.addon.notes', 'Workspace Notes', true, 'Notes addon', 'global', 100),
  ('workspace.addon.devops', 'Workspace DevOps', true, 'DevOps addon', 'global', 100),
  ('workspace.addon.monitor', 'Workspace Monitor', true, 'Monitor addon', 'global', 100),
  ('workspace.addon.dashboard', 'Workspace Dashboard', true, 'Dashboard addon', 'global', 100),
  ('workspace.addon.media-player', 'Workspace Media Player', true, 'Media player addon', 'global', 100)
ON CONFLICT (flag_key) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 3, 'Workspace addon data + revision', '040_dakinis_workspace_addon_data.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 3),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

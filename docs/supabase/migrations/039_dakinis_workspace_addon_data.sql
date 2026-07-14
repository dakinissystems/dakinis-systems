-- 039 — Workspace addon content sync (kanban, calendar, notes)
-- Ejecutar tras 038. Idempotente.

CREATE TABLE IF NOT EXISTS meta.workspace_addon_data (
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  addon_key    text NOT NULL REFERENCES meta.workspace_addons(key) ON DELETE CASCADE,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, addon_key)
);

CREATE INDEX IF NOT EXISTS idx_workspace_addon_data_updated
  ON meta.workspace_addon_data (updated_at DESC);

COMMENT ON TABLE meta.workspace_addon_data IS
  'Blob sync per workspace addon (kanban boards, calendar events, notes).';

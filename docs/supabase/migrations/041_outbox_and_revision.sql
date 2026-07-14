-- 041 — Outbox events (transactional outbox pattern)
-- Ejecutar tras 040. Idempotente.

CREATE TABLE IF NOT EXISTS meta.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_pending
  ON meta.outbox_events (created_at)
  WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate
  ON meta.outbox_events (aggregate_type, aggregate_id);

COMMENT ON TABLE meta.outbox_events IS
  'Transactional outbox for platform events (workspace, stream, billing). Processed by workers.';

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 4, 'Outbox events table', '041_outbox_and_revision.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 4),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

-- 047 - Outbox idempotency_key (dedup DB-level)
-- Ejecutar tras 046. Idempotente.
-- Nota: no usar punto y coma dentro de strings en COMMENT (el editor SQL de Supabase parte por ;)

ALTER TABLE meta.outbox_events
  ADD COLUMN IF NOT EXISTS idempotency_key text;

UPDATE meta.outbox_events
SET idempotency_key = COALESCE(
  NULLIF(TRIM(payload->>'_idempotencyKey'), ''),
  'outbox:' || event_type || ':' || aggregate_type || ':' || aggregate_id
)
WHERE idempotency_key IS NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY idempotency_key
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM meta.outbox_events
  WHERE idempotency_key IS NOT NULL
)
DELETE FROM meta.outbox_events o
USING ranked r
WHERE o.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_events_idempotency_key
  ON meta.outbox_events (idempotency_key);

COMMENT ON COLUMN meta.outbox_events.idempotency_key IS
  'Clave idempotente para publish - formato outbox:eventType:aggregateType:aggregateId';

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 8, 'Outbox idempotency_key column', '047_outbox_idempotency_key.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 8),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

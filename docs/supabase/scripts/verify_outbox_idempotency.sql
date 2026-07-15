-- Verificar migracion 047_outbox_idempotency_key.sql
-- Ejecutar en Supabase SQL Editor tras aplicar 047.

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'meta'
  AND table_name = 'outbox_events'
  AND column_name = 'idempotency_key';

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'meta'
  AND tablename = 'outbox_events'
  AND indexname = 'idx_outbox_events_idempotency_key';

SELECT version, description, migration_file, applied_at
FROM meta.schema_versions
WHERE schema_name = 'meta';

SELECT
  COUNT(*) AS total_rows,
  COUNT(idempotency_key) AS with_key,
  COUNT(*) - COUNT(DISTINCT idempotency_key) AS duplicate_keys
FROM meta.outbox_events;

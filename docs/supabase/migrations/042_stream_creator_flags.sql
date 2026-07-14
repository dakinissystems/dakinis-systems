-- 042 — Feature flags Creator Suite stream sync (Fase 1B)
-- Ejecutar tras 041. Idempotente.

INSERT INTO meta.feature_flags (flag_key, name, enabled, description, scope, rollout_percentage)
VALUES
  ('streamautomator.director.stream_read', 'Director read from stream.*', false,
   'Lee sesiones Director desde stream.director_sessions antes que Sequelize public', 'global', 0),
  ('streamautomator.automation.stream_sync', 'Automation dual-write stream', true,
   'Dual-write reglas automation a stream.automation_rules via app', 'global', 100)
ON CONFLICT (flag_key) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 5, 'StreamAutomator stream sync flags', '042_stream_creator_flags.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 5),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

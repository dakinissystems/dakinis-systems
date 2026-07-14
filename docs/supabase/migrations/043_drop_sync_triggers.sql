-- 043 — Drop public→stream sync triggers (Fase 1C)
-- ⚠️ APLICAR SOLO tras verificar dual-write estable en prod:
--   1) Migraciones 037, 039, 040–042 aplicadas
--   2) Smoke: POST /api/director/start + CRUD /api/automation/rules sin 500
--   3) Worker outbox activo con LEGACY_SYNC_MODE=true al menos 48h sin drift
--   4) Script: docs/scripts/verify_streamautomator_creator_suite.sql
--
-- Idempotente. Reversible solo re-ejecutando funciones/triggers de 037.

-- Flag de gobernanza (opcional — documentar en meta.migration_history)
INSERT INTO meta.feature_flags (flag_key, name, enabled, description, scope, rollout_percentage)
VALUES
  ('streamautomator.drop_public_sync_triggers', 'Drop public→stream triggers', false,
   'Marcar true tras aplicar 043; indica cutover app-level sync completo', 'global', 0)
ON CONFLICT (flag_key) DO NOTHING;

-- Automation rules triggers
DROP TRIGGER IF EXISTS trg_sync_automation_rules_insert ON public."AutomationRules";
DROP TRIGGER IF EXISTS trg_sync_automation_rules_update ON public."AutomationRules";
DROP TRIGGER IF EXISTS trg_sync_automation_rules_delete ON public."AutomationRules";

-- Director sessions triggers
DROP TRIGGER IF EXISTS trg_sync_director_sessions_insert ON public."StreamDirectorSessions";
DROP TRIGGER IF EXISTS trg_sync_director_sessions_update ON public."StreamDirectorSessions";
DROP TRIGGER IF EXISTS trg_sync_director_sessions_delete ON public."StreamDirectorSessions";

COMMENT ON TABLE public."AutomationRules" IS
  'StreamAutomator IF/THEN — legacy Sequelize; sync via app dual-write + outbox (post-043)';
COMMENT ON TABLE public."StreamDirectorSessions" IS
  'StreamAutomator Director — legacy Sequelize; sync via app dual-write + outbox (post-043)';

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('stream', 6, 'Drop public→stream sync triggers', '043_drop_sync_triggers.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 6),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES ('043_drop_sync_triggers.sql', true, 'Creator Suite: triggers removed, app dual-write canonical')
ON CONFLICT (migration_file) DO NOTHING;

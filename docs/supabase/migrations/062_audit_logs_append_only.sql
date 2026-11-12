-- 062_audit_logs_append_only.sql
-- No aplicado. No chocar con 061 (nómina, otra rama): confirmar el número antes de pegarlo.
-- meta.audit_logs solo acepta INSERT. UPDATE y DELETE fallan por trigger.
-- El dueño de la tabla puede desactivar el trigger; este archivo no sustituye un rol de solo inserción.

CREATE OR REPLACE FUNCTION meta.audit_logs_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'meta.audit_logs is append-only';
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_no_mutation ON meta.audit_logs;
CREATE TRIGGER audit_logs_no_mutation
  BEFORE UPDATE OR DELETE ON meta.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION meta.audit_logs_append_only();

REVOKE UPDATE, DELETE ON TABLE meta.audit_logs FROM PUBLIC;

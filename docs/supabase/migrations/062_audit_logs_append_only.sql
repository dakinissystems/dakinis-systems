-- 062_audit_logs_append_only.sql
-- Aplicada en Supabase el 12 nov 2026. La 061 de nómina ya estaba aplicada; este archivo conserva el 062.
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

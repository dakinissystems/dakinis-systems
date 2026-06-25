-- 016 — Tablas ampliadas: AI, Hub, Audit, meta
-- Fuente: modules/{ai,hub,audit,meta}/tables/

CREATE SCHEMA IF NOT EXISTS meta;

CREATE TABLE IF NOT EXISTS meta.function_versions (
  id bigserial PRIMARY KEY,
  schema_name text NOT NULL,
  function_name text NOT NULL,
  version integer NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  migration_file text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schema_name, function_name, version)
);
CREATE INDEX IF NOT EXISTS idx_meta_fn_current
  ON meta.function_versions (schema_name, function_name) WHERE is_current;

-- AI: prompt_versions (reemplazo evolutivo de prompts) + provider_logs
CREATE TABLE IF NOT EXISTS ai.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  template text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]',
  model_hint text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_versions_code ON ai.prompt_versions (code) WHERE active;

-- Migrar filas de ai.prompts si existían
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'ai' AND table_name = 'prompts'
  ) THEN
    INSERT INTO ai.prompt_versions (code, version, template, variables, active, created_at)
    SELECT p.code, p.version, p.template, p.variables, p.active, p.created_at
    FROM ai.prompts p
    ON CONFLICT (code, version) DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS ai.provider_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text NOT NULL,
  request_id text,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  tenant_id uuid,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  latency_ms integer,
  status text NOT NULL DEFAULT 'ok',
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_provider_logs_created ON ai.provider_logs (created_at DESC);

-- Hub: dashboard_preferences + recent_items (preferences ya existe; alias documentado)
CREATE TABLE IF NOT EXISTS hub.dashboard_preferences (
  user_id uuid PRIMARY KEY REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  layout jsonb NOT NULL DEFAULT '[]',
  widget_config jsonb NOT NULL DEFAULT '{}',
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Copiar desde hub.preferences si existe
INSERT INTO hub.dashboard_preferences (user_id, widget_config, updated_at)
SELECT p.user_id, p.settings, p.updated_at
FROM hub.preferences p
ON CONFLICT (user_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS hub.recent_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  item_type text NOT NULL DEFAULT 'link',
  item_ref text NOT NULL,
  label text,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_hub_recent_items_user ON hub.recent_items (user_id, accessed_at DESC);

-- Audit ampliado
CREATE TABLE IF NOT EXISTS audit.api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  duration_ms integer,
  user_id uuid,
  tenant_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  request_body_hash text,
  response_bytes integer,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_api_requests_path ON audit.api_requests (path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_api_requests_service ON audit.api_requests (service, created_at DESC);

CREATE TABLE IF NOT EXISTS audit.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text NOT NULL,
  external_id text,
  payload jsonb NOT NULL DEFAULT '{}',
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_webhooks_pending ON audit.webhooks (created_at) WHERE NOT processed;

CREATE TABLE IF NOT EXISTS audit.background_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name text NOT NULL,
  job_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_jobs_queue_status ON audit.background_jobs (queue_name, status, scheduled_for);

-- Vista compat: api_logs → api_requests (lectura unificada)
CREATE OR REPLACE VIEW audit.v_api_traffic AS
SELECT
  id, method, path, status_code, duration_ms, user_id, tenant_id, ip_address,
  metadata, created_at, 'legacy_api_logs'::text AS source
FROM audit.api_logs
UNION ALL
SELECT
  id, method, path, status_code, duration_ms, user_id, tenant_id, ip_address,
  metadata, created_at, service AS source
FROM audit.api_requests;

COMMENT ON TABLE ai.prompt_versions IS 'Versionado inmutable de prompts; no UPDATE template en prod';
COMMENT ON TABLE hub.dashboard_preferences IS 'Layout Hub; consumir vía hub.v1_get_dashboard';
COMMENT ON TABLE audit.background_jobs IS 'Trazabilidad jobs BullMQ / schedulers';

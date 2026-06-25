-- 010 — Audit (schema audit)

CREATE TABLE IF NOT EXISTS audit.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  tenant_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  changes jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit.logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit.logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs (action, created_at DESC);

CREATE TABLE IF NOT EXISTS audit.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit.errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  error_code text,
  message text NOT NULL,
  stack text,
  user_id uuid,
  tenant_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_errors_service ON audit.errors (service, created_at DESC);

CREATE TABLE IF NOT EXISTS audit.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  duration_ms integer,
  user_id uuid,
  tenant_id uuid,
  ip_address inet,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_api_logs_path ON audit.api_logs (path, created_at DESC);

CREATE TABLE IF NOT EXISTS audit.dmca_takedowns (
  id bigserial PRIMARY KEY,
  complainant_name text NOT NULL,
  complainant_email text NOT NULL,
  copyright_holder text NOT NULL,
  infringing_url text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  resolved_by uuid REFERENCES dakinis_auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit.dpo_requests (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  request_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending',
  response text,
  responded_by uuid REFERENCES dakinis_auth.users(id),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  source text NOT NULL,
  user_id uuid,
  tenant_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_events_name ON audit.events (event_name, created_at DESC);

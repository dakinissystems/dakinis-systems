-- 031 — Workspace identity (Hub) + Super Admin platform ops
-- Ejecutar tras 030. Complementa meta.feature_flags (024) y hub.tenant_product_access (029).
-- Convive con core.tenants hasta cutover completo: meta.workspaces.core_tenant_slug → core.tenants.slug

CREATE SCHEMA IF NOT EXISTS meta;

-- ---------------------------------------------------------------------------
-- 1. Super admin en IdP (compat con role = platform_admin en 029)
-- ---------------------------------------------------------------------------
ALTER TABLE dakinis_auth.users
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS super_admin_notes text,
  ADD COLUMN IF NOT EXISTS last_impersonated_at timestamptz,
  ADD COLUMN IF NOT EXISTS impersonation_count integer NOT NULL DEFAULT 0;

-- Sincronizar platform_admin existente
UPDATE dakinis_auth.users
SET is_super_admin = true
WHERE lower(role) = 'platform_admin' AND is_super_admin IS NOT TRUE;

CREATE INDEX IF NOT EXISTS idx_dakinis_auth_users_super_admin
  ON dakinis_auth.users (is_super_admin) WHERE is_super_admin = true;

-- ---------------------------------------------------------------------------
-- 2. Workspaces (identidad Hub — la "oficina" del cliente)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  core_tenant_slug text UNIQUE,
  owner_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  plan text NOT NULL DEFAULT 'starter',
  plan_updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  trial_ends_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  activated_at timestamptz NOT NULL DEFAULT now(),
  logo_url text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meta_workspaces_status_check
    CHECK (status IN ('active', 'trial', 'suspended', 'payment_failed', 'deleted')),
  CONSTRAINT meta_workspaces_plan_check
    CHECK (plan IN ('starter', 'growth', 'pro', 'enterprise'))
);

CREATE INDEX IF NOT EXISTS idx_meta_workspaces_status ON meta.workspaces (status);
CREATE INDEX IF NOT EXISTS idx_meta_workspaces_core_slug ON meta.workspaces (core_tenant_slug);

COMMENT ON TABLE meta.workspaces IS
  'Identidad de workspace en Hub. core_tenant_slug enlaza con core.tenants.slug hasta cutover.';

-- ---------------------------------------------------------------------------
-- 3. Productos activos por workspace
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.workspace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  activated_at timestamptz NOT NULL DEFAULT now(),
  deactivated_at timestamptz,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (workspace_id, product_slug),
  CONSTRAINT meta_workspace_products_slug_check
    CHECK (product_slug IN ('core', 'lifeflow', 'streamautomator', 'akoenet', 'tabletop'))
);

CREATE INDEX IF NOT EXISTS idx_meta_workspace_products_ws
  ON meta.workspace_products (workspace_id) WHERE enabled = true;

-- ---------------------------------------------------------------------------
-- 4. Miembros e invitaciones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id),
  CONSTRAINT meta_workspace_members_role_check
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  CONSTRAINT meta_workspace_members_status_check
    CHECK (status IN ('pending', 'active', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_meta_workspace_members_user
  ON meta.workspace_members (user_id, status);
CREATE INDEX IF NOT EXISTS idx_meta_workspace_members_ws
  ON meta.workspace_members (workspace_id, status);

CREATE TABLE IF NOT EXISTS meta.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token text NOT NULL UNIQUE,
  invited_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meta_workspace_invites_role_check
    CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_workspace_invites_pending_email
  ON meta.workspace_invites (workspace_id, lower(email))
  WHERE used_at IS NULL;

-- ---------------------------------------------------------------------------
-- 5. Auditoría platform (timeline Super Admin + Hub Admin)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_ip inet,
  user_agent text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  workspace_id uuid REFERENCES meta.workspaces(id) ON DELETE SET NULL,
  service text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_audit_logs_user_id ON meta.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_meta_audit_logs_workspace_id ON meta.audit_logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_meta_audit_logs_action ON meta.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_meta_audit_logs_created_at ON meta.audit_logs (created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. Feature flags — ampliar 024 (rollout global + workspace)
-- ---------------------------------------------------------------------------
ALTER TABLE meta.feature_flags
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS rollout_percentage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_workspaces text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_plans text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL;

ALTER TABLE meta.feature_flags
  DROP CONSTRAINT IF EXISTS meta_feature_flags_rollout_pct_check;
ALTER TABLE meta.feature_flags
  ADD CONSTRAINT meta_feature_flags_rollout_pct_check
  CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);

CREATE TABLE IF NOT EXISTS meta.feature_flag_logs (
  id bigserial PRIMARY KEY,
  flag_id bigint REFERENCES meta.feature_flags(id) ON DELETE CASCADE,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  previous_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 7. Billing cache (Super Admin revenue dashboard)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_meta_subscriptions_workspace
  ON meta.subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_meta_subscriptions_stripe_customer
  ON meta.subscriptions (stripe_customer_id);

CREATE TABLE IF NOT EXISTS meta.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  stripe_invoice_id text UNIQUE,
  invoice_number text,
  amount_cents integer,
  currency text NOT NULL DEFAULT 'eur',
  status text,
  pdf_url text,
  hosted_invoice_url text,
  paid_at timestamptz,
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_invoices_workspace
  ON meta.invoices (workspace_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 8. Ops — incidencias, customer success, integraciones, IA
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'investigating',
  severity text NOT NULL DEFAULT 'minor',
  affected_services text[] NOT NULL DEFAULT '{}',
  affected_workspaces uuid[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meta_incidents_status_check
    CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  CONSTRAINT meta_incidents_severity_check
    CHECK (severity IN ('minor', 'major', 'critical'))
);

CREATE TABLE IF NOT EXISTS meta.incident_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES meta.incidents(id) ON DELETE CASCADE,
  status text,
  message text NOT NULL,
  created_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'support',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  subject text,
  message text,
  assigned_to uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.customer_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_customer_health_ws
  ON meta.customer_health_scores (workspace_id, calculated_at DESC);

CREATE TABLE IF NOT EXISTS meta.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  prefix text,
  permissions text[] NOT NULL DEFAULT '{read}',
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (workspace_id, name)
);

CREATE TABLE IF NOT EXISTS meta.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text,
  active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES meta.webhooks(id) ON DELETE CASCADE,
  event text,
  payload jsonb,
  response_status integer,
  response_body text,
  duration_ms integer,
  success boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  type text NOT NULL,
  format text NOT NULL DEFAULT 'json',
  status text NOT NULL DEFAULT 'pending',
  file_url text,
  file_size integer,
  requested_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  model text,
  tokens_input integer,
  tokens_output integer,
  cost_cents integer,
  endpoint text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_ai_usage_workspace
  ON meta.ai_usage (workspace_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 9. Funciones helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION meta.is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = meta, dakinis_auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dakinis_auth.users
    WHERE id = p_user_id
      AND (is_super_admin = true OR lower(role) = 'platform_admin')
      AND is_disabled IS NOT TRUE
  );
$$;

CREATE OR REPLACE FUNCTION meta.is_workspace_member(p_user_id uuid, p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = meta, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM meta.workspace_members
    WHERE user_id = p_user_id
      AND workspace_id = p_workspace_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION meta.is_workspace_admin(p_user_id uuid, p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = meta, dakinis_auth, pg_temp
AS $$
  SELECT meta.is_super_admin(p_user_id)
  OR EXISTS (
    SELECT 1 FROM meta.workspace_members
    WHERE user_id = p_user_id
      AND workspace_id = p_workspace_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION meta.get_active_workspace(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = meta, pg_temp
AS $$
  SELECT workspace_id
  FROM meta.workspace_members
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY last_accessed_at DESC NULLS LAST, created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION meta.log_audit(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_changes jsonb DEFAULT '{}'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_workspace_id uuid DEFAULT NULL,
  p_service text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = meta, dakinis_auth, pg_temp
AS $$
DECLARE
  v_log_id uuid;
  v_email text;
BEGIN
  SELECT email INTO v_email FROM dakinis_auth.users WHERE id = p_user_id;

  INSERT INTO meta.audit_logs (
    user_id, user_email, action, resource_type, resource_id,
    changes, metadata, workspace_id, service
  ) VALUES (
    p_user_id, v_email, p_action, p_resource_type, p_resource_id,
    p_changes, p_metadata, p_workspace_id, p_service
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Backfill workspaces desde core.tenants (idempotente)
INSERT INTO meta.workspaces (name, slug, core_tenant_slug, plan, status, activated_at)
SELECT t.name, t.slug, t.slug, coalesce(nullif(t.plan, 'free'), 'starter'), 'active', t.created_at
FROM core.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM meta.workspaces w WHERE lower(w.slug) = lower(t.slug)
);

-- Sincronizar productos Hub existentes (029) → workspace_products
INSERT INTO meta.workspace_products (workspace_id, product_slug, enabled)
SELECT w.id, p.product_slug, true
FROM meta.workspaces w
JOIN hub.tenant_product_access tpa ON lower(tpa.tenant_slug) = lower(w.core_tenant_slug)
CROSS JOIN LATERAL jsonb_array_elements_text(tpa.products) AS p(product_slug)
ON CONFLICT (workspace_id, product_slug) DO NOTHING;

-- Miembros desde core.tenant_memberships
INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
SELECT w.id, tm.user_id,
       CASE lower(coalesce(tm.role, 'member'))
         WHEN 'owner' THEN 'owner'
         WHEN 'admin' THEN 'admin'
         WHEN 'viewer' THEN 'viewer'
         ELSE 'member'
       END,
       'active', now()
FROM meta.workspaces w
JOIN core.tenants t ON lower(t.slug) = lower(w.core_tenant_slug)
JOIN core.tenant_memberships tm ON tm.tenant_id = t.id
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. RLS (deny por defecto; acceso vía service role / Internal API)
-- ---------------------------------------------------------------------------
ALTER TABLE meta.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.workspace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta.ai_usage ENABLE ROW LEVEL SECURITY;

-- Políticas mínimas: super admin ve todo; workspace admin ve el suyo
DROP POLICY IF EXISTS meta_workspaces_super_admin ON meta.workspaces;
CREATE POLICY meta_workspaces_super_admin ON meta.workspaces
  FOR ALL USING (meta.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS meta_workspaces_member_select ON meta.workspaces;
CREATE POLICY meta_workspaces_member_select ON meta.workspaces
  FOR SELECT USING (meta.is_workspace_member(auth.uid(), id));

DROP POLICY IF EXISTS meta_workspace_members_admin ON meta.workspace_members;
CREATE POLICY meta_workspace_members_admin ON meta.workspace_members
  FOR SELECT USING (
    meta.is_workspace_admin(auth.uid(), workspace_id)
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS meta_audit_logs_super_admin ON meta.audit_logs;
CREATE POLICY meta_audit_logs_super_admin ON meta.audit_logs
  FOR SELECT USING (meta.is_super_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 11. Seeds feature flags (ampliar 024)
-- ---------------------------------------------------------------------------
INSERT INTO meta.feature_flags (flag_key, name, enabled, description, scope, rollout_percentage)
VALUES
  ('copilot.gpt4', 'Copilot GPT-4', false, 'Usar GPT-4 en lugar de gpt-4o-mini', 'global', 0),
  ('lifeflow.psd2', 'LifeFlow PSD2', false, 'Agregación bancaria LifeFlow', 'global', 0),
  ('hub.workspace_admin', 'Hub Workspace Admin', false, 'Panel admin workspace en Hub', 'global', 0),
  ('hub.super_admin', 'Hub Super Admin', false, 'Panel super admin admin.dakinissystems.com', 'global', 0),
  ('tabletop.ai_gm', 'Tabletop AI GM', false, 'Game Master asistido por IA', 'global', 0),
  ('streamautomator.v2', 'StreamAutomator v2', false, 'Nueva UI StreamAutomator', 'global', 0)
ON CONFLICT (flag_key) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 2, 'Workspace identity + Super Admin ops', '031_workspace_super_admin.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 2),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

-- Dakinis BOS — monetización (sin Stripe obligatorio), uso IA, red, portal, automatizaciones
-- Ejecutar tras 06-tenant-intelligence-v2.sql

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_subscriptions (
  business_id TEXT PRIMARY KEY REFERENCES dakinis_core_prod.business(id),
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_invoices (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void')),
  line_items_json TEXT NOT NULL DEFAULT '[]',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON dakinis_core_prod.tenant_invoices(business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  metric_key TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'count',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_business_metric ON dakinis_core_prod.tenant_usage(business_id, metric_key, recorded_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_ai_usage_log (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  mode TEXT NOT NULL DEFAULT 'heuristic',
  question_hash TEXT NOT NULL DEFAULT '',
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_eur DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_business ON dakinis_core_prod.tenant_ai_usage_log(business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_pending_actions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  action_type TEXT NOT NULL,
  label TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'dismissed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_pending_actions_business ON dakinis_core_prod.tenant_pending_actions(business_id, status);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_automation_rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  event_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  action_type TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_automation_business ON dakinis_core_prod.tenant_automation_rules(business_id, event_type);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_network_orders (
  id TEXT PRIMARY KEY,
  from_business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  to_business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  link_id TEXT REFERENCES dakinis_core_prod.tenant_network_links(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'fulfilled', 'canceled')),
  lines_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_network_orders_from ON dakinis_core_prod.tenant_network_orders(from_business_id);
CREATE INDEX IF NOT EXISTS idx_network_orders_to ON dakinis_core_prod.tenant_network_orders(to_business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_portal_settings (
  business_id TEXT PRIMARY KEY REFERENCES dakinis_core_prod.business(id),
  enabled BOOLEAN NOT NULL DEFAULT false,
  subdomain TEXT NOT NULL DEFAULT '',
  features_json TEXT NOT NULL DEFAULT '[]',
  welcome_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_knowledge_chunks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  doc_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_knowledge_docs(id),
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON dakinis_core_prod.tenant_knowledge_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_business ON dakinis_core_prod.tenant_knowledge_chunks(business_id);

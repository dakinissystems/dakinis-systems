-- Dakinis One — Intelligence v2 (deals, objetivos, finanzas, KB, red)
-- Ejecutar tras 05-tenant-intelligence.sql. Schema: dakinis_core_prod
-- Tras este script (y 07–09): ejecutar 004-rls-lockdown-all.sql + 006b-rls-policies-missing-tables.sql

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_crm_deals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  contact_id TEXT REFERENCES dakinis_core_prod.tenant_crm_contacts(id),
  company_id TEXT REFERENCES dakinis_core_prod.tenant_crm_companies(id),
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead',
  value_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  expected_close DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_deals_business ON dakinis_core_prod.tenant_crm_deals(business_id, stage);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_goals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  branch_id TEXT REFERENCES dakinis_core_prod.tenant_branches(id),
  goal_key TEXT NOT NULL,
  label TEXT NOT NULL,
  target_value DOUBLE PRECISION NOT NULL,
  current_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goals_business ON dakinis_core_prod.tenant_goals(business_id, period);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_finance_entries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  branch_id TEXT REFERENCES dakinis_core_prod.tenant_branches(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT '',
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT NOT NULL DEFAULT '',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_finance_business ON dakinis_core_prod.tenant_finance_entries(business_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_knowledge_docs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  title TEXT NOT NULL,
  doc_kind TEXT NOT NULL DEFAULT 'process' CHECK (doc_kind IN ('process', 'policy', 'pdf', 'note')),
  content_text TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_business ON dakinis_core_prod.tenant_knowledge_docs(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_module_usage (
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  module_key TEXT NOT NULL,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  PRIMARY KEY (business_id, module_key)
);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_network_links (
  id TEXT PRIMARY KEY,
  from_business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  to_business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  link_type TEXT NOT NULL CHECK (link_type IN ('supplier', 'distributor', 'client', 'partner')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_network_from ON dakinis_core_prod.tenant_network_links(from_business_id);
CREATE INDEX IF NOT EXISTS idx_network_to ON dakinis_core_prod.tenant_network_links(to_business_id);

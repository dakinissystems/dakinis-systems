-- Dakinis One — CRM núcleo (Sprint 1–3)
-- Ejecutar en Supabase tras 02 y 03. Schema: dakinis_core_prod

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_crm_companies (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  name TEXT NOT NULL,
  vat_number TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_companies_business ON dakinis_core_prod.tenant_crm_companies(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_crm_contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  company_id TEXT REFERENCES dakinis_core_prod.tenant_crm_companies(id),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_business ON dakinis_core_prod.tenant_crm_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON dakinis_core_prod.tenant_crm_contacts(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON dakinis_core_prod.tenant_crm_contacts(company_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_crm_activities (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  contact_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_crm_contacts(id),
  type TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON dakinis_core_prod.tenant_crm_activities(contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_whatsapp_conversations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  contact_id TEXT NOT NULL REFERENCES dakinis_core_prod.tenant_crm_contacts(id),
  peer_phone TEXT NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, peer_phone)
);
CREATE INDEX IF NOT EXISTS idx_wa_conv_contact ON dakinis_core_prod.tenant_whatsapp_conversations(contact_id);

ALTER TABLE dakinis_core_prod.tenant_whatsapp_messages
  ADD COLUMN IF NOT EXISTS contact_id TEXT REFERENCES dakinis_core_prod.tenant_crm_contacts(id);

ALTER TABLE dakinis_core_prod.tenant_whatsapp_messages
  ADD COLUMN IF NOT EXISTS conversation_id TEXT REFERENCES dakinis_core_prod.tenant_whatsapp_conversations(id);

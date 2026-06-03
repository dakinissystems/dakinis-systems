-- Dakinis One — WhatsApp (Fase 3)
-- Ejecutar en el mismo proyecto Supabase que Core, schema dakinis_core_prod (o el de tu POSTGRES_SCHEMA).

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_whatsapp_contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  phone TEXT NOT NULL,
  display_name TEXT,
  wa_profile_name TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, phone)
);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_business ON dakinis_core_prod.tenant_whatsapp_contacts(business_id);

CREATE TABLE IF NOT EXISTS dakinis_core_prod.tenant_whatsapp_messages (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES dakinis_core_prod.business(id),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  wamid TEXT,
  peer_phone TEXT NOT NULL,
  body_text TEXT,
  msg_type TEXT NOT NULL DEFAULT 'text',
  payload_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_business_created
  ON dakinis_core_prod.tenant_whatsapp_messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_peer
  ON dakinis_core_prod.tenant_whatsapp_messages(business_id, peer_phone, created_at DESC);

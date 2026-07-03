-- 025 — Knowledge platform schema
-- Servicio: dakinis-knowledge (API + workers)
-- Ejecutar tras 024. RLS: re-ejecutar 013 o añadir knowledge al array de schemas.

CREATE SCHEMA IF NOT EXISTS knowledge;

COMMENT ON SCHEMA knowledge IS 'Dakinis Knowledge — documents, RAG, embeddings, permissions';

CREATE TABLE IF NOT EXISTS knowledge.sources (
  id text PRIMARY KEY,
  label text NOT NULL,
  ingest_mode text NOT NULL DEFAULT 'text',
  metadata jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_knowledge_collections_tenant ON knowledge.collections (tenant_id);

CREATE TABLE IF NOT EXISTS knowledge.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  collection_id uuid REFERENCES knowledge.collections(id) ON DELETE SET NULL,
  source_id text REFERENCES knowledge.sources(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text,
  status text NOT NULL DEFAULT 'draft',
  storage_path text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant ON knowledge.documents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_collection ON knowledge.documents (collection_id);

CREATE TABLE IF NOT EXISTS knowledge.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  content_text text,
  content_hash text,
  storage_path text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);

CREATE TABLE IF NOT EXISTS knowledge.chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,
  version_id uuid REFERENCES knowledge.document_versions(id) ON DELETE CASCADE,
  chunk_index int NOT NULL DEFAULT 0,
  content text NOT NULL,
  token_count int,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON knowledge.chunks (document_id);

CREATE TABLE IF NOT EXISTS knowledge.embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id uuid NOT NULL REFERENCES knowledge.chunks(id) ON DELETE CASCADE,
  model text NOT NULL DEFAULT 'text-embedding-3-small',
  embedding vector(1536),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_chunk ON knowledge.embeddings (chunk_id);

CREATE TABLE IF NOT EXISTS knowledge.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  name text NOT NULL,
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS knowledge.document_tags (
  document_id uuid NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES knowledge.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS knowledge.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  document_id uuid REFERENCES knowledge.documents(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES knowledge.collections(id) ON DELETE CASCADE,
  principal_type text NOT NULL,
  principal_id text NOT NULL,
  role text NOT NULL DEFAULT 'read',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_permissions_tenant ON knowledge.permissions (tenant_id);

CREATE TABLE IF NOT EXISTS knowledge.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}',
  error text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_jobs_status ON knowledge.jobs (status, job_type);

CREATE TABLE IF NOT EXISTS knowledge.search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES knowledge.documents(id) ON DELETE CASCADE,
  chunk_id uuid REFERENCES knowledge.chunks(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'knowledge',
  title text,
  excerpt text,
  metadata jsonb NOT NULL DEFAULT '{}',
  indexed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_scope ON knowledge.search_index (scope);

INSERT INTO knowledge.sources (id, label, ingest_mode) VALUES
  ('pdf', 'PDF', 'ocr+chunk'),
  ('wiki', 'Wiki', 'markdown'),
  ('documents', 'Documents', 'office+text'),
  ('faq', 'FAQ', 'structured'),
  ('policies', 'Policies', 'legal'),
  ('products', 'Product docs', 'catalog'),
  ('user-docs', 'User docs', 'markdown+attachments')
ON CONFLICT (id) DO NOTHING;

-- RLS lockdown (knowledge schema — apps usan pooler, no anon)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'knowledge' AND c.relkind = 'r' AND NOT c.relispartition
  LOOP
    EXECUTE format('ALTER TABLE knowledge.%I ENABLE ROW LEVEL SECURITY', r.table_name);
    EXECUTE format('ALTER TABLE knowledge.%I FORCE ROW LEVEL SECURITY', r.table_name);
  END LOOP;
END $$;

-- Deny anon/authenticated (Security Advisor)
DO $$
DECLARE
  r RECORD;
  pol_name text := 'dakinis_block_anon_authenticated';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'knowledge' AND c.relkind = 'r' AND c.relrowsecurity AND NOT c.relispartition
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON knowledge.%I', pol_name, r.table_name);
    EXECUTE format(
      $p$
      CREATE POLICY %I ON knowledge.%I
        FOR ALL TO anon, authenticated
        USING (false) WITH CHECK (false)
      $p$,
      pol_name, r.table_name
    );
  END LOOP;
END $$;

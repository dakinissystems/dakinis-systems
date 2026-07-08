-- 032 — AkoeNet Assistant: módulos nativos (no bots externos)
-- Ejecutar tras 031. Requiere schema akoenet (006).

CREATE TABLE IF NOT EXISTS akoenet.assistant_modules (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  capabilities text[] NOT NULL DEFAULT '{}',
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  requires_plan text[] NOT NULL DEFAULT '{starter}',
  phase text NOT NULL DEFAULT 'future',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT akoenet_assistant_modules_category_check CHECK (
    category IN ('moderation', 'community', 'ai', 'stream', 'business', 'developer', 'automation', 'entertainment', 'system')
  )
);

COMMENT ON TABLE akoenet.assistant_modules IS
  'Catálogo de módulos del AkoeNet Assistant (capacidad platform, no bots Discord).';

CREATE TABLE IF NOT EXISTS akoenet.server_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  module_key text NOT NULL REFERENCES akoenet.assistant_modules(key),
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  activated_at timestamptz NOT NULL DEFAULT now(),
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_akoenet_server_modules_server
  ON akoenet.server_modules (server_id) WHERE enabled = true;

CREATE TABLE IF NOT EXISTS akoenet.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger jsonb NOT NULL,
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_akoenet_automations_server
  ON akoenet.automations (server_id) WHERE enabled = true;

CREATE TABLE IF NOT EXISTS akoenet.automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES akoenet.automations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  trigger_event jsonb,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS akoenet.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  channel_id bigint,
  actor_user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_akoenet_moderation_logs_server
  ON akoenet.moderation_logs (server_id, created_at DESC);

CREATE TABLE IF NOT EXISTS akoenet.assistant_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE SET NULL,
  tokens_input integer,
  tokens_output integer,
  cost_cents integer,
  endpoint text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Catálogo Fase 1 (MVP lanzamiento)
INSERT INTO akoenet.assistant_modules (key, name, description, category, capabilities, phase, requires_plan)
VALUES
  ('guardian', 'Guardian', 'AutoMod + comandos /ban /kick /mute /warn + logs', 'moderation',
   ARRAY['moderation.automod','moderation.ban','moderation.kick','moderation.mute','moderation.warn','moderation.logs'],
   'mvp', ARRAY['starter']),
  ('welcome', 'Welcome', 'Bienvenida, rol automático, captcha', 'community',
   ARRAY['community.welcome','community.auto_role','community.captcha'],
   'mvp', ARRAY['starter']),
  ('assistant', 'AI Assistant', '@AI copilot del servidor — resúmenes, preguntas, traducción', 'ai',
   ARRAY['ai.ask','ai.summarize','ai.translate'],
   'mvp', ARRAY['growth']),
  ('guardian_ai', 'Moderador IA', 'Toxicidad contextual (no solo palabras)', 'ai',
   ARRAY['ai.moderate'],
   'mvp', ARRAY['growth']),
  ('streamer', 'Streamer', 'Integración nativa StreamAutomator — live, clips, horario', 'stream',
   ARRAY['stream.notify','stream.schedule','stream.clip'],
   'mvp', ARRAY['starter']),
  ('knowledge', 'Knowledge', 'FAQ y docs vía Dakinis Knowledge', 'ai',
   ARRAY['knowledge.search','knowledge.faq'],
   'mvp', ARRAY['growth']),
  ('reaction_roles', 'Reaction Roles', 'Roles por reacción — UI visual', 'community',
   ARRAY['community.reaction_roles'],
   'growth', ARRAY['starter']),
  ('polls', 'Encuestas', 'Polls, votos, sorteos', 'entertainment',
   ARRAY['community.poll','community.giveaway'],
   'growth', ARRAY['starter']),
  ('automation', 'Automation', 'Cuando X → haz Y (visual)', 'automation',
   ARRAY['automation.flow'],
   'growth', ARRAY['pro']),
  ('developer', 'Developer', 'GitHub, Railway, Supabase webhooks', 'developer',
   ARRAY['dev.github','dev.railway','dev.supabase'],
   'growth', ARRAY['pro']),
  ('business', 'Business', 'CRM, tickets, billing desde Core', 'business',
   ARRAY['business.crm','business.tickets','business.billing'],
   'future', ARRAY['pro']),
  ('games', 'Games', 'XP, niveles, economía', 'entertainment',
   ARRAY['games.xp','games.economy'],
   'future', ARRAY['starter']),
  ('music', 'Music', 'Compartir listening — sin reproducción DMCA', 'entertainment',
   ARRAY['music.spotify_status'],
   'future', ARRAY['growth'])
ON CONFLICT (key) DO NOTHING;

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('akoenet', 2, 'AkoeNet Assistant modules', '032_akoenet_assistant_modules.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 2),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

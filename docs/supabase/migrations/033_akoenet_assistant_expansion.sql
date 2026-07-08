-- 033 — AkoeNet Assistant: catálogo ampliado + event log
-- Ejecutar tras 032. Idempotente.

CREATE TABLE IF NOT EXISTS akoenet.assistant_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text NOT NULL DEFAULT 'internal-api',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_akoenet_assistant_events_server
  ON akoenet.assistant_events (server_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_akoenet_assistant_events_type
  ON akoenet.assistant_events (event_type, created_at DESC);

COMMENT ON TABLE akoenet.assistant_events IS
  'Auditoría de eventos del Assistant (message, member, stream, automation).';

-- Módulos adicionales (Growth / Future)
INSERT INTO akoenet.assistant_modules (key, name, description, category, capabilities, phase, requires_plan)
VALUES
  ('translator', 'Traductor', 'Traducción automática multilingüe en canales', 'ai',
   ARRAY['ai.translate_auto'], 'growth', ARRAY['growth']),
  ('meeting_ai', 'Meeting AI', 'Resúmenes de voz — tareas y participantes', 'ai',
   ARRAY['ai.meeting_summary'], 'future', ARRAY['pro']),
  ('developer_ai', 'Developer AI', 'Explica código y analiza logs', 'ai',
   ARRAY['ai.code','ai.logs'], 'growth', ARRAY['pro']),
  ('support', 'Support', 'Tickets, FAQs y base de conocimiento', 'business',
   ARRAY['support.ticket','support.faq'], 'growth', ARRAY['pro']),
  ('events', 'Events', 'Calendario, RSVP y recordatorios', 'business',
   ARRAY['events.create','events.rsvp','events.remind'], 'growth', ARRAY['starter']),
  ('levels', 'Niveles', 'XP, rank y leaderboard', 'community',
   ARRAY['community.xp','community.level','community.leaderboard'], 'growth', ARRAY['starter']),
  ('economy', 'Economy', 'Monedas, tienda y daily', 'community',
   ARRAY['games.economy','games.daily','games.shop'], 'future', ARRAY['growth'])
ON CONFLICT (key) DO NOTHING;

-- Ampliar capabilities de módulos MVP existentes
UPDATE akoenet.assistant_modules SET
  capabilities = ARRAY[
    'moderation.automod','moderation.spam','moderation.flood','moderation.links',
    'moderation.invite_links','moderation.banned_words','moderation.anti_raid',
    'moderation.ban','moderation.kick','moderation.mute','moderation.timeout',
    'moderation.warn','moderation.unwarn','moderation.slowmode','moderation.purge',
    'moderation.lock','moderation.unlock','moderation.logs'
  ],
  updated_at = now()
WHERE key = 'guardian';

UPDATE akoenet.assistant_modules SET
  capabilities = ARRAY[
    'stream.notify','stream.schedule','stream.clip','stream.highlight',
    'stream.vod','stream.twitch_alerts','stream.youtube_alerts'
  ],
  updated_at = now()
WHERE key = 'streamer';

UPDATE akoenet.assistant_modules SET
  capabilities = ARRAY['ai.ask','ai.summarize','ai.translate','ai.search_messages'],
  updated_at = now()
WHERE key = 'assistant';

UPDATE akoenet.assistant_modules SET
  capabilities = ARRAY['knowledge.search','knowledge.faq','knowledge.add'],
  updated_at = now()
WHERE key = 'knowledge';

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('akoenet', 3, 'AkoeNet Assistant events + catalog expansion', '033_akoenet_assistant_expansion.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 3),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

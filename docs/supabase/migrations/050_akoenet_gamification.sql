-- 050 — AkoeNet gamification (platform mirror / Hub future)
-- Primary awards live on akoenet-backend local DB. This schema mirrors for analytics/Hub.

CREATE TABLE IF NOT EXISTS akoenet.member_xp (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  xp_total integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  prestige integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  reputation_score integer NOT NULL DEFAULT 0,
  reputation_votes integer NOT NULL DEFAULT 0,
  cosmetics jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_akoenet_member_xp_board
  ON akoenet.member_xp (server_id, xp_total DESC);

CREATE TABLE IF NOT EXISTS akoenet.xp_ledger (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  source_event text NOT NULL,
  source_id text NOT NULL,
  amount integer NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, source_event, source_id, user_id)
);

CREATE TABLE IF NOT EXISTS akoenet.reputation_votes (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  message_legacy_id integer,
  reason text NOT NULL DEFAULT 'helpful',
  delta integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_akoenet_reputation_to
  ON akoenet.reputation_votes (server_id, to_user_id);

CREATE TABLE IF NOT EXISTS akoenet.quest_progress (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  quest_key text NOT NULL,
  period_key text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  target integer NOT NULL,
  completed_at timestamptz,
  claimed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, user_id, quest_key, period_key)
);

CREATE INDEX IF NOT EXISTS idx_akoenet_quest_progress_user
  ON akoenet.quest_progress (server_id, user_id, period_key);

ALTER TABLE akoenet.member_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE akoenet.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE akoenet.reputation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE akoenet.quest_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'akoenet' AND tablename = 'member_xp'
      AND policyname = 'dakinis_block_anon_authenticated'
  ) THEN
    CREATE POLICY dakinis_block_anon_authenticated ON akoenet.member_xp
      FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'akoenet' AND tablename = 'xp_ledger'
      AND policyname = 'dakinis_block_anon_authenticated'
  ) THEN
    CREATE POLICY dakinis_block_anon_authenticated ON akoenet.xp_ledger
      FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'akoenet' AND tablename = 'reputation_votes'
      AND policyname = 'dakinis_block_anon_authenticated'
  ) THEN
    CREATE POLICY dakinis_block_anon_authenticated ON akoenet.reputation_votes
      FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'akoenet' AND tablename = 'quest_progress'
      AND policyname = 'dakinis_block_anon_authenticated'
  ) THEN
    CREATE POLICY dakinis_block_anon_authenticated ON akoenet.quest_progress
      FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
  END IF;
END $$;

UPDATE akoenet.assistant_modules
SET phase = 'mvp',
    description = 'XP por contribución, niveles, reputación, misiones y AK Coins'
WHERE key = 'levels';

INSERT INTO meta.migration_history (migration_file, notes)
VALUES ('050_akoenet_gamification.sql', 'akoenet member_xp / ledger / reputation / quests')
ON CONFLICT (migration_file) DO NOTHING;

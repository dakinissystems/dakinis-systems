-- Media Player — schema inicial (Supabase)
-- Ejecutar tras 006_akoenet.sql · orden en docs/supabase/migrations/RUN-ORDER.md (pendiente numeración)

CREATE SCHEMA IF NOT EXISTS media;

-- Tracks (metadata; binaries en R2 o local-only)
CREATE TABLE IF NOT EXISTS media.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Unknown',
  artist text NOT NULL DEFAULT 'Unknown',
  album text,
  duration_ms integer NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  source text NOT NULL DEFAULT 'local'
    CHECK (source IN ('local', 'upload', 'radio', 'plugin')),
  storage_key text,
  cover_url text,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_tracks_owner ON media.tracks(owner_id, created_at DESC);

-- Playlists
CREATE TABLE IF NOT EXISTS media.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_playlists_user ON media.playlists(user_id);

CREATE TABLE IF NOT EXISTS media.playlist_tracks (
  playlist_id uuid NOT NULL REFERENCES media.playlists(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, track_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_playlist_tracks_position
  ON media.playlist_tracks(playlist_id, position);

-- Favorites
CREATE TABLE IF NOT EXISTS media.favorites (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

-- Skins registry
CREATE TABLE IF NOT EXISTS media.skins (
  id text PRIMARY KEY,
  name text NOT NULL,
  author text NOT NULL DEFAULT 'community',
  version text NOT NULL DEFAULT '1.0.0',
  manifest jsonb NOT NULL DEFAULT '{}',
  package_url text,
  is_official boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media.user_skins (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  skin_id text NOT NULL REFERENCES media.skins(id) ON DELETE CASCADE,
  installed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skin_id)
);

-- Listening rooms (listen together)
CREATE TABLE IF NOT EXISTS media.listening_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  server_id uuid,
  voice_channel_id uuid,
  name text,
  current_track_id uuid REFERENCES media.tracks(id) ON DELETE SET NULL,
  position_ms bigint NOT NULL DEFAULT 0,
  playing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_rooms_server ON media.listening_rooms(server_id)
  WHERE server_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS media.room_members (
  room_id uuid NOT NULL REFERENCES media.listening_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'listener' CHECK (role IN ('owner', 'dj', 'listener')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- Play history (scrobble / Last.fm plugin)
CREATE TABLE IF NOT EXISTS media.play_events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES media.tracks(id) ON DELETE SET NULL,
  played_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer,
  source text
);

CREATE INDEX IF NOT EXISTS idx_media_play_events_user ON media.play_events(user_id, played_at DESC);

-- RLS enable (policies en migración dedicada 035_media_rls.sql)
ALTER TABLE media.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.listening_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.play_events ENABLE ROW LEVEL SECURITY;

COMMENT ON SCHEMA media IS 'Dakinis Media Player — addon AkoeNet';

-- 034_akoenet_media_player.sql
-- Dakinis Media Player — schema media + RLS base
-- Ejecutar en Supabase cuando el add-on entre en beta

CREATE SCHEMA IF NOT EXISTS media;

DO $$ BEGIN
  CREATE TYPE media.track_source AS ENUM ('local', 'url', 'jellyfin', 'radio', 'upload');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media.room_member_role AS ENUM ('leader', 'follower');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS media.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Unknown',
  artist text NOT NULL DEFAULT '',
  album text NOT NULL DEFAULT '',
  duration_ms integer NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  source_type media.track_source NOT NULL DEFAULT 'url',
  source_ref text NOT NULL,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media.playlist_tracks (
  playlist_id uuid NOT NULL REFERENCES media.playlists(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, track_id)
);

CREATE TABLE IF NOT EXISTS media.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE IF NOT EXISTS media.skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  manifest jsonb NOT NULL DEFAULT '{}',
  package_url text,
  marketplace_listed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media.listening_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  akoenet_server_id bigint,
  akoenet_channel_id bigint,
  current_track_id uuid REFERENCES media.tracks(id) ON DELETE SET NULL,
  position_ms integer NOT NULL DEFAULT 0,
  is_playing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media.room_members (
  room_id uuid NOT NULL REFERENCES media.listening_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role media.room_member_role NOT NULL DEFAULT 'follower',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_media_tracks_owner ON media.tracks (owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_playlist_tracks_order ON media.playlist_tracks (playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_media_rooms_server ON media.listening_rooms (akoenet_server_id, akoenet_channel_id);

ALTER TABLE media.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.listening_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_tracks_owner ON media.tracks
  FOR ALL USING (auth.uid() = owner_user_id);

CREATE POLICY media_playlists_owner ON media.playlists
  FOR ALL USING (auth.uid() = user_id OR is_public);

CREATE POLICY media_favorites_owner ON media.favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY media_rooms_member ON media.listening_rooms
  FOR SELECT USING (
    auth.uid() = owner_user_id
    OR EXISTS (
      SELECT 1 FROM media.room_members rm
      WHERE rm.room_id = listening_rooms.id AND rm.user_id = auth.uid()
    )
  );

INSERT INTO media.skins (slug, name, manifest, marketplace_listed)
VALUES (
  'classic',
  'Classic',
  '{"id":"classic","name":"Classic","colors":{"text":"#00ff00","background":"#181818"}}'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;

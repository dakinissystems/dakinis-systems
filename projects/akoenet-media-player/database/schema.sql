-- Dakinis Media Player — schema reference
-- Target: Supabase / Postgres · schema `media` (RLS en migración dedicada)

CREATE SCHEMA IF NOT EXISTS media;

CREATE TYPE media.track_source AS ENUM (
  'local',
  'url',
  'jellyfin',
  'radio',
  'upload'
);

CREATE TABLE media.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Unknown',
  artist text NOT NULL DEFAULT '',
  album text NOT NULL DEFAULT '',
  duration_ms integer NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  source_type media.track_source NOT NULL DEFAULT 'url',
  source_ref text NOT NULL,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media.playlist_tracks (
  playlist_id uuid NOT NULL REFERENCES media.playlists(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_order ON media.playlist_tracks (playlist_id, position);

CREATE TABLE media.favorites (
  user_id uuid NOT NULL,
  track_id uuid NOT NULL REFERENCES media.tracks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE media.skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  author_user_id uuid,
  manifest jsonb NOT NULL DEFAULT '{}',
  package_url text,
  marketplace_listed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE media.room_member_role AS ENUM ('leader', 'follower');

CREATE TABLE media.listening_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  akoenet_server_id bigint,
  akoenet_channel_id bigint,
  current_track_id uuid REFERENCES media.tracks(id) ON DELETE SET NULL,
  position_ms integer NOT NULL DEFAULT 0,
  is_playing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media.room_members (
  room_id uuid NOT NULL REFERENCES media.listening_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role media.room_member_role NOT NULL DEFAULT 'follower',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_tracks_owner ON media.tracks (owner_user_id, created_at DESC);
CREATE INDEX idx_rooms_server_channel ON media.listening_rooms (akoenet_server_id, akoenet_channel_id);

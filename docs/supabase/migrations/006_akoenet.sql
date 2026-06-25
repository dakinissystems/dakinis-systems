-- 006 — AkoeNet (schema akoenet)
-- Migración desde public.users, servers, channels, messages, etc.

CREATE TABLE IF NOT EXISTS akoenet.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  avatar_url text,
  banner_url text,
  accent_color text,
  bio text,
  presence_status text NOT NULL DEFAULT 'online',
  custom_status text,
  twitch_username text UNIQUE,
  scheduler_streamer_username text,
  birth_date date,
  age_verified_at timestamptz,
  push_notifications_enabled boolean NOT NULL DEFAULT true,
  steam_id text,
  share_game_activity boolean NOT NULL DEFAULT true,
  desktop_game_detect_opt_in boolean NOT NULL DEFAULT false,
  manual_activity_game text,
  manual_activity_platform text,
  terms_version text,
  terms_accepted_at timestamptz,
  deleted_at timestamptz,
  erased_at timestamptz,
  deletion_reason text,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.servers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  tag text,
  is_system boolean NOT NULL DEFAULT false,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_akoenet_servers_owner ON akoenet.servers (owner_id);

CREATE TABLE IF NOT EXISTS akoenet.server_members (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, server_id)
);

CREATE TABLE IF NOT EXISTS akoenet.roles (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  tenant_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, slug)
);

CREATE TABLE IF NOT EXISTS akoenet.role_permissions (
  role_id bigint NOT NULL REFERENCES akoenet.roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS akoenet.user_role_assignments (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  role_id bigint NOT NULL REFERENCES akoenet.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS akoenet.channel_categories (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.channels (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  category_id bigint REFERENCES akoenet.channel_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  position integer NOT NULL DEFAULT 0,
  is_private boolean NOT NULL DEFAULT false,
  voice_user_limit integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_akoenet_channels_server ON akoenet.channels (server_id);

CREATE TABLE IF NOT EXISTS akoenet.channel_permissions (
  channel_id bigint NOT NULL REFERENCES akoenet.channels(id) ON DELETE CASCADE,
  role_id bigint NOT NULL REFERENCES akoenet.roles(id) ON DELETE CASCADE,
  can_view boolean NOT NULL DEFAULT true,
  can_send boolean NOT NULL DEFAULT true,
  can_connect boolean NOT NULL DEFAULT true,
  PRIMARY KEY (channel_id, role_id)
);

CREATE TABLE IF NOT EXISTS akoenet.channel_user_permissions (
  channel_id bigint NOT NULL REFERENCES akoenet.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  can_view boolean NOT NULL DEFAULT true,
  can_send boolean NOT NULL DEFAULT true,
  can_connect boolean NOT NULL DEFAULT true,
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS akoenet.messages (
  id bigserial PRIMARY KEY,
  channel_id bigint NOT NULL REFERENCES akoenet.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  pinned_by uuid REFERENCES dakinis_auth.users(id),
  edited_at timestamptz,
  reply_to_id bigint REFERENCES akoenet.messages(id) ON DELETE SET NULL,
  thread_root_message_id bigint REFERENCES akoenet.messages(id) ON DELETE SET NULL,
  dmca_removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_akoenet_messages_channel ON akoenet.messages (channel_id, created_at DESC);

CREATE TABLE IF NOT EXISTS akoenet.message_reactions (
  id bigserial PRIMARY KEY,
  message_id bigint NOT NULL REFERENCES akoenet.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  reaction_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, reaction_key)
);

CREATE TABLE IF NOT EXISTS akoenet.message_edit_history (
  id bigserial PRIMARY KEY,
  message_id bigint REFERENCES akoenet.messages(id) ON DELETE CASCADE,
  direct_message_id bigint,
  old_content text NOT NULL,
  new_content text NOT NULL,
  edited_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  edited_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.direct_conversations (
  id bigserial PRIMARY KEY,
  user_low_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  user_high_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_low_id, user_high_id)
);

CREATE TABLE IF NOT EXISTS akoenet.direct_messages (
  id bigserial PRIMARY KEY,
  conversation_id bigint NOT NULL REFERENCES akoenet.direct_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  edited_at timestamptz,
  reply_to_id bigint REFERENCES akoenet.direct_messages(id),
  dmca_removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.server_invites (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.server_emojis (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text NOT NULL,
  created_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, name)
);

CREATE TABLE IF NOT EXISTS akoenet.server_webhooks (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  event_types text[] NOT NULL DEFAULT '{message.create}',
  created_by uuid REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.server_bans (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  reason text,
  banned_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.server_custom_commands (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  command_name text NOT NULL,
  response text NOT NULL,
  action_type text NOT NULL DEFAULT 'none',
  action_value text,
  created_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, command_name)
);

CREATE TABLE IF NOT EXISTS akoenet.server_calendar_events (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.server_announcements (
  id bigserial PRIMARY KEY,
  server_id bigint NOT NULL REFERENCES akoenet.servers(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid NOT NULL REFERENCES dakinis_auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.push_subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  subscription_type text NOT NULL DEFAULT 'web' CHECK (subscription_type IN ('web', 'native')),
  endpoint text,
  p256dh text,
  auth text,
  native_platform text CHECK (native_platform IS NULL OR native_platform IN ('android', 'ios')),
  native_token text,
  device_id text,
  device_name text,
  app_version text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.user_friendships (
  id bigserial PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS akoenet.user_blocks (
  blocker_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS akoenet.legal_terms_acceptances (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  terms_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akoenet.voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id bigint NOT NULL REFERENCES akoenet.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz
);

CREATE TABLE IF NOT EXISTS akoenet.presence (
  user_id uuid PRIMARY KEY REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'offline',
  custom_status text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Staging: espejo del esquema AkoeNet standalone (proyecto Supabase "AkoeNet")
-- Ejecutar en dakinis-platform ANTES de importar datos con migrate-akoenet-to-platform.ps1

CREATE SCHEMA IF NOT EXISTS legacy_akoenet;

DROP SCHEMA IF EXISTS legacy_akoenet CASCADE;
CREATE SCHEMA legacy_akoenet;

CREATE TABLE legacy_akoenet.users (
  id integer PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_admin boolean NOT NULL DEFAULT false,
  banner_url text,
  accent_color text,
  bio text,
  presence_status text NOT NULL DEFAULT 'online',
  custom_status text,
  twitch_username text,
  scheduler_streamer_username text,
  deleted_at timestamptz,
  erased_at timestamptz,
  deletion_reason text,
  birth_date date,
  age_verified_at timestamptz,
  totp_secret text,
  totp_pending_secret text,
  totp_enabled boolean NOT NULL DEFAULT false,
  push_notifications_enabled boolean NOT NULL DEFAULT true,
  steam_id text,
  share_game_activity boolean NOT NULL DEFAULT true,
  desktop_game_detect_opt_in boolean NOT NULL DEFAULT false,
  manual_activity_game text,
  manual_activity_platform text,
  terms_version text,
  terms_accepted_at timestamptz
);

CREATE TABLE legacy_akoenet.servers (
  id integer PRIMARY KEY,
  name text NOT NULL,
  owner_id integer NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  tag varchar
);

CREATE TABLE legacy_akoenet.server_members (
  id integer PRIMARY KEY,
  user_id integer NOT NULL,
  server_id integer NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.roles (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  name text NOT NULL,
  slug varchar NOT NULL
);

CREATE TABLE legacy_akoenet.user_roles (
  user_id integer NOT NULL,
  role_id integer NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE legacy_akoenet.channel_categories (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.channels (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  category_id integer,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_private boolean NOT NULL DEFAULT false,
  voice_user_limit integer
);

CREATE TABLE legacy_akoenet.channel_permissions (
  channel_id integer NOT NULL,
  role_id integer NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_send boolean NOT NULL DEFAULT true,
  can_connect boolean NOT NULL DEFAULT true,
  PRIMARY KEY (channel_id, role_id)
);

CREATE TABLE legacy_akoenet.channel_user_permissions (
  channel_id integer NOT NULL,
  user_id integer NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_send boolean NOT NULL DEFAULT true,
  can_connect boolean NOT NULL DEFAULT true,
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE legacy_akoenet.messages (
  id integer PRIMARY KEY,
  channel_id integer NOT NULL,
  user_id integer NOT NULL,
  content text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  pinned_by integer,
  edited_at timestamptz,
  reply_to_id integer,
  dmca_removed_at timestamptz,
  thread_root_message_id bigint
);

CREATE TABLE legacy_akoenet.direct_conversations (
  id integer PRIMARY KEY,
  user_low_id integer NOT NULL,
  user_high_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.direct_messages (
  id integer PRIMARY KEY,
  conversation_id integer NOT NULL,
  sender_id integer NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  reply_to_id integer,
  dmca_removed_at timestamptz
);

CREATE TABLE legacy_akoenet.server_invites (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  created_by integer NOT NULL,
  token text NOT NULL,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.server_emojis (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  created_by integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.message_reactions (
  id integer PRIMARY KEY,
  message_id integer NOT NULL,
  user_id integer NOT NULL,
  reaction_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.admin_audit_logs (
  id integer PRIMARY KEY,
  actor_user_id integer NOT NULL,
  action text NOT NULL,
  target_message_id integer,
  channel_id integer,
  server_id integer,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.dmca_takedowns (
  id integer PRIMARY KEY,
  complainant_name text NOT NULL,
  complainant_email text NOT NULL,
  complainant_phone text,
  copyright_holder text NOT NULL,
  infringing_url text NOT NULL,
  original_work_url text,
  description text NOT NULL,
  good_faith_statement boolean NOT NULL,
  accuracy_statement boolean NOT NULL,
  signature text NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  resolution_notes text,
  resolved_by integer,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE legacy_akoenet.dpo_requests (
  id integer PRIMARY KEY,
  name varchar NOT NULL,
  email varchar NOT NULL,
  subject varchar,
  message text NOT NULL,
  request_type varchar NOT NULL DEFAULT 'general',
  status varchar NOT NULL DEFAULT 'pending',
  response text,
  responded_by integer,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE legacy_akoenet.push_subscriptions (
  id bigint PRIMARY KEY,
  user_id bigint NOT NULL,
  endpoint text,
  p256dh text,
  auth text,
  created_at timestamptz NOT NULL DEFAULT now(),
  subscription_type text NOT NULL DEFAULT 'web',
  native_platform text,
  native_token text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  device_id text,
  device_name text,
  app_version text,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.user_friendships (
  id bigint PRIMARY KEY,
  requester_id bigint NOT NULL,
  addressee_id bigint NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.user_blocks (
  blocker_id bigint NOT NULL,
  blocked_id bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE legacy_akoenet.server_webhooks (
  id bigint PRIMARY KEY,
  server_id bigint NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  event_types text[] NOT NULL DEFAULT '{message.create}',
  created_by bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.server_bans (
  id bigint PRIMARY KEY,
  server_id bigint NOT NULL,
  user_id bigint NOT NULL,
  reason text,
  banned_by bigint NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by bigint
);

CREATE TABLE legacy_akoenet.message_edit_history (
  id bigint PRIMARY KEY,
  message_id bigint,
  direct_message_id bigint,
  old_content text NOT NULL,
  new_content text NOT NULL,
  edited_by bigint NOT NULL,
  edited_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.legal_terms_acceptances (
  id integer PRIMARY KEY,
  user_id integer NOT NULL,
  terms_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE legacy_akoenet.server_custom_commands (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  command_name text NOT NULL,
  response text NOT NULL,
  created_by integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  action_type text NOT NULL DEFAULT 'none',
  action_value text
);

CREATE TABLE legacy_akoenet.server_calendar_events (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_by integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.server_announcements (
  id integer PRIMARY KEY,
  server_id integer NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_by integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legacy_akoenet.role_server_permissions (
  role_id integer NOT NULL,
  permission_key text NOT NULL,
  PRIMARY KEY (role_id, permission_key)
);

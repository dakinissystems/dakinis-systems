-- 005 — StreamAutomator (schema stream)
-- Migración desde public."Users", "Contents", "Media", etc.

CREATE TABLE IF NOT EXISTS stream.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  license_type text NOT NULL DEFAULT 'none',
  license_expires_at timestamptz,
  has_used_trial boolean NOT NULL DEFAULT false,
  trial_extensions integer NOT NULL DEFAULT 0,
  merchandising_link text,
  merchandising_button_position text,
  dashboard_prefs jsonb NOT NULL DEFAULT '{"showTwitchSubs":true,"showTwitchBits":true,"showTwitchDonations":false}',
  public_page_banner_url text,
  public_page_banner_position text DEFAULT 'top',
  stream_goal_type text,
  stream_goal_target integer,
  nightbot_api_key text UNIQUE,
  discord_clips_guild_id text,
  discord_clips_channel_id text,
  discord_announce_webhook_url text,
  akoenet_webhook_url text,
  akoenet_webhook_secret text,
  akoenet_announce_channel_id text,
  akoenet_send_clips boolean NOT NULL DEFAULT false,
  akoenet_server_id text,
  profile_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.system_configs (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.contents (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  hashtags text,
  mentions text,
  platforms jsonb NOT NULL DEFAULT '[]',
  timezone text,
  recurrence jsonb,
  files jsonb,
  status text NOT NULL DEFAULT 'scheduled',
  discord_guild_id text,
  discord_channel_id text,
  discord_announcement_channel_id text,
  published_at timestamptz,
  publish_error text,
  deleted_at timestamptz,
  event_end_time timestamptz,
  event_dates jsonb,
  event_location_url text,
  idempotency_keys jsonb,
  retry_count integer NOT NULL DEFAULT 0,
  last_retry_at timestamptz,
  discord_event_id text,
  local_version integer NOT NULL DEFAULT 1,
  discord_event_version integer,
  discord_sync_hash text,
  last_synced_at timestamptz,
  twitch_segment_id text,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stream_contents_user ON stream.contents (user_id);
CREATE INDEX IF NOT EXISTS idx_stream_contents_scheduled ON stream.contents (scheduled_for) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stream_contents_tenant ON stream.contents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stream_contents_status ON stream.contents (status);

CREATE TABLE IF NOT EXISTS stream.media (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  filename text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL,
  url text NOT NULL,
  storage_path text NOT NULL,
  thumbnail_url text,
  metadata jsonb,
  deleted_at timestamptz,
  legacy_id integer UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stream_media_user ON stream.media (user_id);

CREATE TABLE IF NOT EXISTS stream.content_media (
  content_id bigint NOT NULL REFERENCES stream.contents(id) ON DELETE CASCADE,
  media_id bigint NOT NULL REFERENCES stream.media(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_id, media_id)
);

CREATE TABLE IF NOT EXISTS stream.content_platforms (
  id bigserial PRIMARY KEY,
  content_id bigint NOT NULL REFERENCES stream.contents(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  external_id text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  published_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_platforms_content ON stream.content_platforms (content_id);

CREATE TABLE IF NOT EXISTS stream.content_templates (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  content text NOT NULL,
  content_type text NOT NULL,
  platforms text[] NOT NULL DEFAULT '{}',
  hashtags text,
  mentions text,
  variables jsonb NOT NULL DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.platform_connections (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

CREATE TABLE IF NOT EXISTS stream.integrations (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  provider text NOT NULL,
  provider_user_id text,
  access_token text,
  refresh_token text,
  scopes jsonb,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stream_integrations_user ON stream.integrations (user_id);

CREATE TABLE IF NOT EXISTS stream.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  bucket text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.todos (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.stream_reminders (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.reminder_sents (
  id bigserial PRIMARY KEY,
  stream_reminder_id bigint NOT NULL REFERENCES stream.stream_reminders(id) ON DELETE CASCADE,
  content_id bigint NOT NULL REFERENCES stream.contents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stream_reminder_id, content_id)
);

CREATE TABLE IF NOT EXISTS stream.stream_items (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.stream_suggestions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  suggested_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.stream_timeline_events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.twitch_bit_events (
  id bigserial PRIMARY KEY,
  broadcaster_user_id text NOT NULL,
  user_id text NOT NULL,
  user_login text,
  user_name text,
  bits integer NOT NULL DEFAULT 0,
  message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.twitch_eventsub_subscriptions (
  id bigserial PRIMARY KEY,
  broadcaster_user_id text NOT NULL UNIQUE,
  subscription_id text,
  secret text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.publication_metrics (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  completed_at timestamptz NOT NULL,
  duration_ms integer NOT NULL,
  attempts_made integer NOT NULL DEFAULT 1,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.support_messages (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid REFERENCES dakinis_auth.users(id),
  read_at timestamptz,
  read_by uuid REFERENCES dakinis_auth.users(id),
  priority text NOT NULL DEFAULT 'normal',
  category text,
  attachments jsonb NOT NULL DEFAULT '[]',
  reply_attachments jsonb NOT NULL DEFAULT '[]',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES dakinis_auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.support_replies (
  id bigserial PRIMARY KEY,
  message_id bigint NOT NULL REFERENCES stream.support_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream.scheduler_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id bigint REFERENCES stream.contents(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  run_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scheduler_events_run ON stream.scheduler_events (run_at) WHERE status = 'pending';

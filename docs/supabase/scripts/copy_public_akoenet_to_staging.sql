-- Copia tablas AkoeNet desde public → legacy_akoenet (mismo proyecto Supabase)
-- Usar cuando AKOENET y PLATFORM son la misma base (no hace falta pg_dump entre proyectos).
-- Requiere: legacy_akoenet_staging.sql ya ejecutado.
-- Nota: public.* puede tener columnas extra (ej. platform_user_id); solo copiamos columnas AkoeNet.

TRUNCATE legacy_akoenet.role_server_permissions CASCADE;
TRUNCATE legacy_akoenet.server_announcements CASCADE;
TRUNCATE legacy_akoenet.server_calendar_events CASCADE;
TRUNCATE legacy_akoenet.server_custom_commands CASCADE;
TRUNCATE legacy_akoenet.legal_terms_acceptances CASCADE;
TRUNCATE legacy_akoenet.message_edit_history CASCADE;
TRUNCATE legacy_akoenet.server_bans CASCADE;
TRUNCATE legacy_akoenet.server_webhooks CASCADE;
TRUNCATE legacy_akoenet.user_blocks CASCADE;
TRUNCATE legacy_akoenet.user_friendships CASCADE;
TRUNCATE legacy_akoenet.push_subscriptions CASCADE;
TRUNCATE legacy_akoenet.dpo_requests CASCADE;
TRUNCATE legacy_akoenet.dmca_takedowns CASCADE;
TRUNCATE legacy_akoenet.admin_audit_logs CASCADE;
TRUNCATE legacy_akoenet.message_reactions CASCADE;
TRUNCATE legacy_akoenet.server_emojis CASCADE;
TRUNCATE legacy_akoenet.server_invites CASCADE;
TRUNCATE legacy_akoenet.direct_messages CASCADE;
TRUNCATE legacy_akoenet.direct_conversations CASCADE;
TRUNCATE legacy_akoenet.messages CASCADE;
TRUNCATE legacy_akoenet.channel_user_permissions CASCADE;
TRUNCATE legacy_akoenet.channel_permissions CASCADE;
TRUNCATE legacy_akoenet.channels CASCADE;
TRUNCATE legacy_akoenet.channel_categories CASCADE;
TRUNCATE legacy_akoenet.user_roles CASCADE;
TRUNCATE legacy_akoenet.roles CASCADE;
TRUNCATE legacy_akoenet.server_members CASCADE;
TRUNCATE legacy_akoenet.servers CASCADE;
TRUNCATE legacy_akoenet.users CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'public.users no existe. ¿Datos aún en otro proyecto Supabase? Usa migrate-akoenet-to-platform.ps1';
  END IF;
END $$;

INSERT INTO legacy_akoenet.users (
  id, username, email, password, avatar_url, created_at, is_admin,
  banner_url, accent_color, bio, presence_status, custom_status,
  twitch_username, scheduler_streamer_username, deleted_at, erased_at,
  deletion_reason, birth_date, age_verified_at, totp_secret, totp_pending_secret,
  totp_enabled, push_notifications_enabled, steam_id, share_game_activity,
  desktop_game_detect_opt_in, manual_activity_game, manual_activity_platform,
  terms_version, terms_accepted_at
)
SELECT
  id, username, email, password, avatar_url, created_at, is_admin,
  banner_url, accent_color, bio, presence_status, custom_status,
  twitch_username, scheduler_streamer_username, deleted_at, erased_at,
  deletion_reason, birth_date, age_verified_at, totp_secret, totp_pending_secret,
  totp_enabled, push_notifications_enabled, steam_id, share_game_activity,
  desktop_game_detect_opt_in, manual_activity_game, manual_activity_platform,
  terms_version, terms_accepted_at
FROM public.users;

INSERT INTO legacy_akoenet.servers (id, name, owner_id, is_system, created_at, tag)
SELECT id, name, owner_id, is_system, created_at, tag::varchar
FROM public.servers;

INSERT INTO legacy_akoenet.server_members (id, user_id, server_id, joined_at)
SELECT id, user_id, server_id, joined_at
FROM public.server_members;

INSERT INTO legacy_akoenet.roles (id, server_id, name, slug)
SELECT r.id::integer, r.server_id::integer, r.name, r.slug::varchar
FROM public.roles r
WHERE r.server_id IS NOT NULL;

INSERT INTO legacy_akoenet.user_roles (user_id, role_id)
SELECT user_id::integer, role_id::integer
FROM public.user_roles;

INSERT INTO legacy_akoenet.channel_categories (id, server_id, name, position, created_at)
SELECT id, server_id, name, position, created_at
FROM public.channel_categories;

INSERT INTO legacy_akoenet.channels (
  id, server_id, category_id, name, type, position, created_at, is_private, voice_user_limit
)
SELECT id, server_id, category_id, name, type, position, created_at, is_private, voice_user_limit
FROM public.channels;

INSERT INTO legacy_akoenet.channel_permissions (channel_id, role_id, can_view, can_send, can_connect)
SELECT channel_id, role_id, can_view, can_send, can_connect
FROM public.channel_permissions;

INSERT INTO legacy_akoenet.channel_user_permissions (channel_id, user_id, can_view, can_send, can_connect)
SELECT channel_id, user_id, can_view, can_send, can_connect
FROM public.channel_user_permissions;

INSERT INTO legacy_akoenet.messages (
  id, channel_id, user_id, content, image_url, created_at, is_pinned, pinned_at,
  pinned_by, edited_at, reply_to_id, dmca_removed_at, thread_root_message_id
)
SELECT
  id, channel_id, user_id, content, image_url, created_at, is_pinned, pinned_at,
  pinned_by, edited_at, reply_to_id, dmca_removed_at, thread_root_message_id
FROM public.messages;

INSERT INTO legacy_akoenet.direct_conversations (id, user_low_id, user_high_id, created_at)
SELECT id, user_low_id, user_high_id, created_at
FROM public.direct_conversations;

INSERT INTO legacy_akoenet.direct_messages (
  id, conversation_id, sender_id, content, image_url, created_at, edited_at, reply_to_id, dmca_removed_at
)
SELECT id, conversation_id, sender_id, content, image_url, created_at, edited_at, reply_to_id, dmca_removed_at
FROM public.direct_messages;

INSERT INTO legacy_akoenet.server_invites (
  id, server_id, created_by, token, max_uses, used_count, expires_at, is_active, created_at
)
SELECT id, server_id, created_by, token, max_uses, used_count, expires_at, is_active, created_at
FROM public.server_invites;

INSERT INTO legacy_akoenet.server_emojis (id, server_id, name, image_url, created_by, created_at)
SELECT id, server_id, name, image_url, created_by, created_at
FROM public.server_emojis;

INSERT INTO legacy_akoenet.message_reactions (id, message_id, user_id, reaction_key, created_at)
SELECT id, message_id, user_id, reaction_key, created_at
FROM public.message_reactions;

INSERT INTO legacy_akoenet.admin_audit_logs (
  id, actor_user_id, action, target_message_id, channel_id, server_id, metadata, created_at
)
SELECT id, actor_user_id, action, target_message_id, channel_id, server_id, metadata, created_at
FROM public.admin_audit_logs;

INSERT INTO legacy_akoenet.dmca_takedowns (
  id, complainant_name, complainant_email, complainant_phone, copyright_holder,
  infringing_url, original_work_url, description, good_faith_statement, accuracy_statement,
  signature, status, resolution_notes, resolved_by, resolved_at, created_at, updated_at
)
SELECT
  id, complainant_name, complainant_email, complainant_phone, copyright_holder,
  infringing_url, original_work_url, description, good_faith_statement, accuracy_statement,
  signature, status, resolution_notes, resolved_by, resolved_at, created_at, updated_at
FROM public.dmca_takedowns;

INSERT INTO legacy_akoenet.dpo_requests (
  id, name, email, subject, message, request_type, status, response,
  responded_by, responded_at, created_at, updated_at
)
SELECT id, name, email, subject, message, request_type, status, response,
  responded_by, responded_at, created_at, updated_at
FROM public.dpo_requests;

INSERT INTO legacy_akoenet.push_subscriptions (
  id, user_id, endpoint, p256dh, auth, created_at, subscription_type,
  native_platform, native_token, updated_at, device_id, device_name, app_version, last_seen_at
)
SELECT
  id, user_id, endpoint, p256dh, auth, created_at, subscription_type,
  native_platform, native_token, updated_at, device_id, device_name, app_version, last_seen_at
FROM public.push_subscriptions;

INSERT INTO legacy_akoenet.user_friendships (id, requester_id, addressee_id, status, created_at)
SELECT id, requester_id, addressee_id, status, created_at
FROM public.user_friendships;

INSERT INTO legacy_akoenet.user_blocks (blocker_id, blocked_id, created_at)
SELECT blocker_id, blocked_id, created_at
FROM public.user_blocks;

INSERT INTO legacy_akoenet.server_webhooks (id, server_id, url, secret, event_types, created_by, created_at)
SELECT id, server_id, url, secret, event_types, created_by, created_at
FROM public.server_webhooks;

INSERT INTO legacy_akoenet.server_bans (
  id, server_id, user_id, reason, banned_by, expires_at, created_at, revoked_at, revoked_by
)
SELECT id, server_id, user_id, reason, banned_by, expires_at, created_at, revoked_at, revoked_by
FROM public.server_bans;

INSERT INTO legacy_akoenet.message_edit_history (
  id, message_id, direct_message_id, old_content, new_content, edited_by, edited_at
)
SELECT id, message_id, direct_message_id, old_content, new_content, edited_by, edited_at
FROM public.message_edit_history;

INSERT INTO legacy_akoenet.legal_terms_acceptances (id, user_id, terms_version, accepted_at)
SELECT id, user_id, terms_version, accepted_at
FROM public.legal_terms_acceptances;

INSERT INTO legacy_akoenet.server_custom_commands (
  id, server_id, command_name, response, created_by, created_at, updated_at, action_type, action_value
)
SELECT id, server_id, command_name, response, created_by, created_at, updated_at, action_type, action_value
FROM public.server_custom_commands;

INSERT INTO legacy_akoenet.server_calendar_events (
  id, server_id, title, description, starts_at, ends_at, created_by, created_at
)
SELECT id, server_id, title, description, starts_at, ends_at, created_by, created_at
FROM public.server_calendar_events;

INSERT INTO legacy_akoenet.server_announcements (id, server_id, title, body, created_by, created_at)
SELECT id, server_id, title, body, created_by, created_at
FROM public.server_announcements;

INSERT INTO legacy_akoenet.role_server_permissions (role_id, permission_key)
SELECT role_id, permission_key
FROM public.role_server_permissions;

SELECT 'users' AS tbl, count(*)::bigint FROM legacy_akoenet.users
UNION ALL SELECT 'servers', count(*) FROM legacy_akoenet.servers
UNION ALL SELECT 'messages', count(*) FROM legacy_akoenet.messages
UNION ALL SELECT 'channels', count(*) FROM legacy_akoenet.channels;

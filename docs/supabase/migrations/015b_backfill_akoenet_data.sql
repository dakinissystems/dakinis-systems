-- 015b — Backfill AkoeNet: legacy_akoenet.* → akoenet.*
-- Ejecutar tras 006_akoenet.sql y 014_backfill_legacy_map.sql (usuarios).
-- Origen: datos importados con scripts/migrate-akoenet-to-platform.ps1

-- Columnas legacy opcionales para mapeo de IDs
ALTER TABLE akoenet.roles ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;
ALTER TABLE akoenet.channel_categories ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;
ALTER TABLE akoenet.channels ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;
ALTER TABLE akoenet.messages ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;
ALTER TABLE akoenet.direct_conversations ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;
ALTER TABLE akoenet.direct_messages ADD COLUMN IF NOT EXISTS legacy_id integer UNIQUE;

CREATE OR REPLACE FUNCTION akoenet._legacy_user_uuid(p_legacy_id bigint)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = akoenet, dakinis_auth, pg_catalog, pg_temp
AS $$
  SELECT m.user_id
  FROM dakinis_auth.legacy_id_map m
  WHERE m.legacy_schema = 'akoenet'
    AND m.legacy_table = 'users'
    AND m.legacy_id = p_legacy_id::integer
  LIMIT 1;
$$;

-- ─── 0) Usuarios desde legacy_akoenet (si 014 no los incluyó) ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'legacy_akoenet' AND table_name = 'users'
  ) THEN
    RAISE NOTICE 'legacy_akoenet.users no existe; omitiendo usuarios.';
    RETURN;
  END IF;

  INSERT INTO dakinis_auth.users (id, email, password_hash, role, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    lower(trim(u.email)),
    nullif(trim(u.password), ''),
    CASE WHEN u.is_admin THEN 'platform_admin' ELSE 'user' END,
    coalesce(u.created_at, now()),
    now()
  FROM legacy_akoenet.users u
  WHERE u.email IS NOT NULL AND trim(u.email) <> '' AND u.deleted_at IS NULL
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO dakinis_auth.legacy_id_map (legacy_schema, legacy_table, legacy_id, user_id)
  SELECT 'akoenet', 'users', u.id, au.id
  FROM legacy_akoenet.users u
  JOIN dakinis_auth.users au ON lower(au.email) = lower(trim(u.email))
  WHERE u.deleted_at IS NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO akoenet.user_profiles (
    user_id, username, avatar_url, banner_url, accent_color, bio, presence_status,
    custom_status, twitch_username, scheduler_streamer_username, birth_date,
    age_verified_at, push_notifications_enabled, steam_id, share_game_activity,
    desktop_game_detect_opt_in, manual_activity_game, manual_activity_platform,
    terms_version, terms_accepted_at, deleted_at, erased_at, deletion_reason, legacy_id,
    created_at, updated_at
  )
  SELECT
    m.user_id,
    u.username,
    u.avatar_url,
    u.banner_url,
    u.accent_color,
    u.bio,
    u.presence_status,
    u.custom_status,
    u.twitch_username,
    u.scheduler_streamer_username,
    u.birth_date,
    u.age_verified_at,
    u.push_notifications_enabled,
    u.steam_id,
    u.share_game_activity,
    u.desktop_game_detect_opt_in,
    u.manual_activity_game,
    u.manual_activity_platform,
    u.terms_version,
    u.terms_accepted_at,
    u.deleted_at,
    u.erased_at,
    u.deletion_reason,
    u.id,
    coalesce(u.created_at, now()),
    now()
  FROM legacy_akoenet.users u
  JOIN dakinis_auth.legacy_id_map m
    ON m.legacy_schema = 'akoenet' AND m.legacy_table = 'users' AND m.legacy_id = u.id
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    legacy_id = EXCLUDED.legacy_id;

  UPDATE dakinis_auth.users au
  SET totp_secret = u.totp_secret,
      totp_enabled = u.totp_enabled
  FROM legacy_akoenet.users u
  JOIN dakinis_auth.legacy_id_map m
    ON m.legacy_schema = 'akoenet' AND m.legacy_table = 'users' AND m.legacy_id = u.id
  WHERE au.id = m.user_id AND u.totp_enabled = true;

  RAISE NOTICE 'Usuarios AkoeNet: % perfiles', (SELECT count(*) FROM akoenet.user_profiles);
END $$;

-- ─── 1) Servers ───
INSERT INTO akoenet.servers (name, owner_id, tag, is_system, legacy_id, created_at)
SELECT
  s.name,
  akoenet._legacy_user_uuid(s.owner_id),
  s.tag::text,
  s.is_system,
  s.id,
  coalesce(s.created_at, now())
FROM legacy_akoenet.servers s
WHERE akoenet._legacy_user_uuid(s.owner_id) IS NOT NULL
ON CONFLICT (legacy_id) DO NOTHING;

-- ─── 2) Server members ───
INSERT INTO akoenet.server_members (user_id, server_id, joined_at)
SELECT
  akoenet._legacy_user_uuid(sm.user_id),
  srv.id,
  coalesce(sm.joined_at, now())
FROM legacy_akoenet.server_members sm
JOIN akoenet.servers srv ON srv.legacy_id = sm.server_id
WHERE akoenet._legacy_user_uuid(sm.user_id) IS NOT NULL
ON CONFLICT (user_id, server_id) DO NOTHING;

-- ─── 3) Roles + permissions ───
INSERT INTO akoenet.roles (server_id, name, slug, legacy_id)
SELECT srv.id, r.name, r.slug::text, r.id
FROM legacy_akoenet.roles r
JOIN akoenet.servers srv ON srv.legacy_id = r.server_id
ON CONFLICT (legacy_id) DO NOTHING;

INSERT INTO akoenet.role_permissions (role_id, permission_key)
SELECT ar.id, rsp.permission_key
FROM legacy_akoenet.role_server_permissions rsp
JOIN akoenet.roles ar ON ar.legacy_id = rsp.role_id
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.user_role_assignments (user_id, role_id)
SELECT akoenet._legacy_user_uuid(ur.user_id), ar.id
FROM legacy_akoenet.user_roles ur
JOIN akoenet.roles ar ON ar.legacy_id = ur.role_id
WHERE akoenet._legacy_user_uuid(ur.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── 4) Channel categories ───
INSERT INTO akoenet.channel_categories (server_id, name, position, created_at, legacy_id)
SELECT srv.id, cc.name, cc.position, coalesce(cc.created_at, now()), cc.id
FROM legacy_akoenet.channel_categories cc
JOIN akoenet.servers srv ON srv.legacy_id = cc.server_id
ON CONFLICT (legacy_id) DO NOTHING;

-- ─── 5) Channels ───
INSERT INTO akoenet.channels (
  server_id, category_id, name, type, position, is_private, voice_user_limit, created_at, legacy_id
)
SELECT
  srv.id,
  cat.id,
  ch.name,
  ch.type,
  ch.position,
  ch.is_private,
  ch.voice_user_limit,
  coalesce(ch.created_at, now()),
  ch.id
FROM legacy_akoenet.channels ch
JOIN akoenet.servers srv ON srv.legacy_id = ch.server_id
LEFT JOIN akoenet.channel_categories cat ON cat.legacy_id = ch.category_id
ON CONFLICT (legacy_id) DO NOTHING;

-- ─── 6) Channel permissions ───
INSERT INTO akoenet.channel_permissions (channel_id, role_id, can_view, can_send, can_connect)
SELECT ch.id, ar.id, cp.can_view, cp.can_send, cp.can_connect
FROM legacy_akoenet.channel_permissions cp
JOIN akoenet.channels ch ON ch.legacy_id = cp.channel_id
JOIN akoenet.roles ar ON ar.legacy_id = cp.role_id
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.channel_user_permissions (channel_id, user_id, can_view, can_send, can_connect)
SELECT ch.id, akoenet._legacy_user_uuid(cup.user_id), cup.can_view, cup.can_send, cup.can_connect
FROM legacy_akoenet.channel_user_permissions cup
JOIN akoenet.channels ch ON ch.legacy_id = cup.channel_id
WHERE akoenet._legacy_user_uuid(cup.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── 7) Messages (sin reply/thread; pass 2 abajo) ───
INSERT INTO akoenet.messages (
  channel_id, user_id, content, image_url, is_pinned, pinned_at, pinned_by,
  edited_at, dmca_removed_at, created_at, legacy_id
)
SELECT
  ch.id,
  akoenet._legacy_user_uuid(m.user_id),
  coalesce(m.content, ''),
  m.image_url,
  m.is_pinned,
  m.pinned_at,
  akoenet._legacy_user_uuid(m.pinned_by),
  m.edited_at,
  m.dmca_removed_at,
  coalesce(m.created_at, now()),
  m.id
FROM legacy_akoenet.messages m
JOIN akoenet.channels ch ON ch.legacy_id = m.channel_id
WHERE akoenet._legacy_user_uuid(m.user_id) IS NOT NULL
ON CONFLICT (legacy_id) DO NOTHING;

UPDATE akoenet.messages am
SET reply_to_id = parent.id
FROM legacy_akoenet.messages lm
JOIN akoenet.messages parent ON parent.legacy_id = lm.reply_to_id
WHERE am.legacy_id = lm.id AND lm.reply_to_id IS NOT NULL;

UPDATE akoenet.messages am
SET thread_root_message_id = root.id
FROM legacy_akoenet.messages lm
JOIN akoenet.messages root ON root.legacy_id = lm.thread_root_message_id
WHERE am.legacy_id = lm.id AND lm.thread_root_message_id IS NOT NULL;

-- ─── 8) Reactions + edit history ───
INSERT INTO akoenet.message_reactions (message_id, user_id, reaction_key, created_at)
SELECT msg.id, akoenet._legacy_user_uuid(mr.user_id), mr.reaction_key, coalesce(mr.created_at, now())
FROM legacy_akoenet.message_reactions mr
JOIN akoenet.messages msg ON msg.legacy_id = mr.message_id
WHERE akoenet._legacy_user_uuid(mr.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.message_edit_history (message_id, direct_message_id, old_content, new_content, edited_by, edited_at)
SELECT
  msg.id,
  NULL,
  meh.old_content,
  meh.new_content,
  akoenet._legacy_user_uuid(meh.edited_by),
  coalesce(meh.edited_at, now())
FROM legacy_akoenet.message_edit_history meh
LEFT JOIN akoenet.messages msg ON msg.legacy_id = meh.message_id
WHERE meh.message_id IS NOT NULL
  AND akoenet._legacy_user_uuid(meh.edited_by) IS NOT NULL;

-- ─── 9) DMs ───
INSERT INTO akoenet.direct_conversations (user_low_id, user_high_id, created_at, legacy_id)
SELECT
  akoenet._legacy_user_uuid(dc.user_low_id),
  akoenet._legacy_user_uuid(dc.user_high_id),
  coalesce(dc.created_at, now()),
  dc.id
FROM legacy_akoenet.direct_conversations dc
WHERE akoenet._legacy_user_uuid(dc.user_low_id) IS NOT NULL
  AND akoenet._legacy_user_uuid(dc.user_high_id) IS NOT NULL
ON CONFLICT (legacy_id) DO NOTHING;

INSERT INTO akoenet.direct_messages (
  conversation_id, sender_id, content, image_url, edited_at, dmca_removed_at, created_at, legacy_id
)
SELECT
  conv.id,
  akoenet._legacy_user_uuid(dm.sender_id),
  dm.content,
  dm.image_url,
  dm.edited_at,
  dm.dmca_removed_at,
  coalesce(dm.created_at, now()),
  dm.id
FROM legacy_akoenet.direct_messages dm
JOIN akoenet.direct_conversations conv ON conv.legacy_id = dm.conversation_id
WHERE akoenet._legacy_user_uuid(dm.sender_id) IS NOT NULL
ON CONFLICT (legacy_id) DO NOTHING;

UPDATE akoenet.direct_messages adm
SET reply_to_id = parent.id
FROM legacy_akoenet.direct_messages ldm
JOIN akoenet.direct_messages parent ON parent.legacy_id = ldm.reply_to_id
WHERE adm.legacy_id = ldm.id AND ldm.reply_to_id IS NOT NULL;

-- ─── 10) Server extras ───
INSERT INTO akoenet.server_invites (server_id, created_by, token, max_uses, used_count, expires_at, is_active, created_at)
SELECT srv.id, akoenet._legacy_user_uuid(si.created_by), si.token, si.max_uses, si.used_count, si.expires_at, si.is_active, coalesce(si.created_at, now())
FROM legacy_akoenet.server_invites si
JOIN akoenet.servers srv ON srv.legacy_id = si.server_id
WHERE akoenet._legacy_user_uuid(si.created_by) IS NOT NULL
ON CONFLICT (token) DO NOTHING;

INSERT INTO akoenet.server_emojis (server_id, name, image_url, created_by, created_at)
SELECT srv.id, se.name, se.image_url, akoenet._legacy_user_uuid(se.created_by), coalesce(se.created_at, now())
FROM legacy_akoenet.server_emojis se
JOIN akoenet.servers srv ON srv.legacy_id = se.server_id
WHERE akoenet._legacy_user_uuid(se.created_by) IS NOT NULL
ON CONFLICT (server_id, name) DO NOTHING;

INSERT INTO akoenet.server_webhooks (server_id, url, secret, event_types, created_by, created_at)
SELECT srv.id, sw.url, sw.secret, sw.event_types, akoenet._legacy_user_uuid(sw.created_by), coalesce(sw.created_at, now())
FROM legacy_akoenet.server_webhooks sw
JOIN akoenet.servers srv ON srv.legacy_id = sw.server_id
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.server_bans (server_id, user_id, reason, banned_by, expires_at, revoked_at, revoked_by, created_at)
SELECT
  srv.id,
  akoenet._legacy_user_uuid(sb.user_id),
  sb.reason,
  akoenet._legacy_user_uuid(sb.banned_by),
  sb.expires_at,
  sb.revoked_at,
  akoenet._legacy_user_uuid(sb.revoked_by),
  coalesce(sb.created_at, now())
FROM legacy_akoenet.server_bans sb
JOIN akoenet.servers srv ON srv.legacy_id = sb.server_id
WHERE akoenet._legacy_user_uuid(sb.user_id) IS NOT NULL
  AND akoenet._legacy_user_uuid(sb.banned_by) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.server_custom_commands (server_id, command_name, response, action_type, action_value, created_by, created_at, updated_at)
SELECT srv.id, sc.command_name, sc.response, sc.action_type, sc.action_value, akoenet._legacy_user_uuid(sc.created_by), coalesce(sc.created_at, now()), coalesce(sc.updated_at, now())
FROM legacy_akoenet.server_custom_commands sc
JOIN akoenet.servers srv ON srv.legacy_id = sc.server_id
WHERE akoenet._legacy_user_uuid(sc.created_by) IS NOT NULL
ON CONFLICT (server_id, command_name) DO NOTHING;

INSERT INTO akoenet.server_calendar_events (server_id, title, description, starts_at, ends_at, created_by, created_at)
SELECT srv.id, ce.title, ce.description, ce.starts_at, ce.ends_at, akoenet._legacy_user_uuid(ce.created_by), coalesce(ce.created_at, now())
FROM legacy_akoenet.server_calendar_events ce
JOIN akoenet.servers srv ON srv.legacy_id = ce.server_id
WHERE akoenet._legacy_user_uuid(ce.created_by) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.server_announcements (server_id, title, body, created_by, created_at)
SELECT srv.id, sa.title, sa.body, akoenet._legacy_user_uuid(sa.created_by), coalesce(sa.created_at, now())
FROM legacy_akoenet.server_announcements sa
JOIN akoenet.servers srv ON srv.legacy_id = sa.server_id
WHERE akoenet._legacy_user_uuid(sa.created_by) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── 11) Social + legal ───
INSERT INTO akoenet.user_friendships (requester_id, addressee_id, status, created_at)
SELECT
  akoenet._legacy_user_uuid(uf.requester_id),
  akoenet._legacy_user_uuid(uf.addressee_id),
  uf.status,
  coalesce(uf.created_at, now())
FROM legacy_akoenet.user_friendships uf
WHERE akoenet._legacy_user_uuid(uf.requester_id) IS NOT NULL
  AND akoenet._legacy_user_uuid(uf.addressee_id) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.user_blocks (blocker_id, blocked_id, created_at)
SELECT
  akoenet._legacy_user_uuid(ub.blocker_id),
  akoenet._legacy_user_uuid(ub.blocked_id),
  coalesce(ub.created_at, now())
FROM legacy_akoenet.user_blocks ub
WHERE akoenet._legacy_user_uuid(ub.blocker_id) IS NOT NULL
  AND akoenet._legacy_user_uuid(ub.blocked_id) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.legal_terms_acceptances (user_id, terms_version, accepted_at)
SELECT akoenet._legacy_user_uuid(lta.user_id), lta.terms_version, coalesce(lta.accepted_at, now())
FROM legacy_akoenet.legal_terms_acceptances lta
WHERE akoenet._legacy_user_uuid(lta.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO akoenet.push_subscriptions (
  user_id, subscription_type, endpoint, p256dh, auth, native_platform, native_token,
  device_id, device_name, app_version, last_seen_at, created_at, updated_at
)
SELECT
  akoenet._legacy_user_uuid(ps.user_id),
  coalesce(ps.subscription_type, 'web'),
  ps.endpoint, ps.p256dh, ps.auth, ps.native_platform, ps.native_token,
  ps.device_id, ps.device_name, ps.app_version,
  coalesce(ps.last_seen_at, now()), coalesce(ps.created_at, now()), coalesce(ps.updated_at, now())
FROM legacy_akoenet.push_subscriptions ps
WHERE akoenet._legacy_user_uuid(ps.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── 12) Conteos ───
SELECT 'legacy users' AS metric, count(*)::bigint FROM legacy_akoenet.users
UNION ALL SELECT 'akoenet.user_profiles', count(*) FROM akoenet.user_profiles
UNION ALL SELECT 'akoenet.servers', count(*) FROM akoenet.servers
UNION ALL SELECT 'akoenet.channels', count(*) FROM akoenet.channels
UNION ALL SELECT 'akoenet.messages', count(*) FROM akoenet.messages
UNION ALL SELECT 'akoenet.direct_messages', count(*) FROM akoenet.direct_messages;

/**
 * Publica anuncios de directo en AkoeNet (módulo Assistant streamer).
 */
import { config } from "../config.js";
import { query } from "../lib/db.js";

function akoenetApiBase() {
  const explicit = String(config.akoenetUrl || process.env.AKOENET_API_URL || "").trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const gateway = String(process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/akoenet-api`;
  return "https://api.akoenet.dakinissystems.com";
}

function announceWebhookSecret() {
  return String(
    process.env.SCHEDULER_WEBHOOK_SECRET ||
      process.env.AKOENET_WEBHOOK_SECRET ||
      config.serviceKey ||
      ""
  ).trim();
}

/**
 * @param {object} data
 * @param {string} [locale="es"]
 */
export function buildLiveStreamMessage(data, locale = "es") {
  const platform = String(data.platform || "twitch").toUpperCase();
  const streamer = data.streamer || data.scheduler_slug || "Streamer";
  const title = data.title || (locale === "en" ? "Live now" : "En directo");
  const lines =
    locale === "en"
      ? [`🔴 **${streamer}** is live on **${platform}**`, title]
      : [`🔴 **${streamer}** está en directo en **${platform}**`, title];
  if (data.url) lines.push(`🔗 ${data.url}`);
  if (data.note) lines.push(String(data.note));
  return lines.join("\n");
}

/**
 * @param {string|number} serverId
 */
export async function getStreamerModuleConfig(serverId) {
  const { rows } = await query(
    `SELECT enabled, config FROM akoenet.server_modules
     WHERE server_id = $1::bigint AND module_key = 'streamer' LIMIT 1`,
    [serverId]
  );
  const row = rows[0];
  if (!row?.enabled) return null;
  const cfg = row.config && typeof row.config === "object" ? row.config : {};
  return {
    autoAnnounce: cfg.autoAnnounce !== false,
    announceChannel: cfg.announceChannel ?? cfg.announce_channel ?? null,
    pingRole: cfg.pingRole ?? cfg.ping_role ?? null,
  };
}

/**
 * @param {string|number} serverId
 * @param {object} data — payload stream.started
 */
export async function publishStreamStartedAnnouncement(serverId, data = {}) {
  const modConfig = await getStreamerModuleConfig(serverId);
  if (!modConfig) {
    return { skipped: true, reason: "streamer_module_disabled" };
  }
  if (!modConfig.autoAnnounce) {
    return { skipped: true, reason: "auto_announce_off" };
  }

  const secret = announceWebhookSecret();
  if (!secret) {
    return { skipped: true, reason: "no_webhook_secret" };
  }

  const channelId =
    data.channel_id ||
    data.channelId ||
    modConfig.announceChannel ||
    null;

  const body = {
    server_id: Number(serverId),
    streamer: data.streamer || data.scheduler_slug || "streamer",
    scheduler_slug: data.scheduler_slug || data.streamer,
    title: data.title || "En directo",
    platform: data.platform || "twitch",
    url: data.url || undefined,
    note: data.note || undefined,
    channel_id: channelId != null && channelId !== "" ? Number(channelId) : undefined,
    ping_role: modConfig.pingRole || undefined,
  };

  try {
    const res = await fetch(`${akoenetApiBase()}/integrations/assistant/stream-started`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scheduler-webhook-secret": secret,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json.error || json.message || "akoenet_post_failed",
      };
    }
    return { ok: true, messageId: json.message_id, channelId: json.channel_id, content: json.content };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network_error" };
  }
}

/**
 * @param {string|number} serverId
 * @param {object} data
 */
export async function publishStreamEndedAnnouncement(serverId, data = {}) {
  const modConfig = await getStreamerModuleConfig(serverId);
  if (!modConfig?.autoAnnounce) return { skipped: true, reason: "streamer_off" };

  const secret = announceWebhookSecret();
  if (!secret) return { skipped: true, reason: "no_webhook_secret" };

  const streamer = data.streamer || data.scheduler_slug || "Streamer";
  const title = data.title || "Directo finalizado";
  const body = {
    server_id: Number(serverId),
    streamer,
    title,
    platform: data.platform || "twitch",
    channel_id:
      data.channel_id || data.channelId || modConfig.announceChannel
        ? Number(data.channel_id || data.channelId || modConfig.announceChannel)
        : undefined,
    content: `⏹ **${streamer}** ha terminado el directo.\n${title}`,
  };

  try {
    const res = await fetch(`${akoenetApiBase()}/integrations/assistant/stream-ended`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scheduler-webhook-secret": secret,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: json.error };
    return { ok: true, messageId: json.message_id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network_error" };
  }
}

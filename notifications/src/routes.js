import { config, CHANNELS } from "./config.js";
import { enqueueNotification } from "./queue.js";
import { checkDbHealth } from "./lib/db.js";
import { listInbox, markNotificationRead } from "./lib/inbox-store.js";
import { resendConfigured } from "./lib/resend.js";

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function parseInboxUserId(req) {
  const path = (req.url || "").split("?")[0];
  const id = path.replace(/^\/v1\/inbox\//, "").split("/")[0];
  return decodeURIComponent(id || "");
}

function parseInboxNotificationId(req) {
  const path = (req.url || "").split("?")[0];
  const parts = path.split("/").filter(Boolean);
  // /v1/inbox/:id/read
  if (parts.length >= 4 && parts[0] === "v1" && parts[1] === "inbox" && parts[3] === "read") {
    return decodeURIComponent(parts[2] || "");
  }
  return "";
}

export const routes = {
  "GET /health": async () => {
    const db = await checkDbHealth();
    return {
      status: 200,
      body: {
        ok: true,
        service: config.service,
        version: "0.3.1-inbox",
        redis: config.redisUrl ? "configured" : "not_configured",
        postgres: db,
        resend: resendConfigured() ? "configured" : "not_configured",
        channels: CHANNELS,
      },
    };
  },

  "POST /v1/send": async (req) => {
    const body = await readJson(req);
    if (body === null) {
      return { status: 400, body: { error: "invalid_json" } };
    }
    const { userId, channel = "in-app", type, payload = {}, tenantId } = body;
    if (!userId || !type) {
      return { status: 400, body: { error: "validation", message: "userId and type required" } };
    }
    if (!CHANNELS.includes(channel)) {
      return { status: 400, body: { error: "validation", message: `channel must be one of: ${CHANNELS.join(", ")}` } };
    }
    const result = await enqueueNotification({ userId, channel, type, payload, tenantId });
    return {
      status: result.queued ? 202 : 503,
      body: {
        ok: result.queued,
        jobId: result.id,
        queue: config.queueName,
        queued: result.queued,
        message: result.queued ? "Notification enqueued" : "REDIS_URL not configured",
      },
    };
  },

  "GET /v1/preferences/:userId": () => ({
    status: 200,
    body: {
      channels: CHANNELS.reduce((acc, ch) => {
        acc[ch] = { enabled: ch !== "sms", updatedAt: null };
        return acc;
      }, {}),
      stub: true,
    },
  }),

  "GET /v1/inbox/:userId": async (req) => {
    const userId = parseInboxUserId(req);
    const url = new URL(req.url || "/", "http://internal");
    const limit = Number(url.searchParams.get("limit") || 50);
    const inbox = await listInbox(userId, limit);
    if (inbox.error) {
      return { status: 400, body: { error: "validation", message: inbox.error } };
    }
    return { status: 200, body: inbox };
  },

  "PATCH /v1/inbox/:id/read": async (req) => {
    const notificationId = parseInboxNotificationId(req);
    const body = await readJson(req);
    const userId = String(body?.userId || "").trim();
    if (!notificationId || !userId) {
      return { status: 400, body: { error: "validation", message: "notification id and userId required" } };
    }
    const result = await markNotificationRead(notificationId, userId);
    if (!result.ok) {
      return { status: 503, body: { error: result.reason || "mark_read_failed" } };
    }
    return { status: 200, body: { ok: true, ...result } };
  },
};

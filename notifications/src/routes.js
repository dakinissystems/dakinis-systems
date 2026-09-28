import { config, CHANNELS } from "./config.js";
import { enqueueNotification } from "./queue.js";
import { checkDbHealth } from "./lib/db.js";
import { listInbox, markNotificationRead } from "./lib/inbox-store.js";
import { resendConfigured } from "./lib/resend.js";
import { eventStreamStats, publishUserEvent } from "./lib/event-stream.js";

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
  if (parts.length >= 4 && parts[0] === "v1" && parts[1] === "inbox" && parts[3] === "read") {
    return decodeURIComponent(parts[2] || "");
  }
  return "";
}

function createLiveEvent({ userId, type, payload = {}, tenantId, product = "hub", severity = "info" }) {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    userId,
    tenantId: tenantId || null,
    product,
    severity,
    title: payload.title || payload.message || type,
    message: payload.message || payload.detail || "",
    href: payload.href,
    createdAt: new Date().toISOString(),
    payload,
  };
}

export const routes = {
  "GET /health": async () => {
    const db = await checkDbHealth();
    const streams = eventStreamStats();
    return {
      status: 200,
      body: {
        ok: true,
        service: config.service,
        version: "0.4.0-events-sse",
        redis: config.redisUrl ? "configured" : "not_configured",
        postgres: db,
        resend: resendConfigured() ? "configured" : "not_configured",
        channels: CHANNELS,
        eventStreams: streams,
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

    let streamed = 0;
    if (channel === "in-app") {
      const event = createLiveEvent({ userId, type, payload, tenantId, product: payload.product || "hub" });
      streamed = publishUserEvent(userId, event);
    }

    return {
      status: result.queued ? 202 : streamed > 0 ? 202 : 503,
      body: {
        ok: result.queued || streamed > 0,
        jobId: result.id,
        queue: config.queueName,
        queued: result.queued,
        streamed,
        message: result.queued
          ? "Notification enqueued"
          : streamed > 0
            ? "SSE delivered (queue unavailable)"
            : "REDIS_URL not configured",
      },
    };
  },

  "POST /v1/events": async (req) => {
    const body = await readJson(req);
    if (body === null) {
      return { status: 400, body: { error: "invalid_json" } };
    }
    const { userId, type, payload = {}, tenantId, product, severity } = body;
    if (!userId || !type) {
      return { status: 400, body: { error: "validation", message: "userId and type required" } };
    }
    const event = createLiveEvent({ userId, type, payload, tenantId, product, severity });
    const streamed = publishUserEvent(userId, event);
    return {
      status: 202,
      body: { ok: true, event, streamed },
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

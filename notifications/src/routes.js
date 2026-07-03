import { config, CHANNELS } from "./config.js";
import { enqueueNotification } from "./queue.js";

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

export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.2.0-scaffold",
      redis: config.redisUrl ? "configured" : "not_configured",
      channels: CHANNELS,
    },
  }),

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

  "GET /v1/inbox/:userId": () => ({
    status: 200,
    body: { items: [], unread: 0, stub: true, message: "In-app inbox — persist in Supabase hub.notifications" },
  }),
};

import { config } from "./config.js";
import { requireServiceAuth, readJson } from "./lib/auth.js";
import { publishEvent, listQueuedEvents } from "./lib/events.js";
import { proxyJson } from "./lib/proxy.js";
import { HUB_APPS, HUB_SECTIONS } from "./hub-data.js";

function platformEvent(type, payload, meta = {}) {
  return {
    event: type,
    payload,
    userId: meta.userId,
    tenantId: meta.tenantId,
    source: meta.source || "internal-api",
    at: new Date().toISOString(),
  };
}

export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.2.0-scaffold",
      redis: config.redisUrl ? "configured" : "not_configured",
      auth: config.serviceKey ? "required" : "dev_open",
    },
  }),

  "GET /users/:id": (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/users/", "");
    return {
      status: 200,
      body: { id, email: null, displayName: null, stub: true },
    };
  },

  "GET /profile/:userId": (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const userId = (req.url || "").split("?")[0].replace("/profile/", "");
    return {
      status: 200,
      body: { userId, locale: "es", theme: "dark", products: ["core"], stub: true },
    };
  },

  "GET /hub/dashboard/:userId": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const userId = (req.url || "").split("?")[0].replace("/hub/dashboard/", "");
    let unread = 0;
    const inbox = await proxyJson(config.notificationsUrl, `/v1/inbox/${encodeURIComponent(userId)}`);
    if (inbox.status === 200 && inbox.body?.unread != null) {
      unread = inbox.body.unread;
    }
    return {
      status: 200,
      body: {
        userId,
        sections: HUB_SECTIONS,
        apps: HUB_APPS,
        summary: {
          notificationsUnread: unread,
          aiSummary: null,
          stub: true,
        },
      },
    };
  },

  "POST /events": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    if (!body.event) return { status: 400, body: { error: "validation", message: "event required" } };
    const event = platformEvent(body.event, body.payload || {}, body);
    const pub = await publishEvent(event);
    return { status: 202, body: { ok: true, event, ...pub } };
  },

  "GET /events": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const items = await listQueuedEvents(25);
    return { status: 200, body: { items, count: items.length } };
  },

  "POST /notifications/send": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const payload = {
      userId: body.userId,
      type: body.type || "platform.notification",
      channel: body.channel || "in-app",
      payload: body.payload || {},
      tenantId: body.tenantId,
    };
    const proxied = await proxyJson(config.notificationsUrl, "/v1/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { status: proxied.status, body: { proxied: true, ...proxied.body } };
  },

  "POST /search": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const q = encodeURIComponent(body.query || body.q || "");
    const scope = encodeURIComponent((body.scopes && body.scopes[0]) || body.scope || "all");
    const proxied = await proxyJson(config.searchUrl, `/v1/query?q=${q}&scope=${scope}`);
    return { status: proxied.status, body: { proxied: true, ...proxied.body } };
  },

  "GET /billing/plans": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const proxied = await proxyJson(config.billingUrl, "/v1/plans");
    return { status: proxied.status, body: proxied.body };
  },

  "GET /billing/subscriptions/:tenantId": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const tenantId = (req.url || "").split("?")[0].replace("/billing/subscriptions/", "");
    const proxied = await proxyJson(
      config.billingUrl,
      `/v1/subscriptions/${encodeURIComponent(tenantId)}`,
      {
        headers: config.serviceKey ? { Authorization: `Bearer ${config.serviceKey}` } : {},
      }
    );
    return { status: proxied.status, body: proxied.body };
  },

  "POST /billing/checkout": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const proxied = await proxyJson(config.billingUrl, "/v1/checkout", {
      method: "POST",
      body: JSON.stringify(body),
      headers: config.serviceKey
        ? { Authorization: `Bearer ${config.serviceKey}`, "X-Internal-Api-Key": config.serviceKey }
        : {},
    });
    return { status: proxied.status, body: proxied.body };
  },

  "POST /billing/portal": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const proxied = await proxyJson(config.billingUrl, "/v1/portal", {
      method: "POST",
      body: JSON.stringify(body),
      headers: config.serviceKey
        ? { Authorization: `Bearer ${config.serviceKey}`, "X-Internal-Api-Key": config.serviceKey }
        : {},
    });
    return { status: proxied.status, body: proxied.body };
  },

  "POST /knowledge/query": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const proxied = await proxyJson(config.knowledgeUrl, "/v1/query", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return { status: proxied.status, body: { proxied: true, ...proxied.body } };
  },

  "POST /storage/upload-url": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    if (!body.filename || !body.contentType) {
      return { status: 400, body: { error: "validation", message: "filename and contentType required" } };
    }
    return {
      status: 501,
      body: {
        error: "not_implemented",
        message: "Supabase Storage / Cloudflare R2 — roadmap",
        purpose: body.purpose || "asset",
        filename: body.filename,
      },
    };
  },

  "GET /storage/:objectId": () => ({
    status: 501,
    body: { error: "not_implemented", message: "Signed URL read — Supabase Storage / R2 roadmap" },
  }),
};

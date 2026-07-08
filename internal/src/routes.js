import { config } from "./config.js";
import { requireServiceAuth, readJson } from "./lib/auth.js";
import { publishEvent, listQueuedEvents } from "./lib/events.js";
import { proxyJson } from "./lib/proxy.js";
import { checkDbHealth } from "./lib/db.js";
import { getHubDashboard, validateUserId } from "./services/hub-dashboard.js";
import {
  getTenantHubProducts,
  upsertTenantHubProducts,
} from "./services/hub-product-access.js";
import {
  getBusHealthSummary,
  getBusStatus,
  listDeadLetterJobs,
  replayDeadLetterJob,
  discardDeadLetterJob,
} from "./lib/bullmq-monitor.js";
import {
  getWorkspace,
  getWorkspaceForUser,
  updateWorkspace,
  removeWorkspaceMember,
  touchWorkspaceAccess,
  listWorkspaceMembers,
  listWorkspaceProducts,
  inviteWorkspaceMember,
  updateMemberRole,
  getWorkspaceUsage,
  setWorkspaceProducts,
} from "./services/workspace-admin.js";
import {
  listWorkspaces,
  getWorkspaceDetail,
  setWorkspaceStatus,
  getRevenueDashboard,
  listAuditLogs,
  listFeatureFlags,
  setFeatureFlag,
  getPlatformOverview,
} from "./services/super-admin.js";
import {
  listAssistantModules,
  getServerModules,
  upsertServerModule,
  routeAssistantCommand,
  dispatchAssistantEvent,
} from "./services/akoenet-assistant.js";

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
  "GET /health": async () => {
    const db = await checkDbHealth();
    const eventBus = await getBusHealthSummary();
    return {
      status: 200,
      body: {
        ok: true,
        service: config.service,
        version: "0.3.1",
        redis: config.redisUrl ? "configured" : "not_configured",
        database: db.ok ? "configured" : config.databaseUrl ? "error" : "not_configured",
        auth: config.serviceKey ? "required" : "dev_open",
        eventBus,
      },
    };
  },

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
    if (!validateUserId(userId)) {
      return { status: 400, body: { error: "validation", message: "userId must be a UUID" } };
    }
    let notificationsUnread;
    let notificationsItems;
    const inbox = await proxyJson(config.notificationsUrl, `/v1/inbox/${encodeURIComponent(userId)}`);
    if (inbox.status === 200 && inbox.body) {
      if (inbox.body.unread != null) notificationsUnread = inbox.body.unread;
      if (Array.isArray(inbox.body.items)) notificationsItems = inbox.body.items;
    }
    return getHubDashboard(userId, { notificationsUnread, notificationsItems });
  },

  "GET /hub/tenant-access/:slug": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const slug = decodeURIComponent((req.url || "").split("?")[0].replace("/hub/tenant-access/", ""));
    try {
      const data = await getTenantHubProducts(slug);
      return { status: 200, body: data };
    } catch (err) {
      return {
        status: 500,
        body: { error: "db_error", message: err instanceof Error ? err.message : "db_error" },
      };
    }
  },

  "PUT /hub/tenant-access/:slug": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const slug = decodeURIComponent((req.url || "").split("?")[0].replace("/hub/tenant-access/", ""));
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const data = await upsertTenantHubProducts(slug, body.products);
      return { status: 200, body: data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "db_error";
      const status = message === "tenant_slug_required" ? 400 : 500;
      return { status, body: { error: message } };
    }
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

  "GET /events/bus/status": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await getBusStatus();
    return { status: 200, body };
  },

  "GET /events/dlq": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const url = new URL(req.url || "/", "http://internal.local");
    const body = await listDeadLetterJobs(url.searchParams);
    return { status: 200, body };
  },

  "POST /events/dlq/replay": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const jobId = body.jobId || body.id;
    if (!jobId) return { status: 400, body: { error: "validation", message: "jobId required" } };
    const result = await replayDeadLetterJob(String(jobId));
    const status = result.ok ? 200 : result.reason === "not_found" ? 404 : 400;
    return { status, body: result };
  },

  "POST /events/dlq/discard": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const jobId = body.jobId || body.id;
    if (!jobId) return { status: 400, body: { error: "validation", message: "jobId required" } };
    const result = await discardDeadLetterJob(String(jobId));
    const status = result.ok ? 200 : result.reason === "not_found" ? 404 : 400;
    return { status, body: result };
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

  "GET /notifications/inbox/:userId": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const userId = (req.url || "").split("?")[0].replace("/notifications/inbox/", "");
    const proxied = await proxyJson(
      config.notificationsUrl,
      `/v1/inbox/${encodeURIComponent(userId)}`
    );
    return { status: proxied.status, body: proxied.body };
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

  // --- Hub Workspace Admin (migr. 031) ---
  "GET /workspaces/me/:userId": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const userId = (req.url || "").split("?")[0].replace("/workspaces/me/", "");
    try {
      const workspace = await getWorkspaceForUser(userId);
      if (!workspace) return { status: 404, body: { error: "no_workspace" } };
      if (workspace.id) await touchWorkspaceAccess(workspace.id, userId);
      return { status: 200, body: workspace };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /workspaces/:id": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "");
    try {
      const workspace = await getWorkspace(id);
      if (!workspace) return { status: 404, body: { error: "not_found" } };
      return { status: 200, body: workspace };
    } catch (err) {
      return dbError(err);
    }
  },

  "PATCH /workspaces/:id": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "");
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const workspace = await updateWorkspace(id, body, body.actorId);
      return { status: 200, body: workspace };
    } catch (err) {
      const message = err instanceof Error ? err.message : "db_error";
      const status = message === "workspace_not_found" ? 404 : message === "nothing_to_update" ? 400 : 500;
      return { status, body: { error: message } };
    }
  },

  "DELETE /workspaces/:id/members/:userId": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const path = (req.url || "").split("?")[0];
    const match = path.match(/^\/workspaces\/([^/]+)\/members\/([^/]+)$/);
    if (!match) return { status: 400, body: { error: "invalid_path" } };
    const body = await readJson(req);
    try {
      const result = await removeWorkspaceMember(match[1], match[2], body?.actorId);
      return { status: 200, body: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "db_error";
      return { status: message === "member_not_found" ? 404 : 500, body: { error: message } };
    }
  },

  "GET /workspaces/:id/members": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "").replace("/members", "");
    try {
      const members = await listWorkspaceMembers(id);
      return { status: 200, body: { items: members, count: members.length } };
    } catch (err) {
      return dbError(err);
    }
  },

  "POST /workspaces/:id/members/invite": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "").replace("/members/invite", "");
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const result = await inviteWorkspaceMember(id, body);
      return { status: result.created ? 201 : 200, body: result };
    } catch (err) {
      return dbError(err);
    }
  },

  "PATCH /workspaces/:id/members/:userId/role": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const path = (req.url || "").split("?")[0];
    const match = path.match(/^\/workspaces\/([^/]+)\/members\/([^/]+)\/role$/);
    if (!match) return { status: 400, body: { error: "invalid_path" } };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const member = await updateMemberRole(match[1], match[2], body.role, body.actorId);
      return { status: 200, body: member };
    } catch (err) {
      const message = err instanceof Error ? err.message : "db_error";
      const status = message === "member_not_found" ? 404 : message === "invalid_role" ? 400 : 500;
      return { status, body: { error: message } };
    }
  },

  "GET /workspaces/:id/usage": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "").replace("/usage", "");
    try {
      const usage = await getWorkspaceUsage(id);
      return { status: 200, body: usage };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /workspaces/:id/products": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "").replace("/products", "");
    try {
      const products = await listWorkspaceProducts(id);
      return { status: 200, body: { items: products } };
    } catch (err) {
      return dbError(err);
    }
  },

  "PUT /workspaces/:id/products": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/workspaces/", "").replace("/products", "");
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    if (!Array.isArray(body.products)) {
      return { status: 400, body: { error: "validation", message: "products array required" } };
    }
    try {
      const products = await setWorkspaceProducts(id, body.products);
      return { status: 200, body: { items: products } };
    } catch (err) {
      return dbError(err);
    }
  },

  // --- Super Admin (migr. 031) — UI futura: admin.dakinissystems.com ---
  "GET /admin/v1/overview": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    try {
      const overview = await getPlatformOverview();
      const eventBus = await getBusHealthSummary();
      return { status: 200, body: { ...overview, eventBus } };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /admin/v1/workspaces": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const url = new URL(req.url || "/", "http://internal.local");
    try {
      const data = await listWorkspaces({
        status: url.searchParams.get("status") || undefined,
        plan: url.searchParams.get("plan") || undefined,
        limit: url.searchParams.get("limit") || undefined,
        offset: url.searchParams.get("offset") || undefined,
      });
      return { status: 200, body: data };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /admin/v1/workspaces/:id": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/admin/v1/workspaces/", "");
    try {
      const workspace = await getWorkspaceDetail(id);
      if (!workspace) return { status: 404, body: { error: "not_found" } };
      return { status: 200, body: workspace };
    } catch (err) {
      return dbError(err);
    }
  },

  "POST /admin/v1/workspaces/:id/suspend": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/admin/v1/workspaces/", "").replace("/suspend", "");
    const body = await readJson(req);
    try {
      const workspace = await setWorkspaceStatus(id, "suspended", body?.reason, body?.actorId);
      return { status: 200, body: workspace };
    } catch (err) {
      return dbError(err);
    }
  },

  "POST /admin/v1/workspaces/:id/activate": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const id = (req.url || "").split("?")[0].replace("/admin/v1/workspaces/", "").replace("/activate", "");
    const body = await readJson(req);
    try {
      const workspace = await setWorkspaceStatus(id, "active", null, body?.actorId);
      return { status: 200, body: workspace };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /admin/v1/billing/dashboard": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    try {
      const dashboard = await getRevenueDashboard();
      return { status: 200, body: dashboard };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /admin/v1/audit": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const url = new URL(req.url || "/", "http://internal.local");
    try {
      const items = await listAuditLogs({ limit: url.searchParams.get("limit") || undefined });
      return { status: 200, body: { items, count: items.length } };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /admin/v1/features": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    try {
      const items = await listFeatureFlags();
      return { status: 200, body: { items, count: items.length } };
    } catch (err) {
      return dbError(err);
    }
  },

  "PATCH /admin/v1/features/:key": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const key = decodeURIComponent((req.url || "").split("?")[0].replace("/admin/v1/features/", ""));
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const flag = await setFeatureFlag(key, Boolean(body.enabled), body.actorId);
      return { status: 200, body: flag };
    } catch (err) {
      const message = err instanceof Error ? err.message : "db_error";
      return { status: message === "flag_not_found" ? 404 : 500, body: { error: message } };
    }
  },

  // --- AkoeNet Assistant (migr. 032/033) ---
  "GET /akoenet/assistant/modules": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    try {
      const items = await listAssistantModules();
      return { status: 200, body: { items, count: items.length } };
    } catch (err) {
      return dbError(err);
    }
  },

  "GET /akoenet/servers/:serverId/modules": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const serverId = (req.url || "").split("?")[0].replace("/akoenet/servers/", "").replace("/modules", "");
    try {
      const items = await getServerModules(serverId);
      return { status: 200, body: { items, count: items.length, serverId } };
    } catch (err) {
      return dbError(err);
    }
  },

  "PUT /akoenet/servers/:serverId/modules/:moduleKey": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const path = (req.url || "").split("?")[0];
    const match = path.match(/^\/akoenet\/servers\/([^/]+)\/modules\/([^/]+)$/);
    if (!match) return { status: 400, body: { error: "invalid_path" } };
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    try {
      const row = await upsertServerModule(match[1], decodeURIComponent(match[2]), body);
      return { status: 200, body: row };
    } catch (err) {
      return dbError(err);
    }
  },

  "POST /akoenet/servers/:serverId/assistant/command": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const serverId = (req.url || "").split("?")[0].replace("/akoenet/servers/", "").replace("/assistant/command", "");
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    if (!body.action) return { status: 400, body: { error: "validation", message: "action required" } };
    try {
      const result = await routeAssistantCommand({
        serverId,
        action: body.action,
        userId: body.userId,
        channelId: body.channelId,
        payload: body.payload,
        type: body.type,
      });
      return { status: result.ok ? 200 : 400, body: result };
    } catch (err) {
      return dbError(err);
    }
  },

  "POST /akoenet/servers/:serverId/assistant/events": async (req) => {
    const auth = requireServiceAuth(req);
    if (!auth.ok) return { status: auth.status, body: auth.body };
    const serverId = (req.url || "").split("?")[0].replace("/akoenet/servers/", "").replace("/assistant/events", "");
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    if (!body.type) return { status: 400, body: { error: "validation", message: "type required" } };
    try {
      const result = await dispatchAssistantEvent({
        serverId,
        type: body.type,
        source: body.source,
        data: body.payload ?? body.data,
        metadata: body.metadata,
      });
      return { status: 200, body: result };
    } catch (err) {
      return dbError(err);
    }
  },
};

function dbError(err) {
  const message = err instanceof Error ? err.message : "db_error";
  const status = message === "database_not_configured" ? 503 : 500;
  return { status, body: { error: message } };
}

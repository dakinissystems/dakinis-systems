import http from "node:http";
import { config } from "./config.js";
import { routes } from "./routes.js";
import { getRootPage } from "./root.js";
import { sendHtml } from "./status-page.js";

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Dakinis-Service": config.service,
  });
  res.end(payload);
}

function matchRoute(method, path) {
  const bare = path.split("?")[0];
  const key = `${method} ${bare}`;
  if (routes[key]) return routes[key];
  if (method === "GET" && bare.startsWith("/users/")) return routes["GET /users/:id"];
  if (method === "GET" && bare.startsWith("/profile/")) return routes["GET /profile/:userId"];
  if (method === "GET" && bare.startsWith("/hub/dashboard/")) return routes["GET /hub/dashboard/:userId"];
  if (method === "GET" && bare.startsWith("/hub/tenant-access/")) {
    return routes["GET /hub/tenant-access/:slug"];
  }
  if (method === "PUT" && bare.startsWith("/hub/tenant-access/")) {
    return routes["PUT /hub/tenant-access/:slug"];
  }
  if (method === "GET" && bare.startsWith("/billing/subscriptions/")) {
    return routes["GET /billing/subscriptions/:tenantId"];
  }
  if (method === "GET" && bare.startsWith("/notifications/inbox/")) {
    return routes["GET /notifications/inbox/:userId"];
  }
  if (method === "GET" && bare.startsWith("/storage/")) return routes["GET /storage/:objectId"];

  if (method === "GET" && /^\/workspaces\/me\/[^/]+\/desktop\/profiles$/.test(bare)) {
    return routes["GET /workspaces/me/:userId/desktop/profiles"];
  }
  if (method === "GET" && /^\/workspaces\/me\/[^/]+\/desktop\/layout\/[^/]+$/.test(bare)) {
    return routes["GET /workspaces/me/:userId/desktop/layout/:addonId"];
  }
  if (method === "PUT" && /^\/workspaces\/me\/[^/]+\/desktop\/layout\/[^/]+$/.test(bare)) {
    return routes["PUT /workspaces/me/:userId/desktop/layout/:addonId"];
  }
  if (method === "GET" && /^\/workspaces\/me\/[^/]+\/data\/[^/]+$/.test(bare)) {
    return routes["GET /workspaces/me/:userId/data/:addonKey"];
  }
  if (method === "PUT" && /^\/workspaces\/me\/[^/]+\/data\/[^/]+$/.test(bare)) {
    return routes["PUT /workspaces/me/:userId/data/:addonKey"];
  }
  if (method === "GET" && bare.startsWith("/workspaces/me/")) {
    return routes["GET /workspaces/me/:userId"];
  }
  if (method === "PATCH" && /^\/workspaces\/[^/]+$/.test(bare) && !bare.includes("/members")) {
    return routes["PATCH /workspaces/:id"];
  }
  if (method === "DELETE" && /^\/workspaces\/[^/]+\/members\/[^/]+$/.test(bare)) {
    return routes["DELETE /workspaces/:id/members/:userId"];
  }
  // Workspace admin (031)
  if (method === "GET" && /^\/workspaces\/[^/]+\/members$/.test(bare)) {
    return routes["GET /workspaces/:id/members"];
  }
  if (method === "POST" && /^\/workspaces\/[^/]+\/members\/invite$/.test(bare)) {
    return routes["POST /workspaces/:id/members/invite"];
  }
  if (method === "PATCH" && /^\/workspaces\/[^/]+\/members\/[^/]+\/role$/.test(bare)) {
    return routes["PATCH /workspaces/:id/members/:userId/role"];
  }
  if (method === "GET" && /^\/workspaces\/[^/]+\/usage$/.test(bare)) {
    return routes["GET /workspaces/:id/usage"];
  }
  if (method === "GET" && /^\/workspaces\/[^/]+\/products$/.test(bare)) {
    return routes["GET /workspaces/:id/products"];
  }
  if (method === "PUT" && /^\/workspaces\/[^/]+\/products$/.test(bare)) {
    return routes["PUT /workspaces/:id/products"];
  }
  if (method === "GET" && bare === "/workspace-addons/catalog") {
    return routes["GET /workspace-addons/catalog"];
  }
  if (method === "GET" && /^\/workspaces\/[^/]+\/addons$/.test(bare)) {
    return routes["GET /workspaces/:id/addons"];
  }
  if (method === "PUT" && /^\/workspaces\/[^/]+\/addons\/[^/]+$/.test(bare)) {
    return routes["PUT /workspaces/:id/addons/:key"];
  }
  if (method === "POST" && /^\/workspaces\/[^/]+\/addons\/enable-all$/.test(bare)) {
    return routes["POST /workspaces/:id/addons/enable-all"];
  }
  if (method === "GET" && /^\/workspaces\/[^/]+$/.test(bare)) {
    return routes["GET /workspaces/:id"];
  }

  // Super admin (031)
  if (method === "GET" && bare === "/admin/v1/overview") return routes["GET /admin/v1/overview"];
  if (method === "GET" && bare === "/admin/v1/workspaces") return routes["GET /admin/v1/workspaces"];
  if (method === "GET" && bare === "/admin/v1/billing/dashboard") {
    return routes["GET /admin/v1/billing/dashboard"];
  }
  if (method === "GET" && bare.startsWith("/admin/v1/audit")) return routes["GET /admin/v1/audit"];
  if (method === "GET" && bare === "/admin/v1/features") return routes["GET /admin/v1/features"];
  if (method === "PATCH" && bare.startsWith("/admin/v1/features/")) {
    return routes["PATCH /admin/v1/features/:key"];
  }
  if (method === "GET" && /^\/admin\/v1\/workspaces\/[^/]+$/.test(bare)) {
    return routes["GET /admin/v1/workspaces/:id"];
  }
  if (method === "POST" && /^\/admin\/v1\/workspaces\/[^/]+\/suspend$/.test(bare)) {
    return routes["POST /admin/v1/workspaces/:id/suspend"];
  }
  if (method === "POST" && /^\/admin\/v1\/workspaces\/[^/]+\/activate$/.test(bare)) {
    return routes["POST /admin/v1/workspaces/:id/activate"];
  }

  // AkoeNet Assistant (032/033)
  if (method === "GET" && bare === "/akoenet/assistant/modules") {
    return routes["GET /akoenet/assistant/modules"];
  }
  if (method === "GET" && /^\/akoenet\/servers\/[^/]+\/modules$/.test(bare)) {
    return routes["GET /akoenet/servers/:serverId/modules"];
  }
  if (method === "PUT" && /^\/akoenet\/servers\/[^/]+\/modules\/[^/]+$/.test(bare)) {
    return routes["PUT /akoenet/servers/:serverId/modules/:moduleKey"];
  }
  if (method === "POST" && /^\/akoenet\/servers\/[^/]+\/assistant\/command$/.test(bare)) {
    return routes["POST /akoenet/servers/:serverId/assistant/command"];
  }
  if (method === "POST" && /^\/akoenet\/servers\/[^/]+\/assistant\/events$/.test(bare)) {
    return routes["POST /akoenet/servers/:serverId/assistant/events"];
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  const raw = req.url || "/";
  const path = raw.split("?")[0];

  if ((req.method || "GET") === "GET" && path === "/") {
    return sendHtml(res, 200, getRootPage(), config.service);
  }

  const handler = matchRoute(req.method || "GET", raw);
  if (!handler) {
    return sendJson(res, 404, { error: "not_found", path });
  }
  try {
    const result = await handler(req);
    sendJson(res, result.status, result.body);
  } catch (err) {
    console.error("[internal]", err);
    sendJson(res, 500, { error: "internal_error", message: err.message });
  }
});

server.listen(config.port, () => {
  console.log(`[${config.service}] listening on :${config.port}`);
});

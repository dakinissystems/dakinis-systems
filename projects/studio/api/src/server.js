import http from "node:http";
import { config } from "./config.js";
import { routes } from "./routes.js";
import { sendJson } from "./lib/http.js";

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @param {string} method
 * @param {string} path
 * @returns {{ handler: Function, params: Record<string,string> } | null}
 */
function matchRoute(method, path) {
  const bare = path.split("?")[0];
  const key = `${method} ${bare}`;
  if (routes[key]) return { handler: routes[key], params: {} };

  const patterns = [
    [/^\/v1\/sessions\/([^/]+)\/state$/, "GET /v1/sessions/:id/state", "id", "GET"],
    [/^\/v1\/sessions\/([^/]+)\/state$/, "PUT /v1/sessions/:id/state", "id", "PUT"],
    [/^\/v1\/sessions\/([^/]+)\/switch$/, "POST /v1/sessions/:id/switch", "id", "POST"],
    [/^\/v1\/sessions\/([^/]+)\/files\/tree$/, "GET /v1/sessions/:id/files/tree", "id", "GET"],
    [/^\/v1\/sessions\/([^/]+)\/files\/read$/, "GET /v1/sessions/:id/files/read", "id", "GET"],
    [/^\/v1\/sessions\/([^/]+)\/files\/ops$/, "POST /v1/sessions/:id/files/ops", "id", "POST"],
    [/^\/v1\/sessions\/([^/]+)$/, "GET /v1/sessions/:id", "id", "GET"],
    [/^\/v1\/sessions\/([^/]+)$/, "DELETE /v1/sessions/:id", "id", "DELETE"],
  ];

  for (const [re, routeKey, param, verb] of patterns) {
    if (verb !== method) continue;
    const m = bare.match(re);
    if (!m || !routes[routeKey]) continue;
    const id = m[1];
    if (param === "id" && !SESSION_ID.test(id)) continue;
    return { handler: routes[routeKey], params: { [param]: id } };
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  const path = req.url || "/";
  const matched = matchRoute(req.method || "GET", path);

  if (!matched) {
    sendJson(res, { error: "not_found", path }, 404);
    return;
  }

  try {
    await matched.handler(req, res, matched.params);
  } catch (err) {
    console.error("[studio-api]", err);
    sendJson(res, { error: "internal_error", message: err?.message || "error" }, 500);
  }
});

server.listen(config.port, () => {
  console.info(`[studio-api] listening on :${config.port} (language-agnostic)`);
});

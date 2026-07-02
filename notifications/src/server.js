import http from "node:http";
import { config } from "./config.js";
import { routes } from "./routes.js";

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
  const key = `${method} ${path}`;
  if (routes[key]) return routes[key];
  if (path.startsWith("/v1/preferences/")) return routes["GET /v1/preferences/:userId"];
  if (path.startsWith("/v1/inbox/")) return routes["GET /v1/inbox/:userId"];
  return null;
}

const server = http.createServer(async (req, res) => {
  const path = (req.url || "/").split("?")[0];
  const handler = matchRoute(req.method || "GET", path);
  if (!handler) {
    return sendJson(res, 404, { error: "not_found", path });
  }
  try {
    const result = await handler(req);
    sendJson(res, result.status, result.body);
  } catch (err) {
    console.error("[notifications]", err);
    sendJson(res, 500, { error: "internal_error", message: err.message });
  }
});

server.listen(config.port, () => {
  console.log(`[${config.service}] API on :${config.port}`);
});

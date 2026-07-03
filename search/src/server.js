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
  if (method === "GET" && path.startsWith("/v1/query")) return routes["GET /v1/query"];
  if (bare.startsWith("/v1/index/") && method === "DELETE") {
    return routes["DELETE /v1/index/:scope/:id"];
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
    console.error("[search]", err);
    sendJson(res, 500, { error: "internal_error", message: err.message });
  }
});

server.listen(config.port, () => {
  console.log(`[${config.service}] API on :${config.port}`);
});

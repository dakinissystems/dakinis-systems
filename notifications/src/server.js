import http from "node:http";
import { config } from "./config.js";
import { routes } from "./routes.js";
import { getRootPage } from "./root.js";
import { sendHtml } from "./status-page.js";
import { subscribeUserEvents } from "./lib/event-stream.js";

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
  if (method === "GET" && path.startsWith("/v1/preferences/")) return routes["GET /v1/preferences/:userId"];
  if (method === "GET" && path.startsWith("/v1/inbox/") && !path.endsWith("/read")) {
    return routes["GET /v1/inbox/:userId"];
  }
  if (method === "PATCH" && /\/v1\/inbox\/[^/]+\/read$/.test(path)) {
    return routes["PATCH /v1/inbox/:id/read"];
  }
  return null;
}

function handleEventStream(req, res) {
  const url = new URL(req.url || "/", "http://internal");
  const userId = String(url.searchParams.get("userId") || "").trim();
  if (!userId) {
    sendJson(res, 400, { error: "validation", message: "userId query required" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Dakinis-Service": config.service,
  });
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true, userId })}\n\n`);

  const unsubscribe = subscribeUserEvents(userId, res);
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      unsubscribe();
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

const server = http.createServer(async (req, res) => {
  const path = (req.url || "/").split("?")[0];

  if ((req.method || "GET") === "GET" && path === "/") {
    return sendHtml(res, 200, getRootPage(), config.service);
  }

  if ((req.method || "GET") === "GET" && path === "/v1/events/stream") {
    return handleEventStream(req, res);
  }

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

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

async function handle(req, res) {
  const path = (req.url || "/").split("?")[0];

  if (req.method === "GET" && path === "/") {
    return sendHtml(res, 200, getRootPage(), config.service);
  }

  const key = `${req.method} ${path}`;
  let handler = routes[key];
  if (!handler && req.method === "GET" && path === "/v1/webhooks/stripe") {
    return sendJson(res, 405, {
      error: "method_not_allowed",
      message: "Stripe webhooks use POST with Stripe-Signature header",
    });
  }
  if (!handler && path.startsWith("/v1/subscriptions/")) {
    handler = routes["GET /v1/subscriptions/:tenantId"];
  }
  if (!handler && path.startsWith("/v1/checkout/sessions/")) {
    handler = routes["GET /v1/checkout/sessions/:sessionId"];
  }

  if (!handler) {
    return sendJson(res, 404, { error: "not_found", path });
  }

  try {
    const result = await handler(req);
    sendJson(res, result.status, result.body);
  } catch (err) {
    console.error("[billing]", err);
    sendJson(res, 500, { error: "internal_error", message: err.message });
  }
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    sendJson(res, 500, { error: "internal_error" });
  });
});

server.listen(config.port, () => {
  console.log(`[${config.service}] listening on :${config.port}`);
});

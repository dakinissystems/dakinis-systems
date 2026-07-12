import http from "node:http";
import { parse as parseUrl } from "node:url";
import { handleRequest } from "./routes/index.js";
import { attachWebSocket } from "./websocket/syncRoom.js";

const PORT = Number(process.env.MEDIA_PORT || 4090);

const server = http.createServer(async (req, res) => {
  const url = parseUrl(req.url ?? "/", true);
  try {
    await handleRequest(req, res, url);
  } catch (err) {
    console.error("[media]", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "internal_error" }));
  }
});

attachWebSocket(server);

server.listen(PORT, () => {
  console.log(`[media] listening on http://localhost:${PORT}`);
});

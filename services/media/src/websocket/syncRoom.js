/**
 * WebSocket mínimo para sync de salas (sin dependencias externas).
 * Producción: usar ws + Redis pub/sub o Supabase Realtime.
 */
import { applyRoomPatch, getRoomState } from "../routes/rooms.js";

/** @type {Map<string, Set<import('node:http').ServerResponse>>} */
const subscribers = new Map();

/**
 * @param {import('node:http').Server} server
 */
export function attachWebSocket(server) {
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith("/media/ws")) {
      socket.destroy();
      return;
    }
    const roomId = url.searchParams.get("room");
    if (!roomId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-WebSocket-Accept: placeholder\r\n\r\n",
    );

    if (!subscribers.has(roomId)) subscribers.set(roomId, new Set());
    /** @type {any} */
    const wsLike = {
      send(payload) {
        try {
          socket.write(typeof payload === "string" ? payload : JSON.stringify(payload));
        } catch {
          /* closed */
        }
      },
    };
    subscribers.get(roomId).add(wsLike);

    socket.on("data", (buf) => {
      const text = buf.toString("utf8");
      const jsonStart = text.indexOf("{");
      if (jsonStart < 0) return;
      try {
        const msg = JSON.parse(text.slice(jsonStart));
        handleMessage(roomId, msg);
      } catch {
        /* ignore */
      }
    });

    socket.on("close", () => {
      subscribers.get(roomId)?.delete(wsLike);
    });

    const state = getRoomState(roomId);
    if (state) {
      wsLike.send(JSON.stringify({ type: "room:state", state }));
    }
  });
}

/**
 * @param {string} roomId
 * @param {Record<string, unknown>} msg
 */
function handleMessage(roomId, msg) {
  if (msg.type === "sync:state" && typeof msg === "object") {
    const patch = {
      currentTrackId: msg.trackId ?? null,
      positionMs: Number(msg.positionMs ?? 0),
      isPlaying: Boolean(msg.playing),
    };
    applyRoomPatch(roomId, patch);
    broadcast(roomId, { type: "room:state", state: getRoomState(roomId) });
  }
  if (msg.type === "sync:seek") {
    applyRoomPatch(roomId, { positionMs: Number(msg.positionMs ?? 0) });
    broadcast(roomId, { type: "room:state", state: getRoomState(roomId) });
  }
}

/**
 * @param {string} roomId
 * @param {unknown} payload
 */
function broadcast(roomId, payload) {
  const set = subscribers.get(roomId);
  if (!set) return;
  for (const ws of set) ws.send(JSON.stringify(payload));
}

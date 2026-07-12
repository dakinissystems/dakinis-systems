import { readBody, sendJson } from "../lib/http.js";

/** @type {Map<string, object>} */
const rooms = new Map();

export async function create(req, res, user) {
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  const id = crypto.randomUUID();
  const room = {
    id,
    ownerUserId: user.sub,
    akoenetServerId: body.akoenetServerId ?? null,
    akoenetChannelId: body.akoenetChannelId ?? null,
    currentTrackId: null,
    positionMs: 0,
    isPlaying: false,
    members: [{ userId: user.sub, role: "leader" }],
    updatedAt: new Date().toISOString(),
  };
  rooms.set(id, room);
  sendJson(res, 201, room);
}

export async function getOne(_req, res, _user, id) {
  const room = rooms.get(id);
  if (!room) return sendJson(res, 404, { error: "room_not_found" });
  sendJson(res, 200, room);
}

export async function join(_req, res, user, id) {
  const room = rooms.get(id);
  if (!room) return sendJson(res, 404, { error: "room_not_found" });
  if (!room.members.some((m) => m.userId === user.sub)) {
    room.members.push({ userId: user.sub, role: "follower" });
  }
  sendJson(res, 200, room);
}

export async function leave(_req, res, user, id) {
  const room = rooms.get(id);
  if (!room) return sendJson(res, 404, { error: "room_not_found" });
  room.members = room.members.filter((m) => m.userId !== user.sub);
  sendJson(res, 200, room);
}

export async function patchState(req, res, user, id) {
  const room = rooms.get(id);
  if (!room) return sendJson(res, 404, { error: "room_not_found" });
  const leader = room.members.find((m) => m.role === "leader");
  if (leader?.userId !== user.sub) {
    return sendJson(res, 403, { error: "not_room_leader" });
  }
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  if (body.currentTrackId != null) room.currentTrackId = String(body.currentTrackId);
  if (body.positionMs != null) room.positionMs = Number(body.positionMs);
  if (body.isPlaying != null) room.isPlaying = Boolean(body.isPlaying);
  room.updatedAt = new Date().toISOString();
  sendJson(res, 200, room);
}

/** @param {string} roomId */
export function getRoomState(roomId) {
  return rooms.get(roomId) ?? null;
}

/** @param {string} roomId @param {object} patch */
export function applyRoomPatch(roomId, patch) {
  const room = rooms.get(roomId);
  if (!room) return null;
  Object.assign(room, patch, { updatedAt: new Date().toISOString() });
  return room;
}

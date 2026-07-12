import { readBody, sendJson } from "../lib/http.js";

/** @type {Map<string, object>} */
const playlists = new Map([
  [
    "demo-playlist",
    {
      id: "demo-playlist",
      userId: "demo-user",
      name: "Dakinis Classics",
      isPublic: false,
      trackIds: ["demo-track-1", "demo-track-2"],
      createdAt: new Date().toISOString(),
    },
  ],
]);

export async function list(_req, res, user) {
  const items = [...playlists.values()].filter((p) => p.userId === user.sub || p.isPublic);
  sendJson(res, 200, { items });
}

export async function getOne(_req, res, user, id) {
  const playlist = playlists.get(id);
  if (!playlist || (playlist.userId !== user.sub && !playlist.isPublic)) {
    return sendJson(res, 404, { error: "playlist_not_found" });
  }
  sendJson(res, 200, playlist);
}

export async function create(req, res, user) {
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  const id = crypto.randomUUID();
  const playlist = {
    id,
    userId: user.sub,
    name: String(body.name ?? "New playlist"),
    isPublic: Boolean(body.isPublic),
    trackIds: Array.isArray(body.trackIds) ? body.trackIds.map(String) : [],
    createdAt: new Date().toISOString(),
  };
  playlists.set(id, playlist);
  sendJson(res, 201, playlist);
}

export async function patch(req, res, user, id) {
  const playlist = playlists.get(id);
  if (!playlist || playlist.userId !== user.sub) {
    return sendJson(res, 404, { error: "playlist_not_found" });
  }
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  if (body.name != null) playlist.name = String(body.name);
  if (body.isPublic != null) playlist.isPublic = Boolean(body.isPublic);
  sendJson(res, 200, playlist);
}

export async function remove(_req, res, user, id) {
  const playlist = playlists.get(id);
  if (!playlist || playlist.userId !== user.sub) {
    return sendJson(res, 404, { error: "playlist_not_found" });
  }
  playlists.delete(id);
  sendJson(res, 204, null);
}

export async function reorder(req, res, user, id) {
  const playlist = playlists.get(id);
  if (!playlist || playlist.userId !== user.sub) {
    return sendJson(res, 404, { error: "playlist_not_found" });
  }
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  if (!Array.isArray(body.trackIds)) {
    return sendJson(res, 400, { error: "trackIds_required" });
  }
  playlist.trackIds = body.trackIds.map(String);
  sendJson(res, 200, playlist);
}

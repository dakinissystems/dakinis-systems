import { readBody, sendJson } from "../lib/http.js";

/** @type {Map<string, object>} */
const store = new Map([
  [
    "demo-track-1",
    {
      id: "demo-track-1",
      title: "One More Time",
      artist: "Daft Punk",
      album: "Discovery",
      durationMs: 320000,
      sourceType: "url",
      sourceRef: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: null,
    },
  ],
  [
    "demo-track-2",
    {
      id: "demo-track-2",
      title: "Time",
      artist: "Hans Zimmer",
      album: "Inception",
      durationMs: 277000,
      sourceType: "url",
      sourceRef: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverUrl: null,
    },
  ],
]);

/** @type {Set<string>} */
const favorites = new Set(["demo-track-1"]);

export async function list(_req, res, user) {
  const items = [...store.values()].filter((t) => t.ownerUserId === user.sub || !t.ownerUserId);
  sendJson(res, 200, { items, total: items.length });
}

export async function getOne(_req, res, user, id) {
  const track = store.get(id);
  if (!track) return sendJson(res, 404, { error: "track_not_found" });
  sendJson(res, 200, track);
}

export async function create(req, res, user) {
  const body = /** @type {Record<string, unknown>} */ (await readBody(req));
  const id = crypto.randomUUID();
  const track = {
    id,
    ownerUserId: user.sub,
    title: String(body.title ?? "Untitled"),
    artist: String(body.artist ?? ""),
    album: String(body.album ?? ""),
    durationMs: Number(body.durationMs ?? 0),
    sourceType: String(body.sourceType ?? "url"),
    sourceRef: String(body.sourceRef ?? ""),
    coverUrl: body.coverUrl ? String(body.coverUrl) : null,
  };
  store.set(id, track);
  sendJson(res, 201, track);
}

export async function remove(_req, res, user, id) {
  const track = store.get(id);
  if (!track || track.ownerUserId !== user.sub) {
    return sendJson(res, 404, { error: "track_not_found" });
  }
  store.delete(id);
  sendJson(res, 204, null);
}

export async function listFavorites(_req, res) {
  const items = [...favorites].map((id) => store.get(id)).filter(Boolean);
  sendJson(res, 200, { items });
}

export async function addFavorite(_req, res, _user, trackId) {
  if (!store.has(trackId)) return sendJson(res, 404, { error: "track_not_found" });
  favorites.add(trackId);
  sendJson(res, 200, { ok: true });
}

export async function removeFavorite(_req, res, _user, trackId) {
  favorites.delete(trackId);
  sendJson(res, 200, { ok: true });
}

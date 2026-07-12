const BASE = import.meta.env?.VITE_MEDIA_API_URL ?? "http://localhost:4090/media";

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function api(path, init = {}) {
  const token = localStorage.getItem("dakinis_token") ?? "demo-user";
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`media_api_${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const mediaApi = {
  listTracks: () => api("/tracks"),
  listPlaylists: () => api("/playlists"),
  getPlaylist: (id) => api(`/playlists/${id}`),
  listSkins: () => api("/skins"),
  getSkinManifest: (slug) => api(`/skins/${slug}/manifest`),
  searchStreams: (q) => api(`/streams/search?q=${encodeURIComponent(q)}`),
  createRoom: (body) => api("/rooms", { method: "POST", body: JSON.stringify(body) }),
};

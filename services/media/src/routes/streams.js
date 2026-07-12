import { sendJson } from "../lib/http.js";

const DEMO_STATIONS = [
  { id: "radio-1", name: "SomaFM Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3", tags: "ambient,electronic" },
  { id: "radio-2", name: "Chillhop", url: "https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/", tags: "lofi,chill" },
];

export async function search(_req, res, _user, url) {
  const q = String(url.query?.q ?? "").toLowerCase();
  const items = DEMO_STATIONS.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.tags.includes(q),
  );
  sendJson(res, 200, { items, source: "demo" });
}

export async function favorites(_req, res) {
  sendJson(res, 200, { items: [DEMO_STATIONS[0]] });
}

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sendJson } from "../lib/http.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const classicManifest = JSON.parse(
  readFileSync(join(__dirname, "../../skins/classic/manifest.json"), "utf8"),
);

const SKINS = [
  { slug: "classic", name: "Classic", author: "Dakinis", installed: true },
  { slug: "dakinis", name: "Dakinis", author: "Dakinis", installed: false },
  { slug: "neon", name: "Neon", author: "Community", installed: false },
];

export async function list(_req, res) {
  sendJson(res, 200, { items: SKINS });
}

export async function manifest(_req, res, _user, slug) {
  if (slug === "classic") return sendJson(res, 200, classicManifest);
  return sendJson(res, 404, { error: "skin_not_found" });
}

export async function install(_req, res, _user, slug) {
  const skin = SKINS.find((s) => s.slug === slug);
  if (!skin) return sendJson(res, 404, { error: "skin_not_found" });
  skin.installed = true;
  sendJson(res, 200, { ok: true, skin });
}

import { config } from "../config.js";

/** @param {import("node:http").IncomingMessage} req */
export function requireServiceAuth(req) {
  if (!config.serviceKey) return { ok: true, dev: true };
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== config.serviceKey) {
    return { ok: false, status: 401, body: { error: "unauthorized", message: "Invalid service token" } };
  }
  return { ok: true };
}

export async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

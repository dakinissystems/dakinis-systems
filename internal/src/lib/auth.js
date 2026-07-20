import { config } from "../config.js";
import { verifyServiceBearer } from "./service-auth-keys.js";

/** @param {import("node:http").IncomingMessage} req */
export function requireServiceAuth(req) {
  return verifyServiceBearer(req, {
    primary: config.serviceKey,
    previous: config.serviceKeyPrevious,
  });
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

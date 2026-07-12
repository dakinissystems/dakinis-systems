/** @typedef {{ sub: string; email?: string }} AuthUser */

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {AuthUser | null}
 */
export function getUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (!token || token === "invalid") return null;
  return { sub: token.slice(0, 36) || "demo-user", email: "demo@dakinis.local" };
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @returns {AuthUser | null}
 */
export function requireAuth(req, res) {
  const user = getUser(req);
  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "unauthorized" }));
    return null;
  }
  return user;
}

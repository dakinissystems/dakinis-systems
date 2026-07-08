import jwt from "jsonwebtoken";
import { dndFindUserById } from "./db.js";

const DEV_JWT_FALLBACK = "tabletop-dev-secret-change-in-prod";
const rawSecret =
  process.env.TABLETOP_JWT_SECRET || process.env.DND_JWT_SECRET || "";
const JWT_SECRET =
  rawSecret ||
  (process.env.NODE_ENV === "production" ? "" : DEV_JWT_FALLBACK);

if (!JWT_SECRET) {
  throw new Error(
    "TABLETOP_JWT_SECRET (or DND_JWT_SECRET) is required in production"
  );
}

if (
  process.env.NODE_ENV === "production" &&
  JWT_SECRET === DEV_JWT_FALLBACK
) {
  throw new Error("Refusing to start with default Tabletop JWT secret in production");
}

const JWT_EXPIRES = process.env.TABLETOP_JWT_EXPIRES || process.env.DND_JWT_EXPIRES || "30d";

export function dndSignToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function dndVerifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function dndRequireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    const payload = dndVerifyToken(token);
    const user = dndFindUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    req.dndUser = user;
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

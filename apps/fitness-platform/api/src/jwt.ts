import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { config } from "./config.js";

export type AccessPayload = {
  sub: string;
  tenantId: string;
  role: Role;
};

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  if (typeof decoded !== "object" || decoded === null)
    throw new Error("INVALID_TOKEN");
  const { sub, tenantId, role } = decoded as Record<string, unknown>;
  if (typeof sub !== "string" || typeof tenantId !== "string" || typeof role !== "string")
    throw new Error("INVALID_TOKEN");
  return { sub, tenantId, role: role as Role };
}

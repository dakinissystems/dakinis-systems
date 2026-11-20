import type { NextFunction, Request, Response } from "express";
import type { Role, User } from "@prisma/client";
import { prisma } from "../prisma.js";
import { config } from "../config.js";
import { verifyAccessToken, type AccessPayload } from "../jwt.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: User;
      authPayload?: AccessPayload;
    }
  }
}

function bearer(req: Request): string | undefined {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return undefined;
  return h.slice(7).trim();
}

export function requireAuth(allowedRoles?: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userId: string | undefined;
      let tenantId: string | undefined;

      let useGateway =
        config.trustGatewayHeaders &&
        typeof req.headers["x-user-id"] === "string" &&
        typeof req.headers["x-tenant-id"] === "string";

      if (useGateway) {
        userId = req.headers["x-user-id"] as string;
        tenantId = req.headers["x-tenant-id"] as string;
      } else {
        const token = bearer(req);
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const payload = verifyAccessToken(token);
        userId = payload.sub;
        tenantId = payload.tenantId;
        req.authPayload = payload;
      }

      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId, isActive: true },
      });

      if (!user) return res.status(401).json({ error: "Unauthorized" });

      if (allowedRoles?.length && !allowedRoles.includes(user.role))
        return res.status(403).json({ error: "Forbidden" });

      req.authUser = user;
      next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

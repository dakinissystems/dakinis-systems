import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const mediaRouter = Router();

function oneParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

const VIDEO_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

mediaRouter.get(
  "/:tenantId/:fileName",
  requireAuth(["OWNER", "TRAINER", "STAFF", "CLIENT"]),
  (req, res) => {
    const u = req.authUser!;
    const tenantId = oneParam(req.params.tenantId);
    const fileName = oneParam(req.params.fileName);    if (tenantId !== u.tenantId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(fileName)) {
      res.status(400).json({ error: "Invalid file name" });
      return;
    }
    const base = path.resolve(config.uploadRoot, tenantId);
    const resolved = path.resolve(base, fileName);
    if (!resolved.startsWith(base)) {
      res.status(400).json({ error: "Bad path" });
      return;
    }
    if (!fs.existsSync(resolved)) {
      res.status(404).end();
      return;
    }

    const ext = path.extname(fileName).toLowerCase();
    res.setHeader("Content-Type", VIDEO_TYPES[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.sendFile(resolved);
  },
);

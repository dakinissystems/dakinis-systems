import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
  res.json({ status: "ok", service: "fitness-platform-api" });
});

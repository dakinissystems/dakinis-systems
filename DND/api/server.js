import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import characterRoutes from "./src/routes/characters.js";
import campaignRoutes from "./src/routes/campaigns.js";
import { dndGetDbStats, dndPersistDb } from "./src/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 4200;

const CORS_ORIGINS = (
  process.env.TABLETOP_CORS_ORIGINS ||
  process.env.DND_CORS_ORIGINS ||
  process.env.CORS_ORIGINS ||
  "http://localhost:5174,http://localhost:5173,https://tabletop.dakinissystems.com"
)
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const normalized = origin?.replace(/\/+$/, "");
      if (!origin || CORS_ORIGINS.includes(normalized ?? "")) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "4mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "tabletop-api",
    db: dndGetDbStats(),
    jwt: { configured: Boolean(process.env.TABLETOP_JWT_SECRET || process.env.DND_JWT_SECRET) },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/campaigns", campaignRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

process.on("SIGTERM", () => {
  dndPersistDb();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Tabletop API http://localhost:${PORT}`);
});

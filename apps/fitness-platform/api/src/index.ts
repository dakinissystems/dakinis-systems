import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { prisma } from "./prisma.js";
import { mediaRouter } from "./routes/media.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { clientRouter } from "./routes/client.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin:
      config.corsOrigins.length > 0
        ? config.corsOrigins
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/media", apiLimiter, mediaRouter);
app.use("/api/admin", apiLimiter, adminRouter);
app.use("/api/client", apiLimiter, clientRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
  console.log(`Fitness platform API listening on :${config.port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

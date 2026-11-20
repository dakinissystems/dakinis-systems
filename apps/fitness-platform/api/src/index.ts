import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { prisma } from "./prisma.js";
import { mediaRouter } from "./routes/media.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { clientRouter } from "./routes/client.js";

const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/media", mediaRouter);
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/client", clientRouter);

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

import "dotenv/config";
import path from "node:path";

export const config = {
  port: Number(process.env.PORT ?? 4010),
  databaseUrl: process.env.DATABASE_URL ?? "file:./data/dev.db",
  jwtSecret: process.env.JWT_SECRET ?? "dev-fitness-secret",
  trustGatewayHeaders: process.env.TRUST_GATEWAY_IDENTITY_HEADERS === "true",
  uploadRoot:
    process.env.FITNESS_UPLOAD_ROOT ?? path.join(process.cwd(), "data", "uploads"),
  exerciseUploadMaxMb: Number(process.env.FITNESS_UPLOAD_MAX_MB ?? 80),
  mediaMountPath: "/api/media",
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

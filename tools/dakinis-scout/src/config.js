import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCOUT_ROOT = path.resolve(__dirname, "..");

function env(name, fallback = "") {
  const v = process.env[name];
  return v == null || v === "" ? fallback : String(v).trim();
}

function envNum(name, fallback) {
  const raw = env(name, "");
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function loadDotEnv(filePath = path.join(SCOUT_ROOT, ".env")) {
  if (!fs.existsSync(filePath)) return 0;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  let n = 0;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
    n += 1;
  }
  return n;
}

export function getConfig() {
  return {
    watchlistPath: path.resolve(env("SCOUT_WATCHLIST", path.join(SCOUT_ROOT, "config/watchlist.json"))),
    dataDir: path.resolve(env("SCOUT_DATA_DIR", path.join(SCOUT_ROOT, "data"))),
    minProfitDiscord: envNum("SCOUT_MIN_PROFIT_DISCORD", 15),
    minProfitTelegram: envNum("SCOUT_MIN_PROFIT_TELEGRAM", 15),
    minProfitWhatsapp: envNum("SCOUT_MIN_PROFIT_WHATSAPP", 50),
    feesEur: envNum("SCOUT_FEES_EUR", 0),
    dryRun: env("SCOUT_DRY_RUN", "0") === "1" || env("SCOUT_DRY_RUN", "").toLowerCase() === "true",
    loopSeconds: envNum("SCOUT_LOOP_SECONDS", 300),
    maxAlertsPerRun: envNum("SCOUT_MAX_ALERTS_PER_RUN", 10),
    wallapop: {
      latitude: envNum("SCOUT_LAT", 40.4168),
      longitude: envNum("SCOUT_LNG", -3.7038),
      orderBy: env("SCOUT_WALLAPOP_ORDER", "most_relevance"),
      limit: envNum("SCOUT_WALLAPOP_LIMIT", 40),
    },
  };
}

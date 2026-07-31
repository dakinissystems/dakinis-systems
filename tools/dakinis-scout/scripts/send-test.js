#!/usr/bin/env node
/**
 * Smoke test: send one opportunity embed to Discord.
 * Usage:
 *   set DISCORD_WEBHOOK_URL=...   (or use tools/dakinis-scout/.env)
 *   npm run test:discord
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDiscordNotifier } from "../src/discord-notifier.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("[dakinis-scout] no .env at", envPath);
    return 0;
  }
  // Strip BOM if present (Windows editors)
  const text = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  let loaded = 0;
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
    // File wins over empty/missing env for local smoke tests
    process.env[key] = val;
    loaded += 1;
  }
  return loaded;
}

const loadedKeys = loadDotEnv();
console.error(
  `[dakinis-scout] .env keys=${loadedKeys} webhook=${process.env.DISCORD_WEBHOOK_URL ? "set" : "missing"}`,
);

const notifier = createDiscordNotifier();

const result = await notifier.sendOpportunity({
  product: "LEGO Star Wars 75379 — smoke test",
  buyPrice: 54.99,
  sellPrice: 79.95,
  profit: 17.3,
  roi: 31,
  brand: "LEGO",
  category: "lego",
  stars: 4,
  stock: "Disponible",
  urgency: "green",
  title: "🔥 Oportunidad detectada (test)",
  amazonUrl: "https://www.amazon.es/",
  wallapopUrl: "https://es.wallapop.com/",
  footer: "Dakinis Scout · test",
});

if (!result.ok) {
  console.error("[dakinis-scout] Discord send failed:", result);
  process.exit(1);
}

console.error("[dakinis-scout] Discord send ok", result);

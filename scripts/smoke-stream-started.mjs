/**
 * Smoke: stream.started → Internal → AkoeNet announce (bypass SA webhook).
 *
 * Usage:
 *   npx @railway/cli run --service dakinis-internal-api -- node scripts/smoke-stream-started.mjs
 *
 * Optional: AKOENET_SMOKE_SERVER_ID=1 · AKOENET_SMOKE_CHANNEL_ID · INTERNAL_API_URL
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), "../internal/package.json"));
const { Client } = require("pg");

const serverId = String(process.env.AKOENET_SMOKE_SERVER_ID || "1");
const internalBase = String(
  process.env.INTERNAL_API_URL || process.env.DAKINIS_INTERNAL_URL || "https://api.dakinissystems.com/internal"
).replace(/\/$/, "");
const serviceKey = String(process.env.DAKINIS_INTERNAL_SERVICE_KEY || "").trim();
const databaseUrl = String(process.env.DATABASE_URL || "").trim();

function dumpCompatibleUrl(raw) {
  const u = new URL(raw);
  u.searchParams.delete("pgbouncer");
  if (u.port === "6543" || (u.hostname.includes("pooler") && !u.port)) u.port = "5432";
  u.searchParams.delete("sslmode");
  return u.toString();
}

async function authFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${internalBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

async function main() {
  if (!serviceKey) throw new Error("Missing DAKINIS_INTERNAL_SERVICE_KEY");
  if (!databaseUrl) throw new Error("Missing DATABASE_URL");

  const client = new Client({
    connectionString: dumpCompatibleUrl(databaseUrl),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  let channelId = process.env.AKOENET_SMOKE_CHANNEL_ID || "";
  try {
    if (!channelId) {
      const { rows } = await client.query(
        `SELECT c.id::text AS channel_id FROM akoenet.channels c
         WHERE c.server_id = $1::bigint ORDER BY c.id ASC LIMIT 1`,
        [serverId]
      );
      channelId = rows[0]?.channel_id || "";
    }
    if (!channelId) {
      const { rows } = await client.query(
        `SELECT c.id::text AS channel_id
         FROM akoenet.channels c
         JOIN akoenet.categories cat ON cat.id = c.category_id
         WHERE cat.server_id = $1::bigint ORDER BY c.id ASC LIMIT 1`,
        [serverId]
      );
      channelId = rows[0]?.channel_id || "";
    }

    // Ensure streamer module is on with announce channel for this smoke.
    const putMod = await authFetch(`/akoenet/servers/${serverId}/modules/streamer`, {
      method: "PUT",
      body: {
        enabled: true,
        config: {
          autoAnnounce: true,
          announceChannel: channelId ? Number(channelId) : undefined,
        },
      },
    });
    if (!putMod.res.ok) {
      throw new Error(`enable streamer HTTP ${putMod.res.status}: ${JSON.stringify(putMod.json)}`);
    }
    console.log("streamer module enabled");

    const token = `SMOKE-STREAM-${Date.now().toString(36).toUpperCase()}`;
    const { res, json } = await authFetch(`/akoenet/servers/${serverId}/assistant/events`, {
      method: "POST",
      body: {
        type: "stream.started",
        source: "smoke-stream-started",
        payload: {
          streamer: "smoke",
          title: `[SMOKE] ${token}`,
          platform: "twitch",
          channel_id: channelId || undefined,
          note: token,
        },
      },
    });

    console.log("HTTP", res.status, JSON.stringify(json));
    if (!res.ok) throw new Error(`assistant/events failed`);

    const announce = json.announce || json.result?.announce || json;
    if (announce?.skipped && announce.reason === "streamer_module_disabled") {
      throw new Error("streamer still disabled after PUT");
    }
    if (announce?.ok === false && !announce?.skipped) {
      throw new Error(`announce failed: ${JSON.stringify(announce)}`);
    }
    // ok, skipped (no channel), or message posted
    console.log("STREAM_STARTED_SMOKE_PASSED", JSON.stringify(announce));
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

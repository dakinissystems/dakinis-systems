/**
 * Smoke: AkoeNet @AI (ai.ask) — enqueue via Internal → usage log &lt;30s.
 * Does not require local Redis (polls akoenet.assistant_usage).
 *
 * Usage (repo root):
 *   npx @railway/cli run --service dakinis-internal-api -- node scripts/smoke-akoenet-ai-ask.mjs
 *
 * Optional: AKOENET_SMOKE_SERVER_ID / CHANNEL_ID / USER_ID · AI_ASK_SLA_MS=30000
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), "../internal/package.json"));
const { Client } = require("pg");

const SLA_MS = Number(process.env.AI_ASK_SLA_MS || 30000);
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveTargets(client) {
  let channelId = process.env.AKOENET_SMOKE_CHANNEL_ID || "";
  let userId = process.env.AKOENET_SMOKE_USER_ID || "";

  if (!userId) {
    const { rows } = await client.query(
      `SELECT owner_id::text AS user_id FROM akoenet.servers WHERE id = $1::bigint LIMIT 1`,
      [serverId]
    );
    userId = rows[0]?.user_id || "";
  }
  if (!channelId) {
    const { rows } = await client.query(
      `SELECT c.id::text AS channel_id
       FROM akoenet.channels c
       WHERE c.server_id = $1::bigint
       ORDER BY c.id ASC
       LIMIT 1`,
      [serverId]
    );
    if (rows[0]) channelId = rows[0].channel_id;
  }
  if (!channelId) {
    const { rows } = await client.query(
      `SELECT c.id::text AS channel_id
       FROM akoenet.channels c
       JOIN akoenet.categories cat ON cat.id = c.category_id
       WHERE cat.server_id = $1::bigint
       ORDER BY c.id ASC
       LIMIT 1`,
      [serverId]
    );
    channelId = rows[0]?.channel_id || "";
  }
  return { channelId, userId };
}

function metaOf(row) {
  if (!row?.metadata) return {};
  return typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
}

async function main() {
  if (!serviceKey) throw new Error("Missing DAKINIS_INTERNAL_SERVICE_KEY");
  if (!databaseUrl) throw new Error("Missing DATABASE_URL (railway run --service dakinis-internal-api)");

  const client = new Client({
    connectionString: dumpCompatibleUrl(databaseUrl),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const { channelId, userId } = await resolveTargets(client);
    if (!channelId || !userId) {
      throw new Error(`Could not resolve channel/user for server ${serverId} (set AKOENET_SMOKE_*)`);
    }

    const token = `SMOKE${Date.now().toString(36).toUpperCase()}`;
    const prompt = `Di solo hola (smoke ${token}).`;
    const startedAt = Date.now();
    const sinceIso = new Date(startedAt - 2000).toISOString();

    console.log(`Enqueue ai.ask server=${serverId}`);
    const res = await fetch(`${internalBase}/akoenet/servers/${serverId}/assistant/command`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "ai.ask",
        userId,
        channelId,
        payload: { message: prompt },
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`command HTTP ${res.status}`);

    const cmd = body.result || body;
    console.log(`command status=${cmd.status || "unknown"} jobIdSet=${Boolean(cmd.jobId)}`);

    if (cmd.status === "replied" || cmd.status === "replied_fallback") {
      const wallMs = Date.now() - startedAt;
      console.log(`OK sync status=${cmd.status} latencyMs=${cmd.latencyMs ?? wallMs} wallMs=${wallMs}`);
      if (wallMs >= SLA_MS) process.exit(1);
      console.log("AKOENET_AI_ASK_SMOKE_PASSED");
      return;
    }

    const jobId = cmd.jobId || null;
    let found = null;
    while (Date.now() - startedAt < SLA_MS) {
      const { rows } = await client.query(
        `SELECT endpoint, metadata, created_at
         FROM akoenet.assistant_usage
         WHERE server_id = $1::bigint
           AND created_at >= $2::timestamptz
           AND endpoint IN ('ai.ask.worker', 'ai.ask')
         ORDER BY created_at DESC
         LIMIT 5`,
        [serverId, sinceIso]
      );
      for (const row of rows) {
        const meta = metaOf(row);
        if (row.endpoint === "ai.ask.worker" && ["replied", "replied_fallback", "ai_error", "post_failed"].includes(meta.status)) {
          if (jobId && meta.jobId && String(meta.jobId) !== String(jobId) && meta.status === "queued") continue;
          found = { row, meta };
          break;
        }
        if (jobId && String(meta.jobId) === String(jobId) && meta.status && meta.status !== "queued") {
          found = { row, meta };
          break;
        }
      }
      if (found) break;
      await sleep(1500);
    }

    const wallMs = Date.now() - startedAt;
    if (!found) {
      console.error(`FAIL: no ai.ask.worker usage within ${SLA_MS}ms (waited ${wallMs}ms)`);
      process.exit(1);
    }

    const status = found.meta.status;
    console.log(
      `done status=${status} messageId=${found.meta.messageId || "n/a"} endpoint=${found.row.endpoint} wallMs=${wallMs}`
    );
    if (!["replied", "replied_fallback"].includes(String(status))) {
      console.error(`FAIL: bad status=${status}`);
      process.exit(1);
    }
    if (wallMs >= SLA_MS) {
      console.error(`FAIL: wall clock ${wallMs}ms >= SLA ${SLA_MS}ms`);
      process.exit(1);
    }
    console.log("AKOENET_AI_ASK_SMOKE_PASSED");
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

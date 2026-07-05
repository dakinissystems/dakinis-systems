import { createClient } from "redis";
import { config } from "./config.js";

/** @type {import("redis").RedisClientType | null} */
let client = null;

function isBullMqMode() {
  return String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq";
}

async function getRedis() {
  if (!config.redisUrl) return null;
  if (!client) {
    client = createClient({ url: config.redisUrl });
    client.on("error", (err) => console.error("[billing] redis:", err.message));
    await client.connect();
  }
  return client;
}

/**
 * @param {string} type
 * @param {Record<string, unknown>} payload
 */
export async function publishBillingEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    ts: new Date().toISOString(),
    source: config.service,
  };

  if (isBullMqMode() && config.redisUrl) {
    try {
      const { publishPlatformEvent } = await import("@dakinis/shared-ai/event-bus");
      const result = await publishPlatformEvent(type, payload, {
        source: config.service,
        tenantId: typeof payload.tenantId === "string" ? payload.tenantId : undefined,
      });
      await notifyCoreBillingSync(type, payload);
      return result?.event || event;
    } catch (err) {
      console.warn("[billing] bullmq publish failed, falling back to list:", err instanceof Error ? err.message : err);
    }
  }

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.lPush(config.eventsQueue, JSON.stringify(event));
    }
  } catch (err) {
    console.warn("[billing] event publish failed:", err instanceof Error ? err.message : err);
  }

  await notifyCoreBillingSync(type, payload);

  return event;
}

/**
 * Fallback HTTP hacia Core cuando Redis no está disponible o como refuerzo E2E.
 * @param {string} type
 * @param {Record<string, unknown>} payload
 */
async function notifyCoreBillingSync(type, payload) {
  const gateway = String(process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  const coreBase = String(
    process.env.DAKINIS_CORE_INTERNAL_URL ||
      process.env.CORE_INTERNAL_URL ||
      process.env.DAKINIS_CORE_URL ||
      (gateway ? `${gateway}/core` : "")
  ).replace(/\/$/, "");
  const key = String(process.env.INTERNAL_API_KEY || process.env.DAKINIS_INTERNAL_SERVICE_KEY || "").trim();
  if (!coreBase || !key) return;

  const url = `${coreBase}/api/internal/billing/sync`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: type, payload }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[billing] core sync fallback:", res.status, text.slice(0, 200));
    }
  } catch (err) {
    console.warn("[billing] core sync fallback error:", err instanceof Error ? err.message : err);
  }
}

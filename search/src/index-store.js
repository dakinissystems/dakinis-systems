import { config } from "./config.js";
import { getRedis, SEARCH_SCOPES } from "./lib/redis.js";

function docKey(scope, id) {
  return `search:doc:${scope}:${id}`;
}

function scopeSetKey(scope) {
  return `search:scope:${scope}`;
}

/**
 * @param {{ scope: string; id: string; title?: string; body?: string; metadata?: object }} doc
 */
export async function indexDocument(doc) {
  const redis = await getRedis();
  const record = {
    ...doc,
    indexedAt: new Date().toISOString(),
  };
  if (!redis) {
    return { indexed: false, record };
  }
  await redis.set(docKey(doc.scope, doc.id), JSON.stringify(record));
  await redis.sAdd(scopeSetKey(doc.scope), doc.id);

  const indexJob = { action: "index", scope: doc.scope, id: doc.id, title: doc.title };
  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq") {
    try {
      const { publishPlatformEvent } = await import("@dakinis/shared-ai/event-bus");
      await publishPlatformEvent("search.index", indexJob, {
        source: config.service,
        queueKey: "search",
      });
    } catch (err) {
      console.warn("[search] bullmq index job failed:", err instanceof Error ? err.message : err);
      await redis.lPush(config.indexQueue, JSON.stringify(indexJob));
    }
  } else {
    await redis.lPush(config.indexQueue, JSON.stringify(indexJob));
  }

  return { indexed: true, record };
}

/**
 * @param {string} scope
 * @param {string} id
 */
export async function removeDocument(scope, id) {
  const redis = await getRedis();
  if (!redis) return { removed: false };
  await redis.del(docKey(scope, id));
  await redis.sRem(scopeSetKey(scope), id);
  return { removed: true };
}

/**
 * @param {string} q
 * @param {string} scope
 */
export async function searchDocuments(q, scope = "all") {
  const redis = await getRedis();
  if (!redis) {
    return { hits: [], total: 0, mode: "no_redis" };
  }
  const needle = String(q || "").trim().toLowerCase();
  const scopes =
    scope === "all" ? SEARCH_SCOPES.filter((s) => s !== "all") : [scope];
  const hits = [];

  for (const sc of scopes) {
    const ids = await redis.sMembers(scopeSetKey(sc));
    for (const id of ids) {
      const raw = await redis.get(docKey(sc, id));
      if (!raw) continue;
      let doc;
      try {
        doc = JSON.parse(raw);
      } catch {
        continue;
      }
      const hay = `${doc.title || ""} ${doc.body || ""}`.toLowerCase();
      if (!needle || hay.includes(needle)) {
        hits.push({ scope: sc, id, title: doc.title, snippet: (doc.body || "").slice(0, 120), score: needle ? 1 : 0.5 });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return { hits: hits.slice(0, 25), total: hits.length, mode: "redis_keyword" };
}

export async function dequeueIndexJob(timeoutSec = 5) {
  const redis = await getRedis();
  if (!redis) return null;
  const res = await redis.brPop(config.indexQueue, timeoutSec);
  if (!res) return null;
  try {
    return JSON.parse(res.element);
  } catch {
    return { action: "parse_error", raw: res.element };
  }
}

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
export async function storeSearchDocument(doc) {
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
  return { indexed: true, record };
}

async function enqueueIndexJob(indexJob) {
  const redis = await getRedis();
  if (!redis) return;

  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq") {
    try {
      const { publishPlatformEvent } = await import("@dakinis/shared-ai/event-bus");
      await publishPlatformEvent("search.index", indexJob, {
        source: config.service,
        queueKey: "search",
      });
      return;
    } catch (err) {
      console.warn("[search] bullmq index job failed:", err instanceof Error ? err.message : err);
    }
  }
  await redis.lPush(config.indexQueue, JSON.stringify(indexJob));
}

/**
 * Apply index job from queue/BullMQ (idempotent store, no re-enqueue).
 * @param {object} job
 */
export async function applyIndexJob(job) {
  const payload = job?.payload || job;
  const scope = payload.scope || "global";
  const id = payload.id;
  if (!id) return { applied: false, reason: "missing_id" };

  let title = payload.title || "";
  let body = payload.body || payload.text || "";

  if ((!body || !String(body).trim()) && scope === "knowledge") {
    const { fetchKnowledgeDocument } = await import("./lib/knowledge-source.js");
    const fetched = await fetchKnowledgeDocument(id);
    if (fetched) {
      title = fetched.title || title;
      body = fetched.content || body;
    }
  }

  const result = await storeSearchDocument({ scope, id, title, body, metadata: payload.metadata });
  return { applied: result.indexed, ...result };
}

/**
 * @param {{ scope: string; id: string; title?: string; body?: string; metadata?: object }} doc
 */
export async function indexDocument(doc) {
  const result = await storeSearchDocument(doc);
  if (!result.indexed) return result;

  const indexJob = { action: "index", scope: doc.scope, id: doc.id, title: doc.title, body: doc.body };
  await enqueueIndexJob(indexJob);
  return result;
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
 * @param {string|null} [tenantId]
 */
export async function searchDocuments(q, scope = "all", tenantId = null) {
  const redis = await getRedis();
  if (!redis) {
    return { hits: [], total: 0, mode: "no_redis" };
  }
  const needle = String(q || "").trim().toLowerCase();
  const scopes =
    scope === "all" ? SEARCH_SCOPES.filter((s) => s !== "all") : [scope];
  const hits = [];
  const tenant = tenantId ? String(tenantId) : null;

  for (const sc of scopes) {
    const ids = await redis.sMembers(scopeSetKey(sc));
    if (!ids.length) continue;

    // Batch GETs — O(scopes) round-trips instead of O(docs).
    const keys = ids.map((id) => docKey(sc, id));
    const rawDocs = typeof redis.mGet === "function" ? await redis.mGet(keys) : await Promise.all(keys.map((k) => redis.get(k)));

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const raw = rawDocs[i];
      if (!raw) continue;
      let doc;
      try {
        doc = JSON.parse(raw);
      } catch {
        continue;
      }
      if (tenant) {
        const docTenant = doc.metadata?.businessId || doc.metadata?.tenantId;
        if (docTenant) {
          if (String(docTenant) !== tenant) continue;
        } else if (doc.metadata?.product === "akoenet") {
          /* mensajes cross-product visibles en Hub */
        } else if (["knowledge", "documentation", "global"].includes(sc)) {
          /* docs globales / knowledge */
        } else {
          continue;
        }
      }
      const hay = `${doc.title || ""} ${doc.body || ""}`.toLowerCase();
      if (!needle || hay.includes(needle)) {
        hits.push({
          scope: sc,
          id,
          title: doc.title,
          snippet: (doc.body || "").slice(0, 120),
          score: needle ? 1 : 0.5,
          path: doc.metadata?.path,
          product: doc.metadata?.product,
          metadata: doc.metadata,
        });
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

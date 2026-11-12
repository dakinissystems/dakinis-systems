import { config, SEARCH_SCOPES } from "./config.js";
import { indexDocument, removeDocument, searchDocuments } from "./index-store.js";
import { getRedis } from "./lib/redis.js";
import { requireServiceAuth } from "./lib/service-auth.js";
import { tenantForSearch } from "./lib/query-tenant.js";

function deny(req) {
  const auth = requireServiceAuth(req);
  if (auth.ok) return null;
  return { status: auth.status, body: auth.body };
}

async function probe(work) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(false), 800);
  });
  try {
    return await Promise.race([
      work().then((value) => value !== false).catch(() => false),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function parseQuery(req) {
  const url = new URL(req.url || "/", "http://internal");
  return {
    q: url.searchParams.get("q") || "",
    scope: url.searchParams.get("scope") || "all",
    tenantId: url.searchParams.get("tenantId") || url.searchParams.get("businessId") || null,
  };
}

function parseDeletePath(path) {
  const m = path.match(/^\/v1\/index\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { scope: decodeURIComponent(m[1]), id: decodeURIComponent(m[2]) };
}

export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.2.0-scaffold",
      scopes: SEARCH_SCOPES,
      redis: config.redisUrl ? "configured" : "not_configured",
    },
  }),

  "GET /health/live": () => ({ status: 200, body: { ok: true } }),

  "GET /health/ready": async () => {
    if (!config.redisUrl) return { status: 200, body: { ok: true, redis: "skipped" } };
    const ok = await probe(async () => {
      const redis = await getRedis();
      if (!redis) return false;
      await redis.ping();
      return true;
    });
    return ok
      ? { status: 200, body: { ok: true, redis: "ok" } }
      : { status: 503, body: { ok: false, redis: "down" } };
  },

  "GET /v1/query": async (req) => {
    const denied = deny(req);
    if (denied) return denied;
    const { q, scope, tenantId } = parseQuery(req);
    const tenant = tenantForSearch(req, tenantId);
    if (!tenant.ok) return { status: tenant.status, body: tenant.body };
    const result = await searchDocuments(q, scope, tenant.tenant);
    return {
      status: 200,
      body: {
        query: q,
        scope,
        ...result,
      },
    };
  },

  "POST /v1/index": async (req) => {
    const denied = deny(req);
    if (denied) return denied;
    const body = await readJson(req);
    if (body === null) return { status: 400, body: { error: "invalid_json" } };
    const { scope, id, title = "", body: text = "", metadata = {} } = body;
    if (!scope || !id) {
      return { status: 400, body: { error: "validation", message: "scope and id required" } };
    }
    const result = await indexDocument({ scope, id, title, body: text, metadata });
    return {
      status: result.indexed ? 202 : 503,
      body: {
        ok: result.indexed,
        indexed: result.indexed,
        document: result.record,
      },
    };
  },

  "DELETE /v1/index/:scope/:id": async (req) => {
    const denied = deny(req);
    if (denied) return denied;
    const path = (req.url || "").split("?")[0];
    const parsed = parseDeletePath(path);
    if (!parsed) return { status: 400, body: { error: "invalid_path" } };
    const result = await removeDocument(parsed.scope, parsed.id);
    return { status: 200, body: { ok: result.removed, ...parsed } };
  },
};

import { config, SEARCH_SCOPES } from "./config.js";

export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.1.0-scaffold",
      scopes: SEARCH_SCOPES,
      redis: config.redisUrl ? "configured" : "not_configured",
    },
  }),

  "GET /v1/query": () => ({
    status: 501,
    body: {
      error: "not_implemented",
      message: "Full-text + vector search — implement indexer worker first",
      scopes: SEARCH_SCOPES,
    },
  }),

  "POST /v1/index": () => ({
    status: 501,
    body: {
      error: "not_implemented",
      message: "Internal API — enqueue document for indexing",
      queue: config.indexQueue,
    },
  }),

  "DELETE /v1/index/:scope/:id": () => ({
    status: 501,
    body: { error: "not_implemented", message: "Remove document from index" },
  }),
};

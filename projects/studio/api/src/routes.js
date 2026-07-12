import { parseJson, sendJson, notFound, badRequest, conflict } from "./lib/http.js";
import * as sessionStore from "./services/sessions.js";
import { loadCatalogJson } from "./config.js";

/** @type {Record<string, (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, params: Record<string,string>) => Promise<void>>} */
export const routes = {
  "GET /v1/health": async (_req, res) => {
    sendJson(res, {
      ok: true,
      service: "dakinis-studio-api",
      version: "0.1.0",
      languageAgnostic: true,
    });
  },

  "GET /v1/sessions": async (req, res) => {
    const url = new URL(req.url || "/", "http://local");
    const limit = Number(url.searchParams.get("limit")) || 20;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const data = sessionStore.listSessions({ limit, offset });
    sendJson(res, data);
  },

  "POST /v1/sessions": async (req, res) => {
    const body = await parseJson(req);
    if (!body?.name || !body?.runtimeId) {
      badRequest(res, "name and runtimeId required");
      return;
    }
    const session = sessionStore.createSession(body);
    sendJson(res, session, 201);
  },

  "GET /v1/sessions/:id": async (req, res, params) => {
    const session = sessionStore.getSession(params.id);
    if (!session) {
      notFound(res);
      return;
    }
    sendJson(res, session);
  },

  "DELETE /v1/sessions/:id": async (_req, res, params) => {
    if (!sessionStore.getSession(params.id)) {
      notFound(res);
      return;
    }
    sessionStore.deleteSession(params.id);
    sendJson(res, null, 204);
  },

  "GET /v1/sessions/:id/state": async (_req, res, params) => {
    const state = sessionStore.getSessionState(params.id);
    if (!state) {
      notFound(res);
      return;
    }
    sendJson(res, state);
  },

  "PUT /v1/sessions/:id/state": async (req, res, params) => {
    try {
      const body = await parseJson(req);
      const state = sessionStore.putSessionState(params.id, body);
      if (!state) {
        notFound(res);
        return;
      }
      sendJson(res, state);
    } catch (e) {
      if (/** @type {{ status?: number }} */ (e).status === 409) {
        conflict(res, e.message);
      } else {
        throw e;
      }
    }
  },

  "POST /v1/sessions/:id/switch": async (_req, res, params) => {
    const session = sessionStore.switchSession(params.id);
    if (!session) {
      notFound(res);
      return;
    }
    sendJson(res, session);
  },

  "GET /v1/sessions/:id/files/tree": async (_req, res, params) => {
    const tree = sessionStore.getFileTree(params.id);
    if (!tree) {
      notFound(res);
      return;
    }
    sendJson(res, tree);
  },

  "GET /v1/sessions/:id/files/read": async (req, res, params) => {
    const url = new URL(req.url || "/", "http://local");
    const path = url.searchParams.get("path");
    if (!path) {
      badRequest(res, "path query required");
      return;
    }
    const file = sessionStore.readFile(params.id, path);
    if (!file) {
      notFound(res);
      return;
    }
    sendJson(res, file);
  },

  "POST /v1/sessions/:id/files/ops": async (req, res, params) => {
    try {
      const body = await parseJson(req);
      if (!body?.ops?.length) {
        badRequest(res, "ops array required");
        return;
      }
      const result = sessionStore.applyFileOps(params.id, body);
      if (!result) {
        notFound(res);
        return;
      }
      sendJson(res, result);
    } catch (e) {
      if (/** @type {{ status?: number, payload?: object }} */ (e).status === 409) {
        sendJson(res, e.payload, 409);
      } else {
        throw e;
      }
    }
  },

  "GET /v1/catalog/runtimes": async (_req, res) => {
    sendJson(res, loadCatalogJson("runtimes.json"));
  },

  "GET /v1/catalog/lsp": async (_req, res) => {
    sendJson(res, loadCatalogJson("lsp-servers.json"));
  },
};

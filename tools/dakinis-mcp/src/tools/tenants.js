import { z } from "zod";
import { config } from "../config.js";
import { apiGet, jsonResult } from "../lib/http.js";

function requireInternalAuth() {
  if (!config.internalUrl) {
    return {
      ok: false,
      error: "DAKINIS_INTERNAL_URL not set",
    };
  }
  if (!config.serviceToken) {
    return {
      ok: false,
      error: "DAKINIS_SERVICE_TOKEN (or INTERNAL_SERVICE_KEY) not set",
      hint: "Admin workspace APIs require service bearer auth.",
    };
  }
  return { ok: true };
}

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerTenantTools(server) {
  server.registerTool(
    "list_workspaces",
    {
      title: "List workspaces",
      description:
        "List Dakinis workspaces/tenants via Internal GET /admin/v1/workspaces. " +
        "Requires DAKINIS_INTERNAL_URL + DAKINIS_SERVICE_TOKEN.",
      inputSchema: {
        status: z.string().optional().describe("Filter by status (e.g. active, suspended)."),
        plan: z.string().optional().describe("Filter by plan slug."),
        limit: z.number().int().positive().max(200).optional().describe("Max rows (default server-side)."),
        offset: z.number().int().min(0).optional().describe("Pagination offset."),
      },
    },
    async ({ status, plan, limit, offset }) => {
      const gate = requireInternalAuth();
      if (!gate.ok) return jsonResult(gate, { isError: true });

      const res = await apiGet(config.internalUrl, "/admin/v1/workspaces", {
        auth: true,
        searchParams: {
          status,
          plan,
          limit: limit != null ? String(limit) : undefined,
          offset: offset != null ? String(offset) : undefined,
        },
      });

      if (!res.ok) {
        return jsonResult(
          { ok: false, status: res.status, error: res.error, data: res.data },
          { isError: true },
        );
      }
      return jsonResult({ ok: true, status: res.status, latencyMs: res.latencyMs, data: res.data });
    },
  );

  server.registerTool(
    "get_workspace",
    {
      title: "Get workspace",
      description:
        "Fetch a single workspace/tenant via Internal GET /admin/v1/workspaces/:id. " +
        "Requires DAKINIS_INTERNAL_URL + DAKINIS_SERVICE_TOKEN.",
      inputSchema: {
        id: z.string().min(1).describe("Workspace UUID or id."),
      },
    },
    async ({ id }) => {
      const gate = requireInternalAuth();
      if (!gate.ok) return jsonResult(gate, { isError: true });

      const res = await apiGet(config.internalUrl, `/admin/v1/workspaces/${encodeURIComponent(id)}`, {
        auth: true,
      });

      if (!res.ok) {
        return jsonResult(
          { ok: false, status: res.status, error: res.error, data: res.data },
          { isError: true },
        );
      }
      return jsonResult({ ok: true, status: res.status, latencyMs: res.latencyMs, data: res.data });
    },
  );
}

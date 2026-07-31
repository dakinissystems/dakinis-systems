import { z } from "zod";
import { config } from "../config.js";
import { apiGet, jsonResult } from "../lib/http.js";

async function probeOne(name, baseUrl, healthPath = "/health") {
  if (!baseUrl) {
    return { id: name, ok: null, detail: "not_configured", latencyMs: null, status: null };
  }
  const res = await apiGet(baseUrl, healthPath, { auth: false });
  const body = res.data && typeof res.data === "object" ? res.data : {};
  const ok = res.ok && body.ok !== false;
  return {
    id: name,
    ok,
    status: res.status || null,
    detail: body.service || body.status || res.error || (ok ? "ok" : "unhealthy"),
    latencyMs: res.latencyMs,
    version: body.version || null,
    url: res.url,
  };
}

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerHealthTools(server) {
  server.registerTool(
    "platform_health",
    {
      title: "Platform health",
      description:
        "Probe /health on configured Dakinis services (Internal + optional Hub, Core, Billing, etc.). " +
        "Does not require a service token for public /health endpoints. " +
        "Optionally also call Internal GET /platform/health (requires DAKINIS_SERVICE_TOKEN).",
      inputSchema: {
        includePlatformAggregate: z
          .boolean()
          .optional()
          .describe("If true, also fetch Internal /platform/health (auth required). Default false."),
        only: z
          .array(z.string())
          .optional()
          .describe("Optional list of service ids to probe (e.g. internal, billing). Default: all configured."),
      },
    },
    async ({ includePlatformAggregate = false, only }) => {
      const entries = Object.entries(config.services).filter(([, url]) => url);
      const filtered = only?.length
        ? entries.filter(([id]) => only.includes(id))
        : entries;

      if (!filtered.length && !Object.values(config.services).some(Boolean)) {
        return jsonResult(
          {
            ok: false,
            error: "no_services_configured",
            hint: "Set DAKINIS_INTERNAL_URL and optionally DAKINIS_*_URL env vars.",
          },
          { isError: true },
        );
      }

      const probes = await Promise.all(
        filtered.map(([id, url]) => probeOne(id, url, "/health")),
      );

      const result = {
        checkedAt: new Date().toISOString(),
        ok: probes.every((p) => p.ok === true || p.ok === null),
        probes,
      };

      if (includePlatformAggregate) {
        if (!config.serviceToken) {
          result.platformHealth = {
            ok: false,
            error: "service_token_required",
            hint: "Set DAKINIS_SERVICE_TOKEN for /platform/health",
          };
        } else {
          const agg = await apiGet(config.internalUrl, "/platform/health", { auth: true });
          result.platformHealth = {
            ok: agg.ok,
            status: agg.status,
            latencyMs: agg.latencyMs,
            error: agg.error,
            data: agg.data,
          };
        }
      }

      const failed = probes.filter((p) => p.ok === false);
      return jsonResult(result, { isError: failed.length > 0 });
    },
  );
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GatewayClient } from "@dakinis/shared-platform/gateway-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse "GET /internal/hub/dashboard/:userId" → { method, path, params }
 * @param {string} routeKey
 */
function parseRouteKey(routeKey) {
  const space = routeKey.indexOf(" ");
  const method = routeKey.slice(0, space).toUpperCase();
  let routePath = routeKey.slice(space + 1).replace(/^\/internal/, "");
  return { method, path: routePath };
}

/**
 * Build callable client methods from docs/contracts/*.json routes map.
 */
export class ContractClient extends GatewayClient {
  /**
   * @param {object} contract JSON contract with routes: Record<string, string>
   * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
   */
  constructor(contract, opts = {}) {
    const base = (opts.baseUrl || contract.baseUrl || "").replace(/\/internal\/?$/, "");
    super({ ...opts, baseUrl: base || opts.baseUrl || "http://localhost/internal" });
    this.contract = contract;
    this._bindRoutes();
  }

  _bindRoutes() {
    const routes = this.contract.routes || {};
    for (const [routeKey, description] of Object.entries(routes)) {
      const { method, path: routePath } = parseRouteKey(routeKey);
      const fnName = methodNameFromRoute(method, routePath);
      if (this[fnName]) continue;
      this[fnName] = async (params = {}, body = null) => {
        const resolved = fillPath(routePath, params);
        const init = { method };
        if (body && method !== "GET") {
          init.body = JSON.stringify(body);
        }
        return this.request(resolved, init);
      };
      this[fnName].description = description;
    }
  }
}

/**
 * @param {string} method
 * @param {string} routePath
 */
function methodNameFromRoute(method, routePath) {
  const segments = routePath.split("/").filter(Boolean);
  const params = segments.filter((s) => s.startsWith(":")).map((s) => s.slice(1));
  const literals = segments.filter((s) => !s.startsWith(":"));
  const base = literals.join("_").replace(/-/g, "_") || "root";
  const suffix = params.length ? `_${params.join("_")}` : "";
  return `${method.toLowerCase()}_${base}${suffix}`;
}

/**
 * @param {string} routePath
 * @param {Record<string, string>} params
 */
function fillPath(routePath, params) {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const val = params[key];
    if (val == null) throw new Error(`missing_path_param:${key}`);
    return encodeURIComponent(String(val));
  });
}

/**
 * @param {string} [contractName]
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export function loadContractClient(contractName = "internal-api", opts = {}) {
  const contractPath = path.resolve(
    __dirname,
    "../../../../docs/contracts",
    `${contractName}.json`,
  );
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  return new ContractClient(contract, opts);
}

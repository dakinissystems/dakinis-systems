import { config } from "../config.js";
import { checkDbHealth } from "../lib/db.js";
import { getBusHealthSummary } from "../lib/bullmq-monitor.js";

/**
 * @param {string} name
 * @param {string} baseUrl
 * @param {string} [healthPath]
 * @param {number} [timeoutMs]
 */
async function probeHealth(name, baseUrl, healthPath = "/health", timeoutMs = 4000) {
  if (!baseUrl) {
    return { id: name, ok: null, detail: "not_configured", latencyMs: null, version: null };
  }
  const url = `${baseUrl.replace(/\/$/, "")}${healthPath}`;
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    const ok = res.ok && data.ok !== false;
    return {
      id: name,
      ok,
      detail: data.service || data.status || (ok ? "ok" : `http_${res.status}`),
      latencyMs: Date.now() - started,
      version: data.version || null,
    };
  } catch (err) {
    return {
      id: name,
      ok: false,
      detail: err?.name === "AbortError" ? "timeout" : err?.message || "probe_failed",
      latencyMs: Date.now() - started,
      version: null,
    };
  }
}

function getProcessMetrics() {
  const mem = process.memoryUsage();
  return {
    uptimeMs: Math.round(process.uptime() * 1000),
    rssMb: Math.round(mem.rss / 1048576),
    heapUsedMb: Math.round(mem.heapUsed / 1048576),
    heapTotalMb: Math.round(mem.heapTotal / 1048576),
  };
}

function getRailwayContext() {
  const environment = String(process.env.RAILWAY_ENVIRONMENT || "").trim() || null;
  const projectId = String(process.env.RAILWAY_PROJECT_ID || "").trim() || null;
  const serviceId = String(process.env.RAILWAY_SERVICE_ID || "").trim() || null;
  const publicDomain = String(process.env.RAILWAY_PUBLIC_DOMAIN || "").trim() || null;
  const projectUrl = String(process.env.RAILWAY_PROJECT_URL || "").trim() || null;
  return {
    configured: Boolean(environment || projectId || publicDomain),
    environment,
    projectId,
    serviceId,
    publicDomain,
    dashboardUrl: projectUrl || (projectId ? `https://railway.com/project/${projectId}` : null),
  };
}

export async function getPlatformMetrics() {
  const checkedAt = new Date().toISOString();
  const [db, eventBus, ...probed] = await Promise.all([
    checkDbHealth(),
    getBusHealthSummary(),
    probeHealth("search", config.searchUrl),
    probeHealth("notifications", config.notificationsUrl),
    probeHealth("billing", config.billingUrl),
    probeHealth("knowledge", config.knowledgeUrl),
    probeHealth("akoenet", config.akoenetUrl),
  ]);

  const internal = {
    id: "internal",
    ok: db.ok !== false,
    detail: config.service,
    latencyMs: null,
    version: "0.3.1",
  };

  const services = [internal, ...probed];
  const checked = services.filter((s) => s.ok !== null);
  const healthy = checked.filter((s) => s.ok === true);
  const degraded = checked.filter((s) => s.ok === false);

  return {
    checkedAt,
    summary: {
      servicesTotal: checked.length,
      servicesHealthy: healthy.length,
      servicesDegraded: degraded.length,
      databaseOk: db.ok !== false,
      eventBusOk: !eventBus.enabled || (eventBus.dlqDepth ?? 0) === 0,
    },
    process: getProcessMetrics(),
    railway: getRailwayContext(),
    eventBus,
    database: db,
    services,
    stub: checked.length <= 1,
  };
}

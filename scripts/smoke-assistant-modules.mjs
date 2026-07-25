/**
 * Smoke: Assistant module toggle persists (PUT → GET).
 *
 * Usage:
 *   npx @railway/cli run --service dakinis-internal-api -- node scripts/smoke-assistant-modules.mjs
 */
const serverId = String(process.env.AKOENET_SMOKE_SERVER_ID || "1");
const moduleKey = String(process.env.AKOENET_SMOKE_MODULE_KEY || "welcome");
const internalBase = String(
  process.env.INTERNAL_API_URL || process.env.DAKINIS_INTERNAL_URL || "https://api.dakinissystems.com/internal"
).replace(/\/$/, "");
const serviceKey = String(process.env.DAKINIS_INTERNAL_SERVICE_KEY || "").trim();

async function authFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${internalBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

function findModule(items, key) {
  return (items || []).find((m) => m.module_key === key || m.key === key || m.moduleKey === key);
}

async function main() {
  if (!serviceKey) throw new Error("Missing DAKINIS_INTERNAL_SERVICE_KEY");

  const before = await authFetch(`/akoenet/servers/${serverId}/modules`);
  if (!before.res.ok) throw new Error(`GET modules HTTP ${before.res.status}`);
  const prev = findModule(before.json.items, moduleKey);
  const prevEnabled = Boolean(prev?.enabled);
  const nextEnabled = !prevEnabled;

  console.log(`toggle ${moduleKey}: ${prevEnabled} → ${nextEnabled}`);
  const put = await authFetch(`/akoenet/servers/${serverId}/modules/${encodeURIComponent(moduleKey)}`, {
    method: "PUT",
    body: { enabled: nextEnabled, config: prev?.config || {} },
  });
  if (!put.res.ok) throw new Error(`PUT HTTP ${put.res.status}: ${JSON.stringify(put.json)}`);

  const after = await authFetch(`/akoenet/servers/${serverId}/modules`);
  if (!after.res.ok) throw new Error(`GET after HTTP ${after.res.status}`);
  const row = findModule(after.json.items, moduleKey);
  if (!row || Boolean(row.enabled) !== nextEnabled) {
    throw new Error(`persist fail: expected enabled=${nextEnabled}, got ${JSON.stringify(row)}`);
  }

  // Restore previous state
  const restore = await authFetch(`/akoenet/servers/${serverId}/modules/${encodeURIComponent(moduleKey)}`, {
    method: "PUT",
    body: { enabled: prevEnabled, config: prev?.config || {} },
  });
  if (!restore.res.ok) {
    console.warn("WARN: could not restore previous module state", restore.res.status);
  }

  console.log("ASSISTANT_MODULES_SMOKE_PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

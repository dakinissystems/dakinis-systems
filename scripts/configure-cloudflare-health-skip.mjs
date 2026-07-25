/**
 * Skip Cloudflare bot challenges on health endpoints so GitHub Actions
 * uptime probes (and external monitors) are not blocked by Bot Fight.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone WAF Write.
 * Optional: CLOUDFLARE_ZONE_ID / CLOUDFLARE_ZONE_NAME (default dakinissystems.com)
 *
 * Usage:
 *   $env:CLOUDFLARE_API_TOKEN="…"   # real token — never commit or paste in chat
 *   node scripts/configure-cloudflare-health-skip.mjs
 *
 * Dashboard equivalent:
 *   Security → WAF → Custom rules → Create rule
 *   Expression: ends_with(http.request.uri.path, "/health")
 *   Action: Skip → Browser Integrity Check (+ Super Bot Fight if available)
 *
 * Note: free Bot Fight Mode cannot be skipped via Ruleset Engine. If probes
 * still get "Just a moment…", use UptimeRobot or disable Bot Fight for the zone.
 */
const token = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "").trim();
const zoneName = String(process.env.CLOUDFLARE_ZONE_NAME || "dakinissystems.com").trim();
let zoneId = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

const RULE_DESCRIPTION = "Dakinis skip bot challenge on /health";
const EXPRESSION =
  '(ends_with(http.request.uri.path, "/health") or http.request.uri.path eq "/health")';
const PHASE = "http_request_firewall_custom";

if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (Zone WAF Write).");
  process.exit(1);
}
if (/^<|^YOUR_|placeholder|Zone WAF Write/i.test(token)) {
  console.error("CLOUDFLARE_API_TOKEN looks like a placeholder.");
  console.error("Create a real token: https://dash.cloudflare.com/profile/api-tokens");
  console.error("Permissions: Zone WAF Edit + Zone Read (zone dakinissystems.com).");
  console.error('PowerShell: $env:CLOUDFLARE_API_TOKEN = "paste-real-token-here"');
  process.exit(1);
}

async function cf(path, { method = "GET", body, allowStatuses = [] } = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  if (allowStatuses.includes(res.status)) return { ...json, _httpStatus: res.status };
  if (!res.ok || json.success === false) {
    const err = json?.errors?.[0]?.message || JSON.stringify(json);
    throw new Error(`${method} ${path}: HTTP ${res.status} ${err}`);
  }
  return json;
}

async function resolveZoneId() {
  if (zoneId) return zoneId;
  const list = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  const z = list.result?.[0];
  if (!z?.id) throw new Error(`Zone not found: ${zoneName}`);
  return z.id;
}

function healthSkipRule() {
  return {
    action: "skip",
    action_parameters: {
      // Products skippable via Ruleset Engine (not free Bot Fight Mode).
      products: ["bic", "securityLevel", "uaBlock", "hot", "zoneLockdown"],
      phases: ["http_request_sbfm"]
    },
    description: RULE_DESCRIPTION,
    enabled: true,
    expression: EXPRESSION
  };
}

async function main() {
  zoneId = await resolveZoneId();
  console.log(`Zone ${zoneName} (${zoneId})`);

  const entry = await cf(`/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`, {
    allowStatuses: [404]
  });

  if (entry._httpStatus === 404) {
    await cf(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: {
        name: "default",
        description: "Zone WAF custom rules (entrypoint)",
        kind: "zone",
        phase: PHASE,
        rules: [healthSkipRule()]
      }
    });
    console.log("Created custom ruleset + rule:", RULE_DESCRIPTION);
  } else {
    const rules = Array.isArray(entry.result?.rules) ? entry.result.rules : [];
    const existing = rules.find((r) =>
      String(r.description || "").includes("skip bot challenge on /health")
    );
    if (existing) {
      console.log("Already present:", existing.id, existing.description);
      console.log("CLOUDFLARE_HEALTH_SKIP_OK");
      return;
    }
    await cf(`/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`, {
      method: "PUT",
      body: { rules: [healthSkipRule(), ...rules] }
    });
    console.log("Added rule:", RULE_DESCRIPTION);
  }

  console.log("Expression:", EXPRESSION);
  console.log("CLOUDFLARE_HEALTH_SKIP_OK");
  console.log("");
  console.log("If GitHub runners still get CF challenge on /health:");
  console.log("  • Free Bot Fight Mode cannot be skipped via API — use UptimeRobot, or");
  console.log("  • Security → Bots → turn off Bot Fight / use Super Bot Fight + this skip rule");
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});

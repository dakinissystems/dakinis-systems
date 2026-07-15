import { config } from "../config.js";

export function akoenetApiBase() {
  const explicit = String(config.akoenetUrl || process.env.AKOENET_API_URL || "").trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const gateway = String(process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/akoenet-api`;
  return "https://api.akoenet.dakinissystems.com";
}

export function integrationWebhookSecret() {
  return String(
    process.env.SCHEDULER_WEBHOOK_SECRET ||
      process.env.AKOENET_WEBHOOK_SECRET ||
      config.serviceKey ||
      ""
  ).trim();
}

/**
 * @param {string} path — e.g. "/integrations/assistant/ai-reply"
 * @param {Record<string, unknown>} body
 */
export async function postAkoeNetIntegration(path, body) {
  const secret = integrationWebhookSecret();
  if (!secret) {
    return { ok: false, error: "no_webhook_secret" };
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  try {
    const res = await fetch(`${akoenetApiBase()}${normalized}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scheduler-webhook-secret": secret,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json.error || json.message || "akoenet_post_failed",
      };
    }
    return { ok: true, ...json };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network_error" };
  }
}

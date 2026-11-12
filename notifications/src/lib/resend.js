import { config } from "../config.js";

const EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,255}\.[^\s@<>]{2,24}$/;
const SENSITIVE = /password|token|secret|authorization|api[_-]?key/i;

function resolveRecipient(payload = {}) {
  const to = payload.to || payload.email || payload.recipient;
  if (!to || Array.isArray(to)) return [];
  const one = String(to).trim();
  if (!EMAIL.test(one)) return [];
  return [one];
}

function payloadHasSecret(value, depth = 0) {
  if (!value || typeof value !== "object" || depth > 3) return false;
  return Object.keys(value).some((key) => SENSITIVE.test(key) || payloadHasSecret(value[key], depth + 1));
}

function resolveSubject(type, payload = {}) {
  return String(payload.subject || payload.title || type || "Notificación Dakinis").slice(0, 500);
}

function resolveHtml(type, payload = {}) {
  if (payload.html && process.env.NOTIFICATION_ALLOW_HTML === "true") return String(payload.html);
  const text = payload.message || payload.body || payload.text;
  if (text) return `<p>${String(text).replace(/</g, "&lt;")}</p>`;
  return `<p>${String(type || "notification")}</p>`;
}

/**
 * @param {{ type?: string; payload?: object }} job
 */
export async function sendResendEmail(job) {
  if (!config.resendApiKey) {
    return { sent: false, reason: "no_resend_key" };
  }

  const payload = job.payload && typeof job.payload === "object" ? job.payload : {};
  if (payloadHasSecret(payload)) {
    return { sent: false, reason: "sensitive_field" };
  }
  const to = resolveRecipient(payload);
  if (!to.length) {
    return { sent: false, reason: "no_recipient" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.resendFrom,
      to,
      subject: resolveSubject(job.type, payload),
      html: resolveHtml(job.type, payload),
    }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `resend_http_${res.status}`;
    console.error("[worker] resend failed", message);
    return { sent: false, reason: message, status: res.status };
  }

  return { sent: true, id: body?.id || null };
}

export function resendConfigured() {
  return Boolean(config.resendApiKey);
}

import { config } from "../config.js";

function resolveRecipient(payload = {}) {
  const to = payload.to || payload.email || payload.recipient;
  if (!to) return null;
  return Array.isArray(to) ? to.filter(Boolean) : [String(to).trim()].filter(Boolean);
}

function resolveSubject(type, payload = {}) {
  return String(payload.subject || payload.title || type || "Notificación Dakinis").slice(0, 500);
}

function resolveHtml(type, payload = {}) {
  if (payload.html) return String(payload.html);
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

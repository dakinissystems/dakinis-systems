const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Dakinis Tabletop <noreply@dakinissystems.com>";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isResendConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || "").trim());
}

function layoutTabletop({ title, innerHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;background:#0f1419;font-family:'Source Sans 3',system-ui,sans-serif;color:#e8e4dc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f1419;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#1a222c;border-radius:12px;border:1px solid #2d3848;overflow:hidden;">
          <tr>
            <td style="padding:22px 24px;background:linear-gradient(135deg,#3d2e14 0%,#6b4f1d 50%,#c9a227 100%);">
              <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Dakinis Tabletop</div>
              <div style="font-size:20px;font-weight:700;color:#fff;margin-top:6px;line-height:1.25;">${escapeHtml(title)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-size:15px;line-height:1.55;color:#c8c2b8;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 20px;border-top:1px solid #2d3848;font-size:12px;color:#8a939f;line-height:1.45;">
              ${footerNote || "Dakinis Tabletop — personajes, campañas y mesa compartida. Mensaje automático; no respondas salvo que se indique un correo de contacto."}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendResendEmail({ to, subject, html, text }) {
  const key = String(process.env.RESEND_API_KEY || "").trim();
  if (!key) return { ok: false, error: "RESEND_API_KEY not set" };

  const from = String(process.env.RESEND_FROM || "").trim() || DEFAULT_FROM;
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: recipients, subject, html, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || `http_${res.status}`, status: res.status };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e?.message || "fetch_failed" };
  }
}

export async function sendTabletopRegistrationEmail({ to, verifyUrl }) {
  const inner = `
    <p style="margin:0 0 16px;">Pediste crear una cuenta en <strong>Dakinis Tabletop</strong>.</p>
    <p style="margin:0 0 16px;">Abre el enlace para elegir tu contraseña y terminar el registro. Caduca en 24 horas.</p>
    <p style="margin:0 0 16px;">
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#c9a227;color:#1a1204;border-radius:8px;text-decoration:none;font-weight:600;">Completar registro</a>
    </p>
    <p style="margin:0;font-size:13px;color:#8a939f;word-break:break-all;">${escapeHtml(verifyUrl)}</p>
  `;
  const html = layoutTabletop({
    title: "Confirma tu email",
    innerHtml: inner,
    footerNote: "Si no pediste esta cuenta, ignora este mensaje.",
  });
  return sendResendEmail({
    to,
    subject: "Confirma tu registro en Dakinis Tabletop",
    html,
    text: `Completa tu registro en Dakinis Tabletop (caduca en 24h): ${verifyUrl}`,
  });
}

export async function sendTabletopPasswordResetEmail({ to, resetUrl }) {
  const inner = `
    <p style="margin:0 0 16px;">Pediste restablecer la contraseña de <strong>Dakinis Tabletop</strong>.</p>
    <p style="margin:0 0 16px;">Abre el enlace para elegir una nueva contraseña. Caduca en 1 hora.</p>
    <p style="margin:0 0 16px;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#c9a227;color:#1a1204;border-radius:8px;text-decoration:none;font-weight:600;">Restablecer contraseña</a>
    </p>
    <p style="margin:0;font-size:13px;color:#8a939f;word-break:break-all;">${escapeHtml(resetUrl)}</p>
  `;
  const html = layoutTabletop({
    title: "Restablece tu contraseña",
    innerHtml: inner,
    footerNote: "Si no pediste este cambio, ignora este mensaje.",
  });
  return sendResendEmail({
    to,
    subject: "Restablece tu contraseña de Dakinis Tabletop",
    html,
    text: `Restablece tu contraseña de Dakinis Tabletop (caduca en 1h): ${resetUrl}`,
  });
}

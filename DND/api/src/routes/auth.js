import { Router } from "express";
import { dndRequireAuth, dndSignToken } from "../auth.js";
import { dndVerifyPassword } from "../password.js";
import {
  dndConsumePasswordResetToken,
  dndConsumeRegistrationToken,
  dndCreateUser,
  dndDeletePasswordResetToken,
  dndDeleteRegistrationToken,
  dndDeletePasswordResetTokensForEmail,
  dndDeleteRegistrationTokensForEmail,
  dndFindPasswordResetToken,
  dndFindRegistrationToken,
  dndFindUserByEmail,
  dndFindUserById,
  dndInsertPasswordResetToken,
  dndInsertRegistrationToken,
  dndUpdateUserPassword,
} from "../db.js";
import {
  isResendConfigured,
  sendTabletopPasswordResetEmail,
  sendTabletopRegistrationEmail,
} from "../lib/resend-mail.js";
import {
  buildTabletopPasswordResetCompleteUrl,
  buildTabletopRegistrationCompleteUrl,
} from "../lib/public-url.js";
import { maskEmailForDisplay, newRawToken, sha256Hex } from "../lib/tokens.js";
import { verifyPlatformAccessToken } from "../lib/platform-auth.js";

const router = Router();

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function tokenExpiryHours(hours) {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function isValidRawToken(token) {
  return /^[a-f0-9]{64}$/i.test(String(token || "").trim());
}

router.post("/register", (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? "");
  const displayName = String(req.body?.displayName ?? req.body?.name ?? "").trim();
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email y contraseña (mín. 6) requeridos" });
  }
  if (dndFindUserByEmail(email)) {
    return res.status(409).json({ error: "Email ya registrado" });
  }
  const id = dndCreateUser(email, password, displayName);
  const user = dndFindUserById(id);
  const token = dndSignToken(user);
  res.status(201).json({ user, token });
});

router.post("/register/start", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email válido requerido" });
  }

  if (dndFindUserByEmail(email)) {
    return res.json({ sent: true });
  }

  const rawToken = newRawToken();
  const tokenHash = sha256Hex(rawToken);
  const verifyUrl = buildTabletopRegistrationCompleteUrl(rawToken);

  dndDeleteRegistrationTokensForEmail(email);
  dndInsertRegistrationToken(email, tokenHash, tokenExpiryHours(24));

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production") {
      dndDeleteRegistrationToken(tokenHash);
      return res.status(503).json({ error: "email_not_configured" });
    }
    return res.status(200).json({ sent: true, dev_verify_url: verifyUrl });
  }

  const mailRes = await sendTabletopRegistrationEmail({ to: email, verifyUrl });
  if (!mailRes.ok) {
    dndDeleteRegistrationToken(tokenHash);
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "email_send_failed" });
    }
    return res.status(200).json({ sent: true, dev_verify_url: verifyUrl, warning: "email_send_failed_dev" });
  }

  return res.json({ sent: true });
});

router.get("/register/pending", (req, res) => {
  const raw = String(req.query?.token ?? "").trim();
  if (!isValidRawToken(raw)) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }
  const row = dndFindRegistrationToken(sha256Hex(raw));
  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }
  return res.json({ email_masked: maskEmailForDisplay(row.email_norm) });
});

router.post("/register/complete", (req, res) => {
  const rawToken = String(req.body?.token ?? "").trim();
  const password = String(req.body?.password ?? "");
  const displayName = String(req.body?.displayName ?? req.body?.name ?? "").trim();
  if (!isValidRawToken(rawToken) || !password || password.length < 6) {
    return res.status(400).json({ error: "Token y contraseña (mín. 6) requeridos" });
  }

  const consumed = dndConsumeRegistrationToken(sha256Hex(rawToken));
  if (!consumed?.email_norm) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }
  if (dndFindUserByEmail(consumed.email_norm)) {
    return res.status(409).json({ error: "Email ya registrado" });
  }

  const id = dndCreateUser(consumed.email_norm, password, displayName);
  const user = dndFindUserById(id);
  const token = dndSignToken(user);
  return res.status(201).json({ user, token });
});

router.post("/login", (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }
  const row = dndFindUserByEmail(email);
  if (!row || !dndVerifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const user = dndFindUserById(row.id);
  const token = dndSignToken(user);
  res.json({ user, token });
});

router.post("/password-reset/start", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email válido requerido" });
  }

  const existing = dndFindUserByEmail(email);
  if (!existing) {
    return res.json({ sent: true });
  }

  const rawToken = newRawToken();
  const tokenHash = sha256Hex(rawToken);
  const resetUrl = buildTabletopPasswordResetCompleteUrl(rawToken);

  dndDeletePasswordResetTokensForEmail(email);
  dndInsertPasswordResetToken(email, tokenHash, tokenExpiryHours(1));

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production") {
      dndDeletePasswordResetToken(tokenHash);
      return res.status(503).json({ error: "email_not_configured" });
    }
    return res.status(200).json({ sent: true, dev_reset_url: resetUrl });
  }

  const mailRes = await sendTabletopPasswordResetEmail({ to: email, resetUrl });
  if (!mailRes.ok) {
    dndDeletePasswordResetToken(tokenHash);
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "email_send_failed" });
    }
    return res.status(200).json({ sent: true, dev_reset_url: resetUrl, warning: "email_send_failed_dev" });
  }

  return res.json({ sent: true });
});

router.get("/password-reset/pending", (req, res) => {
  const raw = String(req.query?.token ?? "").trim();
  if (!isValidRawToken(raw)) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }
  const row = dndFindPasswordResetToken(sha256Hex(raw));
  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }
  return res.json({ email_masked: maskEmailForDisplay(row.email_norm) });
});

router.post("/password-reset/complete", (req, res) => {
  const rawToken = String(req.body?.token ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!isValidRawToken(rawToken) || !password || password.length < 6) {
    return res.status(400).json({ error: "Token y contraseña (mín. 6) requeridos" });
  }

  const consumed = dndConsumePasswordResetToken(sha256Hex(rawToken));
  if (!consumed?.email_norm) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }

  const ok = dndUpdateUserPassword(consumed.email_norm, password);
  if (!ok) {
    return res.status(400).json({ error: "invalid_or_expired_token" });
  }

  const row = dndFindUserByEmail(consumed.email_norm);
  const user = dndFindUserById(row.id);
  return res.json({ user, email: user.email });
});

router.post("/platform-exchange", async (req, res) => {
  const platformToken = String(
    req.body?.platformToken || req.body?.token || req.headers.authorization?.replace(/^Bearer\s+/i, "") || "",
  ).trim();
  if (!platformToken) {
    return res.status(400).json({ error: "platformToken required" });
  }
  try {
    const profile = await verifyPlatformAccessToken(platformToken);
    let row = dndFindUserByEmail(profile.email);
    if (!row) {
      const displayName = profile.email.split("@")[0] || "Aventurero";
      const id = dndCreateUser(profile.email, newRawToken(12), displayName);
      row = dndFindUserByEmail(profile.email);
      void id;
    }
    const user = dndFindUserById(row.id);
    const token = dndSignToken(user);
    return res.json({ user, token, sso: { source: "google", provider: "dakinis-auth" } });
  } catch (err) {
    return res.status(err.status || 502).json({ error: err.message || "platform_exchange_failed" });
  }
});

router.get("/me", dndRequireAuth, (req, res) => {
  const token = dndSignToken(req.dndUser);
  res.json({ user: req.dndUser, token });
});

export default router;

import { createHash, randomBytes } from "node:crypto";

export function sha256Hex(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function newRawToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function maskEmailForDisplay(emailNorm) {
  const email = String(emailNorm || "").trim().toLowerCase();
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
}

export function isValidRawToken(token) {
  return /^[a-f0-9]{64}$/i.test(String(token || "").trim());
}

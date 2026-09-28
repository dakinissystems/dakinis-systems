/**
 * Unified UI state vocabulary for Platform UI (DES).
 */

export const UI_STATES = Object.freeze({
  loading: "loading",
  empty: "empty",
  error: "error",
  success: "success",
  warning: "warning",
  offline: "offline",
  permissionDenied: "permission_denied",
  notFound: "not_found",
});

/**
 * Normalize API / thrown errors into a UI-facing shape.
 * @param {unknown} err
 * @param {{ fallbackMessage?: string }} [opts]
 */
export function normalizeUiError(err, opts = {}) {
  const fallback = opts.fallbackMessage || "Algo no ha ido bien";
  if (!err) {
    return { code: "UNKNOWN", message: fallback, severity: "error", status: null };
  }
  if (typeof err === "string") {
    return { code: "MESSAGE", message: err, severity: "error", status: null };
  }
  const e = /** @type {any} */ (err);
  const code =
    e.code ||
    e.body?.code ||
    e.error ||
    (e.status === 403 ? "PERMISSION_DENIED" : e.status === 404 ? "NOT_FOUND" : "REQUEST_FAILED");
  const message = e.body?.message || e.message || fallback;
  const severity =
    code === "INVENTORY_STOCK_LOW" || String(code).includes("WARN")
      ? "warning"
      : code === "PERMISSION_DENIED"
        ? "warning"
        : "error";
  return {
    code: String(code),
    message: String(message),
    severity,
    status: typeof e.status === "number" ? e.status : null,
    retryable: Boolean(e.retryable ?? (e.status >= 500 || e.status === 429)),
  };
}

/**
 * Map normalized error → UI_STATES key.
 * @param {ReturnType<typeof normalizeUiError>} normalized
 */
export function uiStateFromError(normalized) {
  if (!normalized) return UI_STATES.error;
  if (normalized.code === "PERMISSION_DENIED" || normalized.status === 403) {
    return UI_STATES.permissionDenied;
  }
  if (normalized.code === "NOT_FOUND" || normalized.status === 404) {
    return UI_STATES.notFound;
  }
  if (normalized.status === 0 || normalized.code === "OFFLINE") {
    return UI_STATES.offline;
  }
  if (normalized.severity === "warning") return UI_STATES.warning;
  return UI_STATES.error;
}

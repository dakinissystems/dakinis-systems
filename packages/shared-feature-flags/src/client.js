import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * @typedef {{
 *   fetchFlags?: (keys: string[]) => Promise<Record<string, boolean>>,
 *   keys?: string[],
 *   initial?: Record<string, boolean>,
 * }} UseFeatureFlagsOptions
 */

/**
 * React hook — pass `fetchFlags` from product API (AkoeNet `/workspace/feature-flags`).
 * @param {UseFeatureFlagsOptions} opts
 */
export function useFeatureFlags(opts = {}) {
  const keys = opts.keys || [];
  const keysKey = keys.join(",");
  const [flags, setFlags] = useState(opts.initial || {});
  const [loading, setLoading] = useState(Boolean(opts.fetchFlags && keys.length > 0));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!opts.fetchFlags || keys.length === 0) return undefined;
    let cancelled = false;
    setLoading(true);
    opts
      .fetchFlags(keys)
      .then((data) => {
        if (!cancelled) {
          setFlags(data || {});
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [opts.fetchFlags, keysKey]);

  const isEnabled = useCallback((key, defaultValue = true) => {
    if (!(key in flags)) return defaultValue;
    return Boolean(flags[key]);
  }, [flags]);

  return useMemo(
    () => ({ flags, loading, error, isEnabled }),
    [flags, loading, error, isEnabled]
  );
}

/**
 * @param {Record<string, boolean>} flags
 * @param {string} key
 * @param {boolean} [defaultValue]
 */
export function isFeatureFlagEnabled(flags, key, defaultValue = true) {
  if (!flags || !(key in flags)) return defaultValue;
  return Boolean(flags[key]);
}

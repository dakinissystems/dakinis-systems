import { createPlatformContext } from "@dakinis/shared-platform/platform-context";
import { acceptInviteViaFacade } from "../facades/invite-facade.js";
import { getCacheService } from "../lib/cache.js";

/**
 * Singleton platform context factory for internal API (no HTTP request).
 * @param {{ userId?: string; email?: string; traceId?: string; product?: string }} [opts]
 */
export function buildInternalContext(opts = {}) {
  return createPlatformContext({
    user: opts.userId ? { id: opts.userId, email: opts.email } : null,
    product: opts.product ?? "internal-api",
    traceId: opts.traceId,
    cache: getCacheService(),
    logger: console,
  });
}

export { createPlatformContext };

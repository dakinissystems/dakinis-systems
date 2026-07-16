/**
 * Request-scoped platform context — identity, services, correlation.
 */

/**
 * @typedef {object} PlatformUser
 * @property {string} id
 * @property {string} [email]
 * @property {string} [role]
 */

/**
 * @typedef {object} PlatformWorkspace
 * @property {string} id
 * @property {string} [slug]
 * @property {string} [role]
 */

/**
 * @param {{
 *   user?: PlatformUser | null;
 *   workspace?: PlatformWorkspace | null;
 *   permissions?: string[];
 *   policies?: Record<string, (...args: unknown[]) => boolean>;
 *   locale?: string;
 *   timezone?: string;
 *   product?: string;
 *   featureFlags?: Record<string, boolean>;
 *   requestId?: string;
 *   traceId?: string;
 *   requestStart?: number;
 *   clientVersion?: string;
 *   device?: string;
 *   cache?: import("./cache-service.js").CacheService | null;
 *   logger?: { info?: Function; warn?: Function; error?: Function } | null;
 *   telemetry?: { record?: Function } | null;
 * }} [props]
 */
export function createPlatformContext(props = {}) {
  const permissions = new Set(props.permissions || []);

  return {
    user: props.user ?? null,
    workspace: props.workspace ?? null,
    permissions: [...permissions],
    policies: props.policies ?? {},
    locale: props.locale ?? "es",
    timezone: props.timezone ?? "UTC",
    product: props.product ?? "platform",
    featureFlags: props.featureFlags ?? {},
    requestId: props.requestId ?? crypto.randomUUID(),
    traceId: props.traceId ?? props.requestId ?? crypto.randomUUID(),
    requestStart: props.requestStart ?? Date.now(),
    clientVersion: props.clientVersion ?? null,
    device: props.device ?? null,
    cache: props.cache ?? null,
    logger: props.logger ?? null,
    telemetry: props.telemetry ?? null,

    /**
     * @param {string} permission
     */
    can(permission) {
      return permissions.has(permission);
    },

    /**
     * @param {string} name
     * @param {...unknown} args
     */
    policy(name, ...args) {
      const fn = this.policies[name];
      if (!fn) return false;
      return Boolean(fn(...args));
    },

    /**
     * @param {Partial<ReturnType<typeof createPlatformContext>>} patch
     */
    with(patch) {
      return createPlatformContext({
        user: patch.user !== undefined ? patch.user : this.user,
        workspace: patch.workspace !== undefined ? patch.workspace : this.workspace,
        permissions: patch.permissions ?? this.permissions,
        policies: patch.policies ?? this.policies,
        locale: patch.locale ?? this.locale,
        timezone: patch.timezone ?? this.timezone,
        product: patch.product ?? this.product,
        featureFlags: patch.featureFlags ?? this.featureFlags,
        requestId: patch.requestId ?? this.requestId,
        traceId: patch.traceId ?? this.traceId,
        requestStart: patch.requestStart ?? this.requestStart,
        clientVersion: patch.clientVersion ?? this.clientVersion,
        device: patch.device ?? this.device,
        cache: patch.cache !== undefined ? patch.cache : this.cache,
        logger: patch.logger !== undefined ? patch.logger : this.logger,
        telemetry: patch.telemetry !== undefined ? patch.telemetry : this.telemetry,
      });
    },
  };
}

/**
 * Express-style helper to build context from an HTTP request.
 * @param {import("http").IncomingMessage} req
 * @param {Parameters<typeof createPlatformContext>[0]} [base]
 */
export function createContextFromRequest(req, base = {}) {
  const headers = /** @type {Record<string, string | string[] | undefined>} */ (req.headers || {});
  const requestId =
    (typeof headers["x-request-id"] === "string" && headers["x-request-id"]) ||
    (typeof headers["x-correlation-id"] === "string" && headers["x-correlation-id"]) ||
    crypto.randomUUID();
  const traceId =
    (typeof headers["x-trace-id"] === "string" && headers["x-trace-id"]) || requestId;

  return createPlatformContext({
    ...base,
    requestId,
    traceId,
    product:
      base.product ||
      (typeof headers["x-dakinis-product"] === "string" ? headers["x-dakinis-product"] : "platform"),
    clientVersion:
      typeof headers["x-client-version"] === "string" ? headers["x-client-version"] : base.clientVersion,
    device: typeof headers["x-device"] === "string" ? headers["x-device"] : base.device,
  });
}

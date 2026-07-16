/**
 * CommandBus middleware chain — Validation → Permissions → Audit → Handler.
 */

/**
 * @typedef {(command: object, ctx: object, next: () => Promise<unknown>) => Promise<unknown>} CommandMiddleware
 */

/**
 * @param {CommandMiddleware[]} middlewares
 * @param {(command: object) => Promise<unknown>} handler
 */
export function composeCommandMiddleware(middlewares, handler) {
  return async (command, ctx = {}) => {
    let index = -1;

    const dispatch = async (i) => {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const fn = middlewares[i];
      if (!fn) return handler(command);
      return fn(command, ctx, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
}

/**
 * @param {(command: object) => void | Promise<void>} validate
 */
export function validationMiddleware(validate) {
  return async (command, ctx, next) => {
    await validate(command);
    return next();
  };
}

/**
 * @param {(command: object, ctx: object) => boolean | Promise<boolean>} check
 * @param {string} [errorCode]
 */
export function permissionsMiddleware(check, errorCode = "permission_denied") {
  return async (command, ctx, next) => {
    const ok = await check(command, ctx);
    if (!ok) throw new Error(errorCode);
    return next();
  };
}

/**
 * @param {(command: object, ctx: object, result: unknown) => void | Promise<void>} audit
 */
export function auditMiddleware(audit) {
  return async (command, ctx, next) => {
    const result = await next();
    await audit(command, ctx, result);
    return result;
  };
}

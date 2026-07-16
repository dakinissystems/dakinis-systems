/**
 * Light command bus — register handlers by command type.
 * Optional middleware chain per command type (Validation → Permissions → Audit → Handler).
 */

import { composeCommandMiddleware } from "./command-middleware.js";

export class CommandBus {
  constructor() {
    /** @type {Map<string, (command: object, ctx?: object) => Promise<unknown>>} */
    this.handlers = new Map();
    /** @type {Map<string, import("./command-middleware.js").CommandMiddleware[]>} */
    this.middlewareStacks = new Map();
    /** @type {import("./command-middleware.js").CommandMiddleware[]} */
    this.globalMiddleware = [];
  }

  /**
   * @param {import("./command-middleware.js").CommandMiddleware} middleware
   */
  use(middleware) {
    this.globalMiddleware.push(middleware);
    return this;
  }

  /**
   * @param {string} type
   * @param {import("./command-middleware.js").CommandMiddleware[]} middlewares
   */
  useFor(type, middlewares) {
    this.middlewareStacks.set(type, middlewares);
    return this;
  }

  /**
   * @param {string} type
   * @param {(command: object, ctx?: object) => Promise<unknown>} handler
   * @param {{ middleware?: import("./command-middleware.js").CommandMiddleware[] }} [opts]
   */
  register(type, handler, opts = {}) {
    const stack = [
      ...this.globalMiddleware,
      ...(opts.middleware || this.middlewareStacks.get(type) || []),
    ];
    const wrapped =
      stack.length > 0
        ? composeCommandMiddleware(stack, (cmd) => handler(cmd, cmd.metadata?.ctx))
        : (cmd, ctx) => handler(cmd, ctx ?? cmd.metadata?.ctx);

    this.handlers.set(type, wrapped);
  }

  /**
   * @param {{ type: string; payload?: object; metadata?: object }} command
   * @param {object} [ctx]
   */
  async execute(command, ctx = {}) {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`command_handler_missing:${command.type}`);
    }
    const enriched = {
      ...command,
      metadata: { ...(command.metadata || {}), ctx: { ...(command.metadata?.ctx || {}), ...ctx } },
    };
    return handler(enriched, enriched.metadata.ctx);
  }
}

/**
 * @param {string} type
 * @param {object} [payload]
 * @param {object} [metadata]
 */
export function createCommand(type, payload = {}, metadata = {}) {
  return { type, payload, metadata };
}

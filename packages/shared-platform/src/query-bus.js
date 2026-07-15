/**
 * Light query bus — read-side handlers separate from commands.
 */

export class QueryBus {
  constructor() {
    /** @type {Map<string, (query: object) => Promise<unknown>>} */
    this.handlers = new Map();
  }

  /**
   * @param {string} type
   * @param {(query: object) => Promise<unknown>} handler
   */
  register(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * @param {{ type: string; params?: object; metadata?: object }} query
   */
  async execute(query) {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`query_handler_missing:${query.type}`);
    }
    return handler(query);
  }
}

/**
 * @param {string} type
 * @param {object} [params]
 * @param {object} [metadata]
 */
export function createQuery(type, params = {}, metadata = {}) {
  return { type, params, metadata };
}

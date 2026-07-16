import { createInternalClient } from "@dakinis/sdk-auth";

/**
 * Local pub/sub + Internal API publish. Transport (WS/Redis) stays behind this module.
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export function createEventsModule(opts = {}) {
  const client = createInternalClient(opts);
  /** @type {Map<string, Set<(event: object) => void>>} */
  const handlers = new Map();
  /** @type {Map<string, Set<(event: object) => void>>} */
  const onceHandlers = new Map();

  /**
   * @param {string} type
   * @param {(event: object) => void} handler
   */
  function on(type, handler) {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type).add(handler);
    return () => off(type, handler);
  }

  /**
   * @param {string} type
   * @param {(event: object) => void} handler
   */
  function once(type, handler) {
    if (!onceHandlers.has(type)) onceHandlers.set(type, new Set());
    onceHandlers.get(type).add(handler);
    return () => {
      onceHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * @param {string} type
   * @param {(event: object) => void} [handler]
   */
  function off(type, handler) {
    if (!handler) {
      handlers.delete(type);
      onceHandlers.delete(type);
      return;
    }
    handlers.get(type)?.delete(handler);
    onceHandlers.get(type)?.delete(handler);
  }

  /**
   * @param {object} domainEvent
   */
  function emitLocal(domainEvent) {
    const type = domainEvent?.type || domainEvent?.event;
    if (!type) return;
    for (const h of handlers.get(type) || []) h(domainEvent);
    const onceSet = onceHandlers.get(type);
    if (onceSet?.size) {
      for (const h of onceSet) h(domainEvent);
      onceHandlers.delete(type);
    }
  }

  return {
    on,
    once,
    off,

    /**
     * Publish to Internal bus and notify local subscribers.
     * @param {{ event?: string; type?: string; payload: object; source?: string }} body
     */
    async emit(body) {
      const event = body.event || body.type;
      const payload = body.payload ?? body;
      const published = await client.request("/events", {
        method: "POST",
        body: JSON.stringify({
          event,
          payload,
          source: body.source || "sdk",
        }),
      });
      emitLocal({ type: event, event, payload, ...published });
      return published;
    },

    /**
     * Alias for HTTP publish without local emit (server-side fan-out only).
     * @param {{ event: string; payload: object; source?: string }} body
     */
    publish(body) {
      return client.request("/events", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    /** Test / in-process dispatch without HTTP. */
    emitLocal,
  };
}

/**
 * Browser SSE helper for Dakinis Event Center (server → client).
 * Pair with EVENT_TRANSPORT.serverToClient from events.js.
 */

/**
 * @param {string} url
 * @param {{ onEvent?: (data: object, raw: MessageEvent) => void; onError?: (err: Event) => void; withCredentials?: boolean }} [opts]
 * @returns {{ close: () => void; source: EventSource }}
 */
export function subscribeDakinisEvents(url, opts = {}) {
  const source = new EventSource(url, { withCredentials: Boolean(opts.withCredentials) });

  source.onmessage = (ev) => {
    let data = ev.data;
    try {
      data = JSON.parse(ev.data);
    } catch {
      /* keep string */
    }
    opts.onEvent?.(data, ev);
  };

  source.onerror = (err) => {
    opts.onError?.(err);
  };

  return {
    source,
    close() {
      source.close();
    },
  };
}

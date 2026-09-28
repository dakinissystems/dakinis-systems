/**
 * In-process SSE fan-out for Dakinis Event Center (notifications service).
 * Clients: GET /v1/events/stream?userId=…
 * Publishers: POST /v1/events  (also used after /v1/send for in-app channel)
 */

/** @type {Map<string, Set<import('http').ServerResponse>>} */
const userStreams = new Map();

function ensureSet(userId) {
  const key = String(userId);
  if (!userStreams.has(key)) userStreams.set(key, new Set());
  return userStreams.get(key);
}

/**
 * @param {string} userId
 * @param {import('http').ServerResponse} res
 */
export function subscribeUserEvents(userId, res) {
  const set = ensureSet(userId);
  set.add(res);
  return () => {
    set.delete(res);
    if (set.size === 0) userStreams.delete(String(userId));
  };
}

/**
 * @param {string} userId
 * @param {object} event
 */
export function publishUserEvent(userId, event) {
  const set = userStreams.get(String(userId));
  if (!set || !set.size) return 0;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  let n = 0;
  for (const res of set) {
    try {
      res.write(payload);
      n += 1;
    } catch {
      set.delete(res);
    }
  }
  return n;
}

export function eventStreamStats() {
  let connections = 0;
  for (const set of userStreams.values()) connections += set.size;
  return { users: userStreams.size, connections };
}

/** Minimal director session state machine (no external deps). */

export const DIRECTOR_STATES = {
  draft: "draft",
  preparing: "preparing",
  ready: "ready",
  live: "live",
  post: "post",
  completed: "completed",
};

/** @type {Record<string, { on?: Record<string, string> }>} */
export const directorTransitions = {
  [DIRECTOR_STATES.draft]: { on: { PREPARE: DIRECTOR_STATES.preparing } },
  [DIRECTOR_STATES.preparing]: { on: { READY: DIRECTOR_STATES.ready, CANCEL: DIRECTOR_STATES.draft } },
  [DIRECTOR_STATES.ready]: { on: { START: DIRECTOR_STATES.live, CANCEL: DIRECTOR_STATES.draft } },
  [DIRECTOR_STATES.live]: { on: { END: DIRECTOR_STATES.post } },
  [DIRECTOR_STATES.post]: { on: { COMPLETE: DIRECTOR_STATES.completed } },
  [DIRECTOR_STATES.completed]: { on: {} },
};

/**
 * @param {string} current
 * @param {string} event
 */
export function transitionDirectorState(current, event) {
  const next = directorTransitions[current]?.on?.[event];
  if (!next) {
    throw new Error(`invalid_director_transition:${current}:${event}`);
  }
  return next;
}

/**
 * @param {string} status legacy DB value
 */
export function mapLegacyDirectorStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "live") return DIRECTOR_STATES.live;
  if (normalized === "completed" || normalized === "ended") return DIRECTOR_STATES.completed;
  if (normalized === "ready") return DIRECTOR_STATES.ready;
  if (normalized === "preparing") return DIRECTOR_STATES.preparing;
  return DIRECTOR_STATES.draft;
}

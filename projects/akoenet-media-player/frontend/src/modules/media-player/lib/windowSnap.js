/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */

export const WINDOW_MIN = { width: 220, height: 120 };

/** @param {Rect} rect @param {{ width?: number, height?: number }} [min] */
export function clampRect(rect, min = WINDOW_MIN) {
  return {
    ...rect,
    width: Math.max(min.width ?? WINDOW_MIN.width, rect.width),
    height: Math.max(min.height ?? WINDOW_MIN.height, rect.height),
  };
}

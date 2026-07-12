/**
 * @dakinis/window-manager — tipos compartidos (implementación en akoenet-client Fase 1).
 */

/** @typedef {{ x: number; y: number; width: number; height: number }} Rect */

/**
 * @typedef {Object} WindowDescriptor
 * @property {string} id
 * @property {string} title
 * @property {Rect} defaultRect
 * @property {string[]} [snapTo]
 * @property {number} [layer]
 */

/**
 * @typedef {Object} WindowInstance
 * @property {string} id
 * @property {Rect} rect
 * @property {boolean} visible
 * @property {boolean} minimized
 * @property {number} zIndex
 */

export const WINDOW_PRESETS = {
  classic: {
    'player.main': { x: 80, y: 80, width: 275, height: 116 },
    'player.playlist': { x: 80, y: 200, width: 275, height: 232 },
    'player.eq': { x: 360, y: 80, width: 275, height: 116 },
  },
};

export function createWindowManagerState(registry) {
  const windows = new Map();
  for (const desc of registry) {
    windows.set(desc.id, {
      id: desc.id,
      rect: { ...desc.defaultRect },
      visible: true,
      minimized: false,
      zIndex: desc.layer ?? 1,
    });
  }
  return { windows, focusedId: registry[0]?.id ?? null, layoutPreset: 'classic' };
}

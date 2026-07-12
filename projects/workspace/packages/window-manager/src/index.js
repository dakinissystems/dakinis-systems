/**
 * @dakinis/window-manager — shared floating window state (AkoeNet Workspace + Media Player).
 */

export { createWindowManagerState, WINDOW_PRESETS } from '../../../../akoenet-media-player/packages/window-manager/src/index.js'

export function focusWindow(windows, id) {
  const maxZ = Math.max(...windows.map((w) => w.zIndex), 0)
  return windows.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w))
}

export function toggleWindowVisibility(windows, id) {
  return windows.map((w) =>
    w.id === id ? { ...w, visible: !w.visible, minimized: false } : w
  )
}

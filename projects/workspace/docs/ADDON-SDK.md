# Addon SDK — uniform structure

Every Dakinis Workspace addon follows the same layout (Media Player is the reference implementation).

## Folder tree

```
addons/{addon-id}/
├── README.md
└── src/
    ├── index.jsx          # registerAddon(ctx)
    ├── manifest.json      # id, windows, permissions, i18n
    ├── routes/
    ├── windows/
    ├── services/
    ├── hooks/
    ├── components/
    ├── api/
    ├── widgets/           # Hub / dock tiles
    ├── styles/
    └── assets/
```

## Manifest

```json
{
  "id": "media-player",
  "name": "Dakinis Media Player",
  "version": "0.1.0",
  "icon": "music",
  "category": "media",
  "phase": "mvp",
  "permissions": ["storage", "notifications"],
  "windows": ["player", "playlist", "equalizer", "library"],
  "i18n": {
    "name": { "en": "Media Player", "es": "Reproductor multimedia" },
    "description": { "en": "...", "es": "..." }
  }
}
```

## Registration (future)

```javascript
import { registerAddon } from '@dakinis/addon-sdk';
import manifest from './manifest.json';

export function setup(ctx) {
  registerAddon(ctx, {
    manifest,
    windows: { /* windowId → component */ },
    widgets: { /* widgetId → component */ },
    routes: { /* optional deep links */ },
  });
}
```

## Window Manager

All floating UI uses `@dakinis/window-manager`:

- `FloatingWindow`, `WindowProvider`, `WindowRegistry`
- `useWindow`, `useDock`, `useWorkspace`, `useSnap`
- Shared with AkoeNet Media Player → [`../../akoenet-media-player/packages/window-manager/`](../../akoenet-media-player/packages/window-manager/)

## Widgets

Addons export widgets listed in [`../catalog/widgets.json`](../catalog/widgets.json). The Hub and desktop shell embed them without loading the full addon.

## i18n

Every user-facing string in `manifest.i18n` must include **en** and **es**. UI copies live in addon locales or `@dakinis/shared-brand` when shared across products.

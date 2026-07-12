# Addon SDK — contract and structure

Every Dakinis Workspace addon implements the strict **`WorkspaceAddon`** contract. Media Player is the Hello World reference — the product is Runtime + capabilities.

Kernel → [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

---

## Folder tree

```
addons/{addon-id}/
├── README.md
└── src/
    ├── index.jsx              # exports lifecycle + registerAddon
    ├── manifest.json
    ├── lifecycle.js           # onStart, onStop, …
    ├── routes/
    ├── windows/
    ├── widgets/
    ├── commands/              # Command Palette registrations
    ├── settings/              # optional settings schema
    └── …
```

---

## WorkspaceAddon contract

```typescript
interface WorkspaceAddon {
  id: string
  version: string
  tier: AddonTier
  permissions: PlatformService[]     // Platform Services — NOT capabilities
  capabilities: CapabilityRef[]      // { id: 'window-manager', version: '1' }
  widgets: Record<string, WidgetDef>
  commands: CommandDef[]               // → Command Palette capability
  windows: Record<string, WindowDef>
  routes: RouteDef[]
  settings?: SettingsSchema
  lifecycle: AddonLifecycle
  dependencies?: {
    required?: string[]
    optional?: string[]
    conflicts?: string[]
  }
}
```

Implementation: [`packages/addon-sdk/src/workspace-addon.contract.js`](../packages/addon-sdk/src/workspace-addon.contract.js)

Runtime calls `assertWorkspaceAddon(spec)` on register — invalid addons fail at boot.

---

## Manifest (JSON)

```json
{
  "id": "media-player",
  "version": "0.1.0",
  "tier": "media",
  "category": "media",
  "phase": "mvp",
  "admission": ["improves-akoenet", "reusable", "sellable"],
  "permissions": ["auth", "storage", "notifications"],
  "capabilities": [
    { "id": "window-manager", "version": "1" },
    { "id": "widget-framework", "version": "1" }
  ],
  "dependencies": {
    "required": [],
    "optional": ["soundboard"],
    "conflicts": []
  },
  "windows": ["player", "playlist", "library"],
  "i18n": {
    "name": { "en": "Media Player", "es": "Reproductor multimedia" },
    "description": { "en": "Hello World of Dakinis Desktop.", "es": "Hello World de Dakinis Desktop." }
  }
}
```

| Field | Layer |
|-------|-------|
| `permissions` | Platform Services |
| `capabilities` | Desktop capabilities (versioned) |
| `dependencies` | Other addons |

---

## Lifecycle hooks

| Hook | When |
|------|------|
| `onInstall()` | First install in workspace |
| `onEnable()` | Hub admin enables addon |
| `onDisable()` | Hub admin disables addon |
| `onStart(ctx)` | Runtime loads addon for session |
| `onStop(ctx)` | Runtime unloads addon |
| `onWorkspaceLoaded(ctx)` | After layout restore |
| `onWorkspaceClosed(ctx)` | Before shutdown — persist state |

```javascript
import { registerAddon } from '@dakinis/addon-sdk';
import manifest from './manifest.json';
import PlayerWindow from './windows/PlayerWindow.jsx';
import { NowPlayingTile } from './widgets/NowPlaying.jsx';

export const lifecycle = {
  onStart(ctx) {
    ctx.windows.register('player', PlayerWindow);
    ctx.widgets.register('media.now-playing', NowPlayingTile);
    ctx.commands.register({
      id: 'media.open',
      title: { en: 'Open Media Player', es: 'Abrir Media Player' },
      run: () => ctx.windows.open('player'),
    });
    ctx.events.on('workspace.loaded', () => ctx.windows.open('player'));
  },
  onStop(ctx) {
    ctx.events.offAll();
  },
};

export function setup(ctx) {
  return registerAddon(ctx, {
    ...manifest,
    widgets: {},
    commands: [],
    windows: {},
    routes: [],
    lifecycle,
  });
}
```

---

## Event Bus (via RuntimeContext)

Addons do **not** import each other. Use `ctx.events`:

```javascript
ctx.events.emit('media.play', { trackId, title });
ctx.events.on('theme.changed', ({ themeId }) => refresh());
```

Catalog → [`../catalog/event-bus.json`](../catalog/event-bus.json)

---

## Platform Services vs Capabilities

| Declared in | Examples |
|-------------|----------|
| `permissions[]` | auth, storage, ai, notifications |
| `capabilities[]` | window-manager@v1, widget-framework@v1 |

Terminal example:

```json
"permissions": ["auth", "storage", "ai", "notifications"],
"capabilities": [
  { "id": "window-manager", "version": "1" },
  { "id": "command-palette", "version": "1" }
]
```

---

## Command Palette vs Command Center

- Register commands via `ctx.commands` → **Command Palette** capability
- Core addon **Command Center** aggregates commands from all addons

---

## Dependencies

```json
"dependencies": {
  "required": ["stream-deck"],
  "optional": ["media-player", "soundboard"],
  "conflicts": []
}
```

Runtime blocks enable if `required` missing or `conflicts` active.

Matrix → [`../catalog/addon-dependencies.json`](../catalog/addon-dependencies.json)

---

## Window Manager

All floating UI uses `@dakinis/window-manager@v1`:

- `FloatingWindow`, `WindowProvider`, `WindowRegistry`
- Shared with AkoeNet Media Player

---

## Widgets

Export widgets for surfaces: `hub` · `workspace` · `akoenet` · `core` · `dashboard`

→ [`../catalog/widgets.json`](../catalog/widgets.json)

---

## i18n

Every `manifest.i18n` string: **en** + **es**.

---

## Scaffold

```powershell
node projects/workspace/scripts/scaffold-addons.mjs
```

---

## Related

- [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)
- [`CAPABILITIES.md`](./CAPABILITIES.md)

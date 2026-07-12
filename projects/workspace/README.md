# Dakinis Workspace

> Modular desktop inside the Dakinis ecosystem — **capabilities first**, native addons, not Discord-style plugins.

Each addon is assembled from **capabilities** and orchestrated by the **Desktop Runtime** (kernel).

See [`docs/DESKTOP-RUNTIME.md`](./docs/DESKTOP-RUNTIME.md) · [`docs/CAPABILITIES.md`](./docs/CAPABILITIES.md)

---

## Stack

```
Platform Services (Auth · AI · Storage · Billing · Events · Metrics…)
        │
        ▼
Capabilities (Window Manager · Addon SDK · Widget Framework · Command Palette · Marketplace)
        │
        ▼
Desktop Runtime (lifecycle · event bus · permissions · layouts)
        │
        ▼
Addons (26) → Widgets (cross-product)
```

| Path | Role |
|------|------|
| [`catalog/workspace-addons.json`](./catalog/workspace-addons.json) | 26 addons, tiers, admission rules |
| [`catalog/addon-dependencies.json`](./catalog/addon-dependencies.json) | Platform + capabilities + required/optional/conflicts |
| [`catalog/capability-versions.json`](./catalog/capability-versions.json) | Capability versioning |
| [`catalog/event-bus.json`](./catalog/event-bus.json) | Runtime events |
| [`catalog/desktop-layouts.json`](./catalog/desktop-layouts.json) | Presets + saved profiles |
| [`catalog/marketplace-types.json`](./catalog/marketplace-types.json) | 12 Marketplace distribution types |
| [`catalog/widgets.json`](./catalog/widgets.json) | Cross-surface widgets |
| [`addons/`](./addons/) | One folder per addon (uniform structure) |
| [`desktop/`](./desktop/) | Launcher, dock, command palette, layout engine |
| [`packages/`](./packages/) | `desktop-runtime`, `window-manager`, `addon-sdk`, `widgets` |
| [`services/`](./services/) | `desktop-api`, sync, storage, plugins |
| [`docs/DESKTOP-RUNTIME.md`](./docs/DESKTOP-RUNTIME.md) | **Kernel** — lifecycle, event bus, permissions |
| [`docs/CAPABILITIES.md`](./docs/CAPABILITIES.md) | Platform Services vs Capabilities |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Layer diagram |
| [`docs/ADDON-SDK.md`](./docs/ADDON-SDK.md) | WorkspaceAddon contract |

## Tiers (26 addons)

| Tier | Count | Addons |
|------|-------|--------|
| **Core** (always on) | 5 | command-palette, activity-center, dashboard, marketplace, **settings** |
| **Productivity** | 7 | calendar, notes, whiteboard, kanban, live-dashboard, ai-workspace, **ai-actions** |
| **Developer** | 5 | terminal, devops, code-editor, automation-builder, **monitor** |
| **Stream** | 3 | stream-deck, obs-companion, clip-studio |
| **Media** | 1 | media-player |
| **Entertainment** | 2 | soundboard, game-launcher |
| **System** | 3 | file-explorer, theme-studio, downloads |

## Scaffold

```powershell
node projects/workspace/scripts/scaffold-addons.mjs
node scripts/sync-workspace-addons-catalog.mjs
```

## SQL / provisioning

| Script | Purpose |
|--------|---------|
| [`docs/supabase/migrations/035_...`](../../docs/supabase/migrations/035_dakinis_workspace_addons.sql) | Catalog + installs tables |
| [`docs/supabase/migrations/036_...`](../../docs/supabase/migrations/036_dakinis_workspace_capabilities.sql) | Tiers, 3 new addons, layout profiles |
| [`docs/supabase/scripts/provision_workspace_addons_christiandvillar.sql`](../../docs/supabase/scripts/provision_workspace_addons_christiandvillar.sql) | Enable all addons (platform admin) |

## Related

- Product doc → [`../../docs/DAKINIS-WORKSPACE.md`](../../docs/DAKINIS-WORKSPACE.md)
- Media Player MVP → [`../media-player/`](../media-player/)
- Hub workspace → [`../../docs/HUB-WORKSPACE.md`](../../docs/HUB-WORKSPACE.md)

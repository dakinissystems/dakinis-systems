# Dakinis Workspace

> Modular desktop inside the Dakinis ecosystem — native addons, not Discord-style plugins.

Each addon is a small app: same SDK, same window manager, install/update/uninstall via Marketplace.

---

## Stack

```
Dakinis Platform (Auth · AI · Billing · Notifications · Storage · Knowledge · Events · Search · Marketplace)
        │
        ▼
Dakinis Workspace (desktop shell + window manager + addon SDK)
        │
   ┌────┴────┬──────────────┐
 System   Productivity   Entertainment / Stream / Developer
```

| Path | Role |
|------|------|
| [`catalog/workspace-addons.json`](./catalog/workspace-addons.json) | Master catalog (EN/ES) |
| [`catalog/widgets.json`](./catalog/widgets.json) | Cross-addon widgets for Hub/Desktop |
| [`addons/`](./addons/) | One folder per addon (uniform structure) |
| [`desktop/`](./desktop/) | Launcher, dock, command palette, activity center |
| [`packages/`](./packages/) | `window-manager`, `addon-sdk`, `ui`, `widgets` |
| [`services/`](./services/) | `desktop-api`, sync, storage, plugins |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Full architecture |
| [`docs/ADDON-SDK.md`](./docs/ADDON-SDK.md) | Addon contract |

## Addons (catalog)

| # | ID | EN | ES | Phase |
|---|-----|----|----|-------|
| — | command-palette | Command Center | Centro de comandos | mvp |
| — | activity-center | Activity Center | Centro de actividad | mvp |
| 1 | terminal | Dakinis Terminal | Terminal Dakinis | growth |
| 2 | ai-workspace | AI Workspace | Espacio de IA | mvp |
| 3 | whiteboard | Whiteboard | Pizarra colaborativa | growth |
| 4 | kanban | Kanban | Kanban | growth |
| 5 | calendar | Calendar | Calendario | growth |
| 6 | notes | Notes | Notas | growth |
| 7 | code-editor | Code Editor | Editor de código | growth |
| 8 | dashboard | Dashboard | Panel | mvp |
| 9 | stream-deck | Stream Deck | Stream Deck virtual | growth |
| 10 | soundboard | Soundboard | Soundboard | growth |
| 11 | game-launcher | Game Launcher | Lanzador de juegos | future |
| 12 | clip-studio | Clip Studio | Clip Studio | future |
| 13 | marketplace | Marketplace | Marketplace | growth |
| 14 | theme-studio | Theme Studio | Theme Studio | growth |
| 15 | media-player | Media Player | Reproductor multimedia | mvp |
| 16 | downloads | Downloads | Descargas | future |
| 17 | file-explorer | File Explorer | Explorador de archivos | growth |
| 18 | devops | DevOps | DevOps | growth |
| 19 | obs-companion | OBS Companion | OBS Companion | growth |
| 20 | automation-builder | Automation Builder | Automation Builder | growth |
| — | live-dashboard | Live Dashboard | Panel en vivo | future |

## Scaffold

```powershell
node projects/workspace/scripts/scaffold-addons.mjs
```

## SQL / provisioning

| Script | Purpose |
|--------|---------|
| [`docs/supabase/migrations/035_dakinis_workspace_addons.sql`](../../docs/supabase/migrations/035_dakinis_workspace_addons.sql) | Catalog + installs tables |
| [`docs/supabase/scripts/provision_workspace_addons_christiandvillar.sql`](../../docs/supabase/scripts/provision_workspace_addons_christiandvillar.sql) | Enable all addons (platform admin) |
| [`docs/supabase/scripts/provision_akoenet_assistant_christiandvillar.sql`](../../docs/supabase/scripts/provision_akoenet_assistant_christiandvillar.sql) | Enable all AkoeNet Assistant modules |

## Related

- Media Player MVP → [`../media-player/`](../media-player/) · live in `apps/akoenet/Client/src/modules/media-player/`
- AkoeNet Assistant modules → [`../../docs/AKOENET-ASSISTANT.md`](../../docs/AKOENET-ASSISTANT.md)
- Hub workspace → [`../../docs/HUB-WORKSPACE.md`](../../docs/HUB-WORKSPACE.md)

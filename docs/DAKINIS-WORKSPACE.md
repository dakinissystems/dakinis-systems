# Dakinis Workspace

> **Julio 2026** — Escritorio modular: addons nativos, no plugins estilo Discord.  
> Scaffold → [`projects/workspace/`](../projects/workspace/) · Hub → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) · SQL → [`supabase/migrations/035_dakinis_workspace_addons.sql`](./supabase/migrations/035_dakinis_workspace_addons.sql)

---

## Visión

**Dakinis Desktop** agrupa mini-aplicaciones (Terminal, AI Workspace, Media Player, Kanban…) bajo la misma arquitectura:

- **Platform** — Auth, AI, Billing, Notifications, Storage, Knowledge, Events, Search, Marketplace
- **Workspace shell** — launcher, dock, command palette (`Ctrl+K`), activity center
- **Addons** — instalables, actualizables, desinstalables sin romper el resto
- **Widgets** — cada addon expone tiles al Hub y al escritorio

Media Player en AkoeNet es el **primer addon en producción** (`apps/akoenet/Client/src/modules/media-player/`).

## Catálogo (23 addons)

| Categoría | Addons |
|-----------|--------|
| **Sistema** | command-palette, activity-center, dashboard, marketplace, theme-studio, file-explorer, downloads |
| **Productividad** | ai-workspace, whiteboard, kanban, calendar, notes, live-dashboard |
| **Desarrollo** | terminal, code-editor, devops, automation-builder |
| **Streaming** | stream-deck, obs-companion, clip-studio |
| **Media** | media-player |
| **Entretenimiento** | soundboard, game-launcher |

Textos **EN + ES** en [`projects/workspace/catalog/workspace-addons.json`](../projects/workspace/catalog/workspace-addons.json) y `@dakinis/shared-brand/workspace-addons`.

## Estructura de repo

```
projects/workspace/
├── desktop/          # Shell (launcher, dock, command-palette…)
├── addons/           # 23 carpetas uniformes (manifest + src/)
├── packages/         # window-manager, addon-sdk, ui, widgets
├── services/         # desktop-api, sync, storage
├── catalog/          # workspace-addons.json, widgets.json
└── docs/             # ARCHITECTURE.md, ADDON-SDK.md
```

Regenerar árbol de addons:

```powershell
node projects/workspace/scripts/scaffold-addons.mjs
```

## Base de datos

| Tabla | Uso |
|-------|-----|
| `meta.workspace_addons` | Catálogo global |
| `meta.workspace_addon_installs` | ON/OFF por workspace Hub |

## Activar perfil platform admin (christiandvillar)

En Supabase SQL Editor, **en orden**:

1. [`035_dakinis_workspace_addons.sql`](./supabase/migrations/035_dakinis_workspace_addons.sql)
2. [`scripts/provision_workspace_addons_christiandvillar.sql`](./supabase/scripts/provision_workspace_addons_christiandvillar.sql) — todos los addons en workspace `dakinis-platform`
3. [`scripts/provision_akoenet_assistant_christiandvillar.sql`](./supabase/scripts/provision_akoenet_assistant_christiandvillar.sql) — todos los módulos Assistant en servidores AkoeNet (email o Twitch `christiandvillar`)

El script AkoeNet también vincula `twitch_username = 'christiandvillar'` al perfil si falta.

## Exclusivos Dakinis

1. **Command Center** — `Ctrl+K` cross-product
2. **Activity Center** — notificaciones, streams, deploys, facturas
3. **Live Dashboard** — reunión con voz + notas + resumen IA
4. **Widgets** compartidos entre Hub, AkoeNet y StreamAutomator

## Evitar

Navegador completo, cliente de correo, editor de imágenes pro, Word/Excel, torrents — no refuerzan la identidad de AkoeNet/Dakinis.

## Relacionado

- AkoeNet Assistant (módulos servidor) → [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md)
- Media Player → [`projects/media-player/`](../projects/media-player/)
- Window Manager → [`projects/akoenet-media-player/packages/window-manager/`](../projects/akoenet-media-player/packages/window-manager/)

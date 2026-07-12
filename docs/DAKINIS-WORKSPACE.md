# Dakinis Workspace

> **Julio 2026** — Plataforma con SO propio: **Platform Services → Capabilities → Desktop Runtime → Addons → Widgets**  
> Kernel → [`projects/workspace/docs/DESKTOP-RUNTIME.md`](../projects/workspace/docs/DESKTOP-RUNTIME.md)

---

## Visión

Dakinis Desktop es un **framework**, no un listado de apps.

```
Platform Services    Auth · AI · Storage · Billing · Events · Metrics…
        ↓
Capabilities         Window Manager · Addon SDK · Widgets · Command Palette · Marketplace
        ↓
Desktop Runtime      lifecycle · event bus · permisos · layouts
        ↓
Addons (26)          mini-apps ensambladas
        ↓
Widgets              tiles en Hub · Workspace · AkoeNet · Core
```

**Media Player** = Hello World. El producto real: Runtime + Window Manager + SDK + Marketplace + Widget Framework.

---

## Platform Services ≠ Capabilities

| Capa | Qué es | Ejemplo |
|------|--------|---------|
| **Platform Service** | Backend compartido | `auth`, `storage`, `ai` |
| **Capability** | API de escritorio versionada | `window-manager@v1` |
| **Addon** | App instalable | Media Player, Terminal |

Terminal usa Platform `auth` + Capability `window-manager` — conceptos distintos.

---

## Desktop Runtime (kernel)

Orquesta el escritorio:

- Carga capabilities versionadas
- Registra addons (contrato `WorkspaceAddon`)
- **Event Bus** — `media.play`, `layout.changed`, `stream.started`, `voice.connected`…
- **Lifecycle** — `onInstall` → `onStart` → `onWorkspaceLoaded` → `onStop`
- Restaura layouts (Gaming, Developer, Office…)
- Permission Gate para Platform Services

Doc completa → [`DESKTOP-RUNTIME.md`](../projects/workspace/docs/DESKTOP-RUNTIME.md)

---

## Capabilities (5)

| Capability | Core addon (si aplica) |
|------------|------------------------|
| Window Manager | — |
| Addon SDK | — |
| Widget Framework | — |
| **Command Palette** | **Command Center** (`command-palette`) |
| Marketplace | Marketplace addon |

**Naming:** Command Palette = capability. Command Center = addon Core.

Versiones → [`catalog/capability-versions.json`](../projects/workspace/catalog/capability-versions.json)

---

## Contrato WorkspaceAddon

```typescript
interface WorkspaceAddon {
  id, version, tier
  permissions      // Platform Services
  capabilities     // { id, version }
  widgets, commands, windows, routes, settings
  lifecycle        // onInstall … onWorkspaceClosed
  dependencies     // required · optional · conflicts
}
```

→ [`ADDON-SDK.md`](../projects/workspace/docs/ADDON-SDK.md)

---

## Tiers (26 addons)

| Tier | Addons |
|------|--------|
| **Core** | Command Center, Activity Center, Dashboard, Marketplace, Settings |
| **Productivity** | Calendar, Notes, Kanban, AI Workspace, AI Actions… |
| **Developer** | Terminal, DevOps, Monitor, Code, Automation |
| **Stream / Media / Entertainment** | OBS, Stream Deck, Media Player, Soundboard… |
| **System** | File Explorer, Theme Studio, Downloads |

---

## Dependencias entre addons

| Tipo | Ejemplo |
|------|---------|
| `required` | OBS Companion → Stream Deck |
| `optional` | OBS → Media Player, Soundboard |
| `conflicts` | (reservado) |

→ [`catalog/addon-dependencies.json`](../projects/workspace/catalog/addon-dependencies.json)

---

## Marketplace

Addons · skins · widgets · themes · layouts · AI prompts · automation packs · sound packs

→ [`catalog/marketplace-types.json`](../projects/workspace/catalog/marketplace-types.json)

---

## Layouts y persistencia

Presets Gaming / Streaming / Developer / Office + perfiles Morning / Coding / Music

→ [`catalog/desktop-layouts.json`](../projects/workspace/catalog/desktop-layouts.json)

---

## Catálogos

| Archivo | Contenido |
|---------|-----------|
| `workspace-addons.json` | 26 addons, tiers, admission |
| `addon-dependencies.json` | Platform + capabilities + required/optional/conflicts |
| `capability-versions.json` | window-manager@v1… |
| `event-bus.json` | Eventos del Runtime |
| `desktop-layouts.json` | Presets + perfiles |
| `widgets.json` | Surfaces cross-product |

---

## Estado (jul 2026)

| Componente | Estado |
|------------|--------|
| DESKTOP-RUNTIME.md + contrato SDK | ✅ |
| Event bus + capability versioning | ✅ catálogo |
| Media Player Hello World | 🚧 AkoeNet live |
| `@dakinis/desktop-runtime` código | 📅 |
| SQL 036 | 🚧 |

---

## Relacionado

- [`CAPABILITIES.md`](../projects/workspace/docs/CAPABILITIES.md)
- [`ARCHITECTURE.md`](../projects/workspace/docs/ARCHITECTURE.md)
- SQL → [`035`](./supabase/migrations/035_dakinis_workspace_addons.sql) · [`036`](./supabase/migrations/036_dakinis_workspace_capabilities.sql)

# Dakinis Desktop — Capabilities

> **Julio 2026** — Cinco capabilities reutilizables. Los addons las ensamblan; el **Desktop Runtime** las orquesta.  
> Kernel → [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

---

## Modelo mental

```
Platform Services     ← Auth, AI, Storage, Billing… (backend compartido)
        ↓
Capabilities          ← Window Manager, Widget Framework… (APIs de escritorio)
        ↓
Desktop Runtime       ← kernel: lifecycle, event bus, permisos, layouts
        ↓
Addons                ← Terminal, Media Player, Settings…
        ↓
Widgets               ← tiles cross-product
```

**Un Platform Service ≠ una Capability.**  
**Una Capability ≠ un Addon.**

| Concepto | Ejemplo |
|----------|---------|
| Platform Service | `auth`, `storage`, `ai` |
| Capability | `window-manager@v1` |
| Core addon | **Command Center** implementa capability **Command Palette** |
| Optional addon | Media Player — Hello World del ecosistema |

---

## Platform Services

Servicios de Dakinis Platform — los addons los solicitan en `permissions[]`:

| Service | Rol |
|---------|-----|
| Auth | Identidad, sesión |
| AI | Modelos, prompts |
| Storage | Archivos workspace |
| Billing | Suscripciones |
| Search | Búsqueda global |
| Knowledge | RAG |
| Events | Redis / dominio |
| Notifications | Alertas |
| Metrics | Railway, CPU, Supabase |

Lista completa → [`catalog/addon-dependencies.json`](../catalog/addon-dependencies.json) · `platformServices`

---

## Las cinco capabilities

Versionadas — [`catalog/capability-versions.json`](../catalog/capability-versions.json)

### 1. Window Manager (`@dakinis/window-manager` v1)

Ventanas flotantes, snap, z-index, layouts, persistencia.

Media Player demuestra que funciona. **No es el producto** — es la capability base.

### 2. Addon SDK (`@dakinis/addon-sdk` v1)

Contrato estricto `WorkspaceAddon` + lifecycle hooks.

→ [`ADDON-SDK.md`](./ADDON-SDK.md) · [`packages/addon-sdk/src/workspace-addon.contract.js`](../packages/addon-sdk/src/workspace-addon.contract.js)

### 3. Widget Framework (`@dakinis/widgets` v1)

Tiles en Hub, Workspace, AkoeNet, Core, Dashboard sin abrir el addon.

→ [`catalog/widgets.json`](../catalog/widgets.json)

### 4. Command Palette (`@dakinis/command-palette` v1)

**Capability:** acciones globales `Ctrl+K`.  
**Core addon:** **Command Center** (`id: command-palette`).

Usar **Command Palette** para la capability y **Command Center** para el addon en toda la documentación.

### 5. Marketplace (`@dakinis/marketplace` v1)

Distribución: addons, skins, themes, layouts, prompts, packs.

→ [`catalog/marketplace-types.json`](../catalog/marketplace-types.json)

---

## Desktop Runtime

Capa entre capabilities y addons — el «kernel»:

- Carga capabilities versionadas
- Registra addons (contrato + admission + dependencias)
- Event Bus in-process
- Permission Gate (Platform Services)
- Layout Engine (presets + perfiles)

Doc completa → [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md)

---

## Jerarquía de addons (tiers)

| Tier | Core addons / ejemplos |
|------|------------------------|
| **Core** | Command Center, Activity Center, Dashboard, Marketplace, Settings |
| **Productivity** | Calendar, Notes, Kanban, AI Workspace, AI Actions |
| **Developer** | Terminal, DevOps, Monitor, Code Editor, Automation |
| **Stream / Media / Entertainment** | Stream Deck, OBS, Media Player, Soundboard… |
| **System** | File Explorer, Theme Studio, Downloads |

→ [`catalog/workspace-addons.json`](../catalog/workspace-addons.json)

---

## Dependencias entre addons

Además de Platform + Capabilities:

| Tipo | Comportamiento |
|------|----------------|
| `required` | No activar sin dependencia |
| `optional` | Features extra si está presente |
| `conflicts` | Mutuamente excluyentes |

Ejemplo: **OBS Companion** → `required: [stream-deck]`, `optional: [media-player, soundboard]`

---

## Regla de admisión

Todo addon nuevo debe cumplir **al menos una**: mejora AkoeNet · mejora producto · vendible · reutilizable.

---

## Relacionado

- [`DESKTOP-RUNTIME.md`](./DESKTOP-RUNTIME.md) — kernel
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — capas
- [`../../../docs/DAKINIS-WORKSPACE.md`](../../../docs/DAKINIS-WORKSPACE.md) — producto

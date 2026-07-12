# Dakinis Window Manager (DWM)

Gestor de ventanas flotantes reutilizable para **Media Player**, CRM, Terminal, Copilot, etc.

Inspiración: Winamp snap + MDI ligero, implementado en React (portal + drag).

---

## API (conceptual)

```typescript
interface WindowDescriptor {
  id: string;           // ej. "player.playlist"
  title: string;
  defaultRect: Rect;   // x, y, w, h (px o % del viewport)
  minSize?: Size;
  snapTo?: string[];   // ids de ventanas hermanas
  layer?: number;
  component: React.ComponentType;
  skinRegion?: keyof SkinManifest["windows"];
}

interface WindowManagerState {
  windows: Map<string, WindowInstance>;
  focusedId: string | null;
  layoutPreset: "classic" | "minimal" | "free";
}
```

## Comportamientos

| Feature | Descripción |
|---------|-------------|
| Drag | Barra de título; límites al viewport |
| Snap | Playlist debajo del main player (classic layout) |
| Dock | Modo compacto: solo `player.mini` |
| Z-order | Click trae al frente |
| Persist | `localStorage` + sync opcional a cuenta Dakinis |
| Skin | `SkinRenderer` lee manifest y posiciona sprites |

## Layout preset “Classic”

```
┌─────────────────────────┐
│      Main Player        │
├─────────────────────────┤
│      Playlist           │  ← snap vertical
└─────────────────────────┘
     ┌──────────┐
     │    EQ    │          ← snap horizontal al main
     └──────────┘
```

## Paquete

Implementación mínima en `packages/window-manager/` (types + hook `useWindowManager`).

Integración en AkoeNet:

```jsx
import { WindowManagerProvider } from '@dakinis/window-manager'
import { mediaPlayerWindows } from './windows/registry'

<WindowManagerProvider registry={mediaPlayerWindows}>
  <MediaPlayerRoot />
</WindowManagerProvider>
```

## Fases

1. **MVP:** drag + focus + persist local.
2. **Snap** clásico Winamp.
3. **Multi-app:** misma API para otros módulos Dakinis (“modo escritorio”).

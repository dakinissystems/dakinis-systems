# Dakinis Window Manager (DWM)

> Gestor de ventanas flotantes reutilizable — el Media Player es la **primera app**; luego CRM, terminal, calendario, etc.

---

## Concepto

Patrón distinto al SaaS “sidebar + content”:

```
Desktop (capa z-index)
├── Main Player      (320×116, snap)
├── Playlist         (275×232)
├── Equalizer        (275×116)
├── Library          (400×300)
├── Visualizer       (256×128)
├── Lyrics           (300×200)
└── Mini Player      (dock / always on top)
```

Cada ventana:

- Arrastrable (`pointer-events`, titlebar hit area).
- Minimizable / cerrable / “shade” (modo compacto estilo Winamp).
- Acoplable (snap edges entre ventanas del mismo grupo).
- Persistencia de posición en `localStorage` / `media.player.layout.v1`.

---

## Paquete propuesto

```
packages/dakinis-window-manager/
├── src/
│   ├── WindowManager.jsx      # Provider + registry
│   ├── FloatingWindow.jsx     # Shell chrome (titlebar, resize)
│   ├── WindowDock.jsx         # Snap / attach logic
│   ├── useWindowLayout.js
│   └── types.ts
├── package.json
└── README.md
```

**Consumidores:**

- `akoenet-client` → Media Player
- `hub` (futuro) → widgets flotantes
- `core` (futuro) → POS compact mode

---

## API del manager

```jsx
<WindowManager group="media-player" persistKey="akoenet.media.layout">
  <FloatingWindow id="main" title="Dakinis Player" defaultBounds={{ x: 80, y: 80, w: 320, h: 116 }}>
    <MainWindow />
  </FloatingWindow>
  <FloatingWindow id="playlist" title="Playlist" defaultBounds={{ x: 80, y: 220, w: 275, h: 232 }}>
    <PlaylistWindow />
  </FloatingWindow>
</WindowManager>
```

Hooks:

```js
const { open, close, toggle, focus, bounds } = useWindow('playlist')
const { snapTogether, detach } = useWindowDock('main', 'playlist')
```

---

## SkinRenderer

`SkinRenderer` lee manifest de skin y mapea:

| Región manifest | Componente |
|-----------------|------------|
| `windows.player` | sprites + hit zones |
| `windows.playlist` | lista scroll |
| `fonts.main` | tipografía LED |
| `colors.text` | CSS variables `--dmp-text` |

Modo **fallback**: tema CSS “Dakinis Neon” sin sprites.

---

## Modo compacto / mini player

- **Shade:** colapsa ventana principal a barra de título + transport.
- **Mini:** ventana 160×48, always-on-top (permiso Tauri/Electron).
- **Dock AkoeNet:** icono en sidebar con tooltip “Now playing”.

---

## Accesibilidad

- Focus trap opcional por ventana modal.
- Atajos globales (`Space`, `Ctrl+→`, `Ctrl+L`) registrados en `usePlayerHotkeys`.
- `prefers-reduced-motion` desactiva visualizer pesado.

---

## Roadmap DWM

| Fase | Entrega |
|------|---------|
| M1 | FloatingWindow + drag + persist |
| M2 | Snap + shade + z-order |
| M3 | Extraer a `@dakinis/window-manager` |
| M4 | Hub / Core pilots |

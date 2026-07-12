# Sistema de skins

Formato: carpeta con `manifest.json` + assets (PNG/WebP, fuentes opcionales, sonidos UI).

Extensión empaquetada: `.dskin` (zip).

---

## manifest.json

```json
{
  "id": "classic",
  "name": "Classic",
  "version": "1.0.0",
  "author": "Dakinis",
  "minPlayerVersion": "0.1.0",
  "windows": {
    "player": { "background": "player.png", "width": 275, "height": 116 },
    "playlist": { "background": "playlist.png", "width": 275, "height": 232 },
    "eq": { "background": "eq.png", "width": 275, "height": 116 }
  },
  "colors": {
    "text": "#00ff00",
    "textDim": "#008800",
    "background": "#181818",
    "accent": "#2dd4bf"
  },
  "fonts": {
    "ui": "Arial",
    "lcd": "optional-lcd.woff2"
  },
  "sounds": {
    "click": "click.wav"
  },
  "sprites": {
    "buttons": { "sheet": "buttons.png", "play": [0, 0, 23, 18] }
  }
}
```

## Skins incluidas (scaffold)

| Carpeta | Estilo |
|---------|--------|
| `skins/classic/` | Verde Winamp-like |
| (futuro) `neon/` | Cyberpunk |
| (futuro) `dakinis/` | Brand tokens Nexora |

## Renderer

`SkinRenderer.jsx` lee manifest y:

1. Aplica `background` por ventana.
2. Posiciona controles según mapa en manifest (fase 2) o layout CSS fijo (MVP).
3. Intercambia spritesheet en botones.

## Marketplace

- Listing: slug, preview PNG, autor, precio (0 = gratis).
- Instalación: descarga zip → validar manifest → `skins/` en IndexedDB o CDN user scope.

# Sistema de skins

> Inspirado en Winamp, formato propio **`.dskin`** (zip) — no usar assets ni marca Winamp.

---

## Estructura de un skin

```
classic.dskin (zip)
├── manifest.json
├── assets/
│   ├── player.png          # sprite sheet o 9-slice
│   ├── playlist.png
│   ├── eq.png
│   ├── buttons.png         # sprite map en manifest
│   └── background.webp
├── fonts/
│   └── led.ttf
└── sounds/                 # opcional UI clicks
    └── click.wav
```

---

## manifest.json

Ver [../examples/skin-classic/manifest.json](../examples/skin-classic/manifest.json).

Campos clave:

| Campo | Descripción |
|-------|-------------|
| `id` | slug único (`dakinis/classic`) |
| `version` | semver |
| `windows.*` | assets por ventana |
| `sprites.buttons` | mapa `{ play: {x,y,w,h}, ... }` |
| `colors` | tokens CSS |
| `metrics.titlebarHeight` | hit area drag |

---

## Runtime

1. Usuario elige skin en Settings o Marketplace.
2. Client descarga `.dskin` → cache IndexedDB.
3. `SkinRenderer` aplica CSS variables + background-image regions.
4. Fallback a tema **Dakinis** si asset falla.

---

## Marketplace

Skins publicadas como addon type `media-skin`:

- Gratis / de pago (Billing futuro).
- Verificación manual o firma Dakinis para skins oficiales.
- Community skins: badge “Community” + sandbox CSS (no JS en skins v1).

---

## Compatibilidad .wsz

**No objetivo v1.** Conversor offline opcional en fase “nostalgia” — solo si legalmente claro.

---

## Temas Dakinis DES

Skins oficiales alineadas con `@dakinis/design`:

- `Dakinis` — accent violeta / dark
- `Neon` — cyan + grid
- `Minimal Dark` — flat, sin sprites
- `Classic` — LED verde sobre gris (homage, no clone)

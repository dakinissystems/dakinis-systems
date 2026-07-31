# Dakinis Experience System (DES) v1.1

**Plataforma de experiencia** — capas, no un God Package.

> **RFC canónico:** [`docs/DESIGN-SYSTEM.md`](../../docs/DESIGN-SYSTEM.md)  
> Inventario TEMP: [`docs/DAKINIS-ESTILOS-POR-PRODUCTO-TEMP.md`](../../docs/DAKINIS-ESTILOS-POR-PRODUCTO-TEMP.md)

## Capas

```
Foundation     @dakinis/shared-foundation   ✅ v1.0
Theme Engine   @dakinis/shared-theme        ✅ v1.1
Experience     @dakinis/shared-des + ux + layouts  ✅ v1.1
Brand catalog  @dakinis/shared-brand        ✅ facade BC (no nuevos tokens)
```

## Lema

> Mismas superficies, tipografía, radius y shell; **solo cambia el acento.**

## Product accents

| Producto | Acento |
|----------|--------|
| Core / Hub | `#2dd4bf` |
| LifeFlow | mint `#3dd6c6` |
| Tabletop | `#c9a227` |
| AkoeNet | `#7c3aed` |
| StreamAutomator | `#3b82f6` |

## Consumo

```javascript
import { DES_VERSION, DES_LAYERS } from "@dakinis/shared-des";
import { applyDesTheme, applyDesColorMode } from "@dakinis/shared-theme";
import { AppShell } from "@dakinis/shared-layouts";
import "@dakinis/shared-foundation/tokens.css";
import "@dakinis/shared-theme/tokens.css";
// BC: import "@dakinis/shared-brand/tokens.css";
```

```jsx
import { Button, Badge, Card } from "@dakinis/shared-ux";

<AppShell product="lifeflow" theme="dark" sidebar={<Nav />}>
  <Button variant="primary">OK</Button>
</AppShell>
```

Adopción objetiva: `node scripts/des-adoption-score.mjs`  
Sync vendors: `node scripts/sync-shared-brand.mjs` (incluye `shared-ux`)

### Motion / Elevation (B3)

```jsx
import { MotionElevationDemo, DAKINIS_MOTION_CLASSES } from "@dakinis/shared-ux";
// Core DEV: /__des/motion
```

### Patrones (B4)

```jsx
import { DashboardPattern, ChatPattern, FormPattern, PatternsDemo } from "@dakinis/shared-ux";
// Core DEV: /__des · /__des/patterns
```

### Theme / HC (B5)

```jsx
import { bootstrapDesAppearance } from "@dakinis/shared-theme";
import { ColorModeControl, ThemeDemo } from "@dakinis/shared-ux";
bootstrapDesAppearance({ product: "hub", defaultMode: "system" });
// Core DEV: /__des/theme
```

Principios: [`docs/experience-principles.md`](../../docs/experience-principles.md)

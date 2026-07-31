# Dakinis Design System — RFC / Architecture (DES v1.1)

> **Canónico de diseño** · 31 jul 2026 · DES **v1.1.0** (`navy-contrast`)  
> Inventario histórico / WIP → [`DAKINIS-ESTILOS-POR-PRODUCTO-TEMP.md`](./DAKINIS-ESTILOS-POR-PRODUCTO-TEMP.md)  
> Paquetes → `packages/shared-foundation` · `shared-theme` · `shared-des` · `shared-layouts` · `shared-ux` · `shared-brand` (catálogo)

---

## Lema

> **Mismas superficies, tipografía, radius y shell; solo cambia el acento.**

No cambiamos el *look* de Dakinis: cambiamos la *implementación* (tokens semánticos, capas, cero hex en componentes).

---

## Cuatro capas (no un God Package)

```
Dakinis Foundation          @dakinis/shared-foundation
        ↓
Dakinis Theme Engine        @dakinis/shared-theme
        ↓
Dakinis Experience System   @dakinis/shared-des + shared-ux + shared-layouts
        ↓
Productos                   Hub · Core · LifeFlow · AkoeNet · SA · …
```

| Capa | Paquete | Responsabilidad | No debe contener |
|------|---------|-----------------|------------------|
| **Foundation** | `shared-foundation` | spacing, radius, motion, typography, surfaces 0–4, elevation, a11y, icon sizes | Acentos de producto, company copy |
| **Theme Engine** | `shared-theme` | dark / light / HC, accent por `data-product`, persistencia, Tailwind bridge | Layouts, Button, URLs |
| **Experience (DES)** | `shared-des` + `shared-ux` + `shared-layouts` | Button, Card, Dialog, AppShell, patterns, AI UI | Hex de marca, catálogo comercial |
| **Brand / catalog** | `shared-brand` | company, products JSON, SSO URLs, Hub modules | **No** nuevos tokens — solo facade BC |

`shared-brand` **deja de ser** el sitio donde vive “absolutamente todo”. Es catálogo + re-exports de compatibilidad.

Versionado:

| Artefacto | Versión actual |
|-----------|----------------|
| DES (Experience) | **1.1.0** — `DES_VERSION` en `@dakinis/shared-des` |
| Foundation | 1.0.0 |
| Theme Engine | **1.1.0** — system default + HC QA |
| Brand catalog | 1.0.0 (compat) |

Cada producto debería registrar: *“Core usa DES 1.0 + Foundation 1.0 + Theme 1.0”*.

---

## Estado actual (AS-IS) — mapa

| Producto | Personalidad | Stack | Notas |
|----------|--------------|-------|-------|
| Hub | Escritorio | CSS + tokens | Mejor adopción |
| Landing | Marketing | Tailwind v4 + tokens | Surface DES |
| Core | Ops B2B | CSS grande + tokens | Hex locales en reducción |
| LifeFlow | Finanzas mint | CSS + tokens | AppShell local |
| AkoeNet | Comunidad | Nexora + DES bridge | Motor de temas más rico |
| StreamAutomator | SaaS light-first | Tailwind + preset | Personalidad intencional |
| Tabletop | Fantasy | CSS propio | Piel permitida |
| Auth emails | Transaccional | HTML | Acentos DES alineados |

### Adopción objetiva (no subjetiva)

```
Tokens.css / foundation     +30
AppShell / dakinis-shell    +20
Componentes DES             +20
Sin palette hex local       +10
Theme engine / data-*       +20
────────────────────────────────
Máximo                      100
```

Medición:

```bash
node scripts/des-adoption-score.mjs
# → docs/des-adoption-latest.json
```

---

## Estado objetivo (TO-BE)

- Foundation + Theme Engine consumidos por todos los fronts.
- Componentes agnósticos (`variant="primary"`, nunca `"teal"`).
- SA light-first y Tabletop fantasy **conservan piel**; comparten foundations.
- AkoeNet **dona** capacidades de tema al Theme Engine (ya hay `theme-engine` + bridge).
- `shared-brand` solo catálogo.

### Decisiones cerradas (no reabrir sin RFC)

| ID | Decisión |
|----|----------|
| D1 | LifeFlow accent = **mint `#3dd6c6`** |
| D2 | StreamAutomator **light-first** (foundations compartidas) |
| D3 | Theme Engine extraído; AkoeNet sync vía bridge |
| D4 | Tabletop fantasy OK |
| D5 | Hub CTAs = teal plataforma; púrpura = IA |
| D6 | No rediseñar look global ahora |

---

## Reglas de código

1. Cero hex en componentes React/CSS de producto → `var(--accent)` / `var(--dakinis-*)`.
2. Tokens **semánticos**: `--accent`, `--surface-0`, `--text`, `--border`, `--success`…
3. `<Button variant="primary" />` — el producto define qué es primary.
4. Radius solo `sm|md|lg` (8/12/16). Spacing solo escala oficial.
5. Foundation ≠ Product: ningún producto redefine spacing/tipo/radius.
6. Tailwind: `bg-surface-0`, `text-accent`, `rounded-card` vía `@dakinis/shared-theme/tailwind-preset`.
7. Import preferido en apps nuevas:

```js
import "@dakinis/shared-foundation/tokens.css";
import "@dakinis/shared-theme/tokens.css";
import { applyDesTheme, applyDesColorMode } from "@dakinis/shared-theme";
import { AppShell } from "@dakinis/shared-layouts";
import { DES_VERSION } from "@dakinis/shared-des";
```

BC: `import "@dakinis/shared-brand/tokens.css"` sigue funcionando (bundle local).

---

## Guía rápida para desarrolladores

### Do

```jsx
import { applyDesTheme } from "@dakinis/shared-theme";
import { AppShell } from "@dakinis/shared-layouts";
import { Button, Badge, Card } from "@dakinis/shared-ux";
import "@dakinis/shared-foundation/tokens.css";
import "@dakinis/shared-theme/tokens.css";

applyDesTheme({ product: "lifeflow", theme: "dark" });

<AppShell product="lifeflow" theme="dark" sidebar={<Nav />}>
  <Button variant="primary">Guardar</Button>
  <Badge tone="success">OK</Badge>
  <Card>…</Card>
</AppShell>
```
```css
.my-panel {
  background: var(--surface-1);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--dakinis-radius-card);
  padding: var(--dakinis-space-base);
}
```

### Don't

```jsx
// ❌ color de marca en el API del componente
<Button variant="teal" />
<Button style={{ background: "#2dd4bf" }} />
```

```css
/* ❌ */
.card { background: #08111d; border-radius: 13px; padding: 19px; }
```

| Do | Don't |
|----|--------|
| `var(--dakinis-accent)` | `#2dd4bf` en componentes |
| `variant="primary"` | `variant="purple"` |
| `:focus-visible` + `var(--dakinis-focus-ring)` | `outline: none` sin anillo alternativo |
| `data-product="hub"` | Redefinir `--dakinis-space-*` en la app |
| Inter vía token | System font distinto sin motivo de producto |
| AppShell contract | Otro sidebar inventado sin necesidad |

### Componentes DES (registro)

Ver `DES_COMPONENTS` en `@dakinis/shared-des/components` — Button, Card, Dialog, Input, Table, AppShell, Command Palette, etc. (implementación en `shared-ux` / `shared-layouts`).

### A11y (B2)

- Anillo: `var(--dakinis-focus-ring)` / `var(--dakinis-focus-ring-ai)` en Foundation.
- Controles DES usan **`:focus-visible`** (no quitar outline sin reemplazo).
- AppShell: skip link `#dakinis-skip-to-content` → `#dakinis-main`.
- Checklist: `DAKINIS_A11Y` / `DAKINIS_A11Y_CHECKLIST` en `@dakinis/shared-foundation`.

### Motion & Elevation (B3)

| Token / clase | Valor / uso |
|---------------|-------------|
| `--dakinis-motion-hover` | 150ms — botones, cards |
| `--dakinis-motion-dropdown` | 200ms — menús |
| `--dakinis-motion-modal` | 250ms — diálogos |
| `--dakinis-motion-navigation` | 300ms — vistas |
| `--dakinis-motion-sidebar` | 250ms — drawer |
| `--dakinis-hover-scale` | 1.02 |
| `dakinis-motion-fade-in` / `slide-in` / `skeleton` / `hover` | clases utilitarias |
| `--dakinis-elevation-0…3` | flat → modal |
| `dakinis-elev-0…3` / `elev-card` / `elev-ai` | clases utilitarias |

JS: `DAKINIS_MOTION`, `DAKINIS_ELEVATION` (+ USAGE) en Foundation.  
Demo: componente `MotionElevationDemo` · Core DEV → `/__des/motion`.

```jsx
import { MotionElevationDemo, DAKINIS_MOTION_CLASSES } from "@dakinis/shared-ux";
<div className={DAKINIS_MOTION_CLASSES.fadeIn}>…</div>
```

`prefers-reduced-motion: reduce` desactiva animaciones DES.

### Patrones Dashboard / Chat / Forms (B4)

| Patrón | Componente | Notas |
|--------|------------|-------|
| Dashboard | `DashboardPattern` · `DashboardTemplate` | topbar → widgets → cards → timeline → actions |
| Chat | `ChatPattern` | hilo + composer · `AiMessage` · empty state |
| Forms | `FormPattern` | fields + submit/secondary · error/success |

```jsx
import { DashboardPattern, ChatPattern, FormPattern } from "@dakinis/shared-ux";
```

Registro: `DES_PATTERNS` / `UX_PATTERNS`.  
Demos DEV (Core): `/__des` · `/__des/patterns` · `/__des/motion`.

### Apariencia & High-contrast (B5 / v1.1–v1.2)

| Pieza | Detalle |
|-------|---------|
| Color modes | `dark` · `light` · `system` (`bootstrapDesAppearance`) |
| Hub default | **system** (`namespace: hub`) |
| Core / LifeFlow / Landing / SA | **system** (`theme="auto"` / bootstrap) |
| High-contrast | `data-theme="high-contrast"` · checklist `DES_HIGH_CONTRAST_QA` |
| UI | `ColorModeControl` · Settings Hub |
| Demo | Core DEV `/__des/theme` |

```jsx
import { bootstrapDesAppearance } from "@dakinis/shared-theme";
import { ColorModeControl } from "@dakinis/shared-ux";

bootstrapDesAppearance({ product: "hub", namespace: "hub", defaultMode: "system" });
```

---

## Roadmap (separado)

### A — Migración técnica

| Fase | Qué | Done when |
|------|-----|-----------|
| A1 | Capas foundation/theme/brand | ✅ v1.0 packages |
| A2 | Tokens en Hub/Core/LifeFlow/Landing | ✅ entry + data-product |
| A3 | Eliminar hex Core/LifeFlow | ✅ UI → tokens · residual: color-picker seed |
| A4 | AppShell en Core + LifeFlow | ✅ `layout="stack"` |
| A5 | Tailwind tokenizado (Landing/SA) | ✅ SA `btn-primary`→DES · preset · data-product |
| A6 | Auth/Billing sin hex drift | ✅ |
| A7 | AkoeNet tokens + DES btn | ✅ tokens · dakinis-btn · `dakinis-shell` marker (Nexora) |

### B — Evolución del sistema

| Fase | Qué | Done when |
|------|-----|-----------|
| B1 | Librería componentes React unificada | ✅ `Button`/`Badge`/`Card`/`Dialog`/`Input`/`Table` en `@dakinis/shared-ux` · wired Core login + LifeFlow |
| B2 | A11y audit + focus rings | ✅ `:focus-visible` + `--dakinis-focus-ring` en DES · skip link id · LifeFlow legacy btns · auth/onboarding `<Button />` |
| B3 | Motion/elevation patterns documentados en Story/demo | ✅ tokens + clases CSS · `MotionElevationDemo` · Core `/__des/motion` (DEV) · RFC section |
| B4 | Patrones Dashboard / Chat / Forms | ✅ `DashboardPattern`/`ChatPattern`/`FormPattern` · `PatternsDemo` · `/__des/patterns` |
| B5 | DES v1.1 (high-contrast QA) · v1.2 (system theme default en Hub) | ✅ HC tokens + QA · `ColorModeControl` · Hub `defaultMode: "system"` · `/__des/theme` |

---

## Sync a apps vendored

```bash
node scripts/sync-shared-brand.mjs
# sincroniza foundation + theme + brand + layouts + ux
# y espeja CSS foundation/theme dentro de shared-brand (tokens self-contained)
```

---

## Conclusión

La identidad visual ya está: navy, Inter, radios, acento por producto.  
El trabajo es **plataforma compartida en capas**, no más inventarios de hex.  
DES **v1.1** cierra migración A + evolución B; adopción objetiva = **100** en todos los fronts medidos.

*RFC vivo — cambios de decisión = nuevo ID Dn + bump de versión menor/mayor.*

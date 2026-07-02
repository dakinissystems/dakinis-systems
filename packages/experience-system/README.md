# Dakinis Experience System (DES)

**Plataforma de experiencia** del ecosistema Dakinis — no una colección de paquetes sueltos.

> Paquetes npm históricos (`shared-brand`, `shared-ux`, `shared-ai`) se mantienen; **`@dakinis/shared-des`** es el punto de entrada unificado.  
> Arquitectura platform → [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)

## Visión

```
DES
├── Foundations     ✅ colors, typography, spacing, elevation, motion, icons, a11y
├── Components      🔄 Button, Card, Dialog, Input, Table, Sidebar, Navigation…
├── Patterns        ✅ empty, loading, errors, CRUD, dashboards, AI conversation
├── Layouts         ✅ AppShell, DashboardTemplate (@dakinis/shared-layouts)
├── Charts          🔄 catálogo + KPI (@dakinis/shared-charts)
├── Templates       ✅ dashboard canónico
└── Product Themes  ✅ acento por producto (solo branding)
```

## Foundations

| Área | Módulo | Detalle |
|------|--------|---------|
| Colors | `@dakinis/shared-brand/semantic-colors` | primary, success, warning, danger, info, neutral |
| Surfaces | `@dakinis/shared-brand/surfaces` | Surface 0–4 (background → floating) |
| Typography | `@dakinis/shared-brand/typography` | Display, H1–H3, Title, Body, Caption, Code |
| Spacing | `@dakinis/shared-brand/spacing` | **4, 8, 12, 16, 24, 32, 48, 64** px únicamente |
| Motion | `@dakinis/shared-brand/motion` | hover 150ms, dropdown 200ms, modal 250ms, nav 300ms, sidebar 250ms |
| Icons | `@dakinis/shared-icons` | Lucide · tamaños 16/20/24/32/48 · outline/filled/duotone |
| Accessibility | `@dakinis/shared-brand/accessibility` | keyboard, focus, contrast, reduced motion, ARIA |
| Responsive | `@dakinis/shared-brand/responsive` | desktop / tablet / mobile · drawer, bottom nav |

CSS: `@dakinis/shared-brand/tokens.css` — temas `dark`, `light`, `high-contrast`.

## Product Themes (solo acento)

| Producto | Acento |
|----------|--------|
| Core / Hub | cyan `#2dd4bf` |
| LifeFlow | verde `#22c55e` |
| Tabletop | oro `#c9a227` |
| AkoeNet | violeta `#7c3aed` |
| StreamAutomator | azul `#3b82f6` |

Todo lo demás (sidebar, header, cards, acciones, motion) es **idéntico**.

## Shell oficial

`AppShell` en `@dakinis/shared-layouts`:

```
Sidebar → Header → Content → Footer
         + Notifications, Command Palette, Search
```

Dashboard canónico: **Sidebar → Topbar → Widgets → Cards → Timeline → Quick Actions**

## Componentes IA (exclusivos DES)

| Componente | Paquete |
|------------|---------|
| AiMessage, AiSuggestion, AiThinking | `@dakinis/shared-ux/react/*` |
| AiConfidence, AiSources, AiWarning | idem |
| AiAction, AiTimeline, AiContextualHint | idem |

## Mapa de paquetes

```
packages/
├── shared-des/           ← entrada unificada DES
├── shared-brand/         foundations + tokens.css
├── shared-layouts/       AppShell, DashboardTemplate
├── shared-ux/            componentes React + patterns Hub
├── shared-charts/        catálogo charts + paleta
├── shared-ai/            agents, events, knowledge
├── shared-loading/       skeletons
├── shared-icons/         Lucide
├── shared-illustrations/ empty/error/success
├── sdk/                  clients platform + AI
└── design-audit/         CI: colores, tipografía, contraste, spacing
```

## Consumo

```javascript
import { DES_PATTERNS, DES_AI_COMPONENTS } from "@dakinis/shared-des";
import { applyDesTheme, DAKINIS_SPACING_ALLOWED } from "@dakinis/shared-des/foundations";
import { AppShell, DashboardTemplate } from "@dakinis/shared-layouts";
import "@dakinis/shared-brand/tokens.css";
```

```jsx
<AppShell product="lifeflow" theme="dark" sidebar={<Nav />} notifications={<Bell />}>
  <DashboardTemplate widgets={...} cards={...} timeline={...} />
</AppShell>
```

Sync tokens a apps: `node scripts/sync-shared-brand.mjs`

Principios: [`docs/experience-principles.md`](../../docs/experience-principles.md)

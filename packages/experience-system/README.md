# Dakinis Experience System (DES)

Framework interno para construir productos con identidad, interacción y IA coherentes.

> Alias históricos `shared-brand`, `shared-ux`, etc. se mantienen como paquetes npm; este directorio documenta la **visión unificada**.

## Mapa de paquetes

```
packages/
├── experience-system/     ← este README (índice DES)
├── shared-brand/          branding/   — tokens, colores, tipografía, tokens.css
├── shared-ux/             ux/        — empty states, hub nav, command palette, DashboardCard
├── shared-ai/             ai/         — flags, eventos, tipos agente
├── shared-loading/        loading/    — skeletons (card, tabla, gráfico…)
├── shared-icons/          icons/      — convención Lucide + nombres canónicos
├── shared-illustrations/  illustrations/ — claves empty/error/success/IA
├── sdk/                   sdk/        — cliente HTTP productos + IA
└── design-audit/          audit/      — CI: colores, tipografía, contraste
```

## Roadmap (paquetes futuros)

| Paquete | Rol |
|---------|-----|
| `shared-layouts` | Shell Hub, nav language, focus mode |
| `shared-onboarding` | Wizard, checklist, celebraciones |
| `shared-widgets` | Widget API Hub ← productos |
| `shared-notifications` | Centro notificaciones cross-producto |
| `shared-achievements` | Logros transversales en Hub |

## Consumo en apps

```javascript
import { DAKINIS_EMPTY_STATES } from "@dakinis/shared-ux/empty-states";
import { HUB_NAV_SLOTS } from "@dakinis/shared-ux/hub-nav";
import { skeletonStylesheet } from "@dakinis/shared-loading";
import { ILLUSTRATION_KEYS } from "@dakinis/shared-illustrations";
```

Principios de producto: ver §11 en [`docs/DAKINIS-ESTRUCTURA-TEMP.md`](../../docs/DAKINIS-ESTRUCTURA-TEMP.md) y paquetes `shared-ux` / `shared-brand`.

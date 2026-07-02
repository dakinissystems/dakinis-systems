# Dakinis Shared — Experience System (DES)

**Monorepo de paquetes npm** para el ecosistema Dakinis. Punto de entrada unificado: `@dakinis/shared-des`.

Este repositorio es el **ciudadano de plataforma** responsable de que Core, LifeFlow, Hub, AkoeNet y el resto compartan el mismo AppShell, componentes, temas y experiencia de usuario. No se despliega en Railway; se consume como dependencia en cada app.

> Fuente de desarrollo actual (mirror): [`dakinis-systems/packages/`](../dakinis-systems/tree/main/packages) hasta completar la migración del monorepo.

---

## Estructura

```
packages/
├── shared-des/           ← barrel DES (foundations, patterns, registries)
├── shared-brand/         ← tokens CSS, colors, typography, spacing, motion, themes
├── shared-ux/            ← componentes React, Hub widgets, empty states, AI UI
├── shared-layouts/       ← AppShell, DashboardTemplate
├── shared-charts/        ← catálogo visualización de datos
├── shared-ai/            ← tipos agents, events, knowledge
├── shared-loading/       ← skeletons
├── shared-icons/         ← Lucide (tamaños y pesos canónicos)
├── shared-illustrations/ ← empty / error / success
├── sdk/                  ← clients platform + AI
└── design-audit/         ← CI contra tokens DES
```

## Foundations

| Área | Paquete |
|------|---------|
| Surfaces 0–4 | `@dakinis/shared-brand/surfaces` |
| Spacing (4–64 px) | `@dakinis/shared-brand/spacing` |
| Motion | `@dakinis/shared-brand/motion` |
| Semantic colors | `@dakinis/shared-brand/semantic-colors` |
| Themes (dark / light / high-contrast) | `@dakinis/shared-brand/themes` |
| AppShell | `@dakinis/shared-layouts` |

## Product themes (solo acento)

| Product | Accent |
|---------|--------|
| Core / Hub | cyan `#2dd4bf` |
| LifeFlow | green `#22c55e` |
| Tabletop | gold `#c9a227` |
| AkoeNet | violet `#7c3aed` |
| StreamAutomator | blue `#3b82f6` |

Todo lo demás (sidebar, header, cards, motion) es **idéntico** en todas las apps.

## Quick start

```javascript
import { AppShell, DashboardTemplate } from "@dakinis/shared-layouts";
import "@dakinis/shared-brand/tokens.css";

<AppShell product="core" theme="dark" sidebar={<Nav />}>
  <DashboardTemplate widgets={...} cards={...} />
</AppShell>
```

## Consumo en productos

Cada app declara dependencias `@dakinis/*` vía path, git submodule o publicación privada npm.

Sync vendored copy (legacy): `node scripts/sync-shared-brand.mjs` en `dakinis-systems`.

## Documentación

- System overview: [DAKINIS-SISTEMA-TEMP.md](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/DAKINIS-SISTEMA-TEMP.md)
- GitHub org alignment: [GITHUB-ORG.md](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/GITHUB-ORG.md)
- Experience system index: `experience-system/README.md` (en monorepo)

## Platform stack context

```
Platform:  Auth · Gateway · AI · Hub · DES (this repo)
              ↓
Products:  Core · LifeFlow · AkoeNet · StreamAutomator · Tabletop · Landing
```

DES no es un microservicio. Es la capa que hace que los productos **se sientan como una sola plataforma**.

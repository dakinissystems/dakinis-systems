# Packages — Dakinis Experience System (DES)

Monorepo local de paquetes DES. **Canónico:** [dakinis-shared](https://github.com/dakinissystems/dakinis-shared).

Publicar cambios: `.\scripts\push-dakinis-shared.ps1`

Índice detallado: [`experience-system/README.md`](./experience-system/README.md)  
Guía GitHub org: [`docs/GITHUB-ORG.md`](../docs/GITHUB-ORG.md)

## Mapa

```
packages/
├── shared-des/           ← @dakinis/shared-des (entrada unificada)
├── shared-brand/         ← foundations + tokens.css
├── shared-layouts/       ← AppShell, DashboardTemplate
├── shared-ux/            ← componentes + patterns Hub
├── shared-charts/        ← catálogo charts
├── shared-ai/            ← agents, events
├── shared-loading/
├── shared-icons/
├── shared-illustrations/
├── sdk/
└── design-audit/
```

## Platform context

DES es ciudadano de **Platform** (como Auth o AI), no un servicio Railway:

```
Auth · Gateway · AI · Hub · DES
         ↓
Core · LifeFlow · AkoeNet · StreamAutomator · Tabletop
```

## Sync a productos

```bash
node scripts/sync-shared-brand.mjs
```

Migración monorepo: [`MIGRATION.md`](./MIGRATION.md)

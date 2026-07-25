# Packages — Dakinis Experience System (DES)

Monorepo local de paquetes DES. **Canónico:** [dakinis-shared](https://github.com/dakinissystems/dakinis-shared).

Publicar cambios: `.\scripts\push-dakinis-shared.ps1`

Índice detallado: [`experience-system/README.md`](./experience-system/README.md)  
Guía GitHub org: [`docs/archive/GITHUB-ORG.md`](../docs/archive/GITHUB-ORG.md)

## Mapa

```
packages/
├── shared-des/           ← @dakinis/shared-des (entrada unificada)
├── shared-brand/         ← foundations + tokens.css
├── shared-layouts/       ← AppShell, DashboardTemplate
├── shared-ux/            ← componentes + patterns Hub
├── shared-charts/        ← catálogo charts
├── shared-ai/            ← agents, events
├── shared-db/            ← pool, repositories, outbox
├── shared-error/         ← AppError, mapToHttp, Express middleware
├── shared-validation/    ← Zod schemas workspace
├── shared-feature-flags/ ← server evaluate + React hook
├── shared-platform/      ← CommandBus, QueryBus, CacheService, CapabilityRegistry
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

## Documentación del ecosistema

Canónica en [dakinis-systems/docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs):

| Doc | Contenido |
|-----|-----------|
| [Índice](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/README.md) | Source of truth |
| [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) | Mapa productos / plataforma |
| [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) | Estado / go-live |
| [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) | Deploy, health, monitorización |
| [SECURITY](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SECURITY.md) | Checklist seguridad P0–P1 |
| [ARCHITECTURE](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md) | Arquitectura |

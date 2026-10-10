# Packages — Dakinis Experience System (DES)

Paquetes npm de UX/plataforma compartida. **No** es un servicio Railway.

| | |
|---|---|
| **Canónico** | [dakinis-shared](https://github.com/dakinissystems/dakinis-shared) |
| **Working copy** | este directorio `packages/` en orquestación |
| **Publicar** | `.\scripts\push-dakinis-shared.ps1` |

Índice detallado: [`experience-system/README.md`](./experience-system/README.md) · migración → [`MIGRATION.md`](./MIGRATION.md)

## Mapa

```text
packages/
├── shared-des/           ← entrada unificada
├── shared-brand/ · shared-layouts/ · shared-ux/ · shared-charts/
├── shared-ai/ · shared-db/ · shared-error/ · shared-validation/
├── shared-feature-flags/ · shared-platform/
├── shared-loading/ · shared-icons/ · shared-illustrations/
├── sdk/ · design-audit/
```

## Cómo consumir

1. Cambios en DES → publicar a `dakinis-shared` (versión/semver según convención del monorepo).
2. Productos sincronizan con scripts (`node scripts/sync-shared-brand.mjs`, `sync-hub-des.ps1`, etc.).
3. Evitar editar solo la copia en un producto sin volver a publicar: rompe interfaces.

```text
Auth · Gateway · AI · Hub · DES (paquetes)
              ↓
Core · LifeFlow · AkoeNet · StreamAutomator · Tabletop
```

## Docs canónicas

Estado → [STATUS](../docs/STATUS.md) · Mapa → [SYSTEMS](../docs/SYSTEMS.md) · Estándar → [DOC-STANDARDS](../docs/DOC-STANDARDS.md)

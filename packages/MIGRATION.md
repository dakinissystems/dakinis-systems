# Migración → repo `dakinis-shared`

**Estado:** ✅ migrado · repo canónico [github.com/dakinissystems/dakinis-shared](https://github.com/dakinissystems/dakinis-shared)

Esta carpeta (`dakinis-systems/packages/`) es **mirror de desarrollo** sincronizado con `dakinis-shared`. Para cambios DES:

1. Editar aquí o en clone de `dakinis-shared`
2. Push a `dakinis-shared`
3. Opcional: `node scripts/sync-shared-brand.mjs` en control repo → apps vendoreadas

## Publicar cambios a dakinis-shared

```powershell
.\scripts\push-dakinis-shared.ps1
```

## Consumo en productos (git dependency)

```json
"@dakinis/shared-brand": "github:dakinissystems/dakinis-shared#main&path:packages/shared-brand"
```

## Instalar local (mirror)

```bash
cd packages && npm install && npm run test:imports
```

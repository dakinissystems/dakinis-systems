# Migración → repo `dakinis-shared`

Fuente actual: `dakinis-systems/packages/` (workspaces npm listos).

## 1. Crear repo GitHub

```bash
gh repo create dakinissystems/dakinis-shared --private --description "Dakinis Experience System (DES) — monorepo of shared UI packages, tokens, AppShell, SDK."
```

## 2. Copiar monorepo

Desde `dakinis-systems/packages/`:

```powershell
# En clone vacío de dakinis-shared
Copy-Item -Recurse D:\dakinis-systems\packages\* .
Copy-Item D:\dakinis-systems\docs\templates\README-dakinis-shared.md .\README.md
git add . && git commit -m "Initial DES monorepo from dakinis-systems/packages"
```

El `package.json` raíz ya define `"workspaces": ["shared-des", "shared-brand", …]`.

## 3. Instalar

```bash
npm install
npm run test:imports
npm run audit
```

## 4. Consumo en productos

**Opción A — git dependency (sin npm publish):**

```json
"@dakinis/shared-brand": "github:dakinissystems/dakinis-shared#main&path:packages/shared-brand"
```

**Opción B — submodule** en cada producto apuntando a `dakinis-shared/packages/shared-brand`.

**Opción C — npm private registry** (GitHub Packages) cuando el volumen lo justifique.

## 5. Sync legacy

Mientras coexisten copias vendoreadas:

```bash
node scripts/sync-shared-brand.mjs   # en dakinis-systems
```

Actualizar script para clonar desde `dakinis-shared` cuando el cutover esté hecho.

## 6. Limpiar control repo

Tras cutover: `dakinis-systems/packages/` → enlace doc a `dakinis-shared` o submodule.

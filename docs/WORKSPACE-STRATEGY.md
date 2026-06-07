# Estrategia de workspace — multi-repo vs monorepo

> **Audiencia:** control interno. Deploy y checklist: [`OPERATIONS.md`](./OPERATIONS.md).

Este documento describe el estado del ecosistema bajo `D:\dakinis-systems`, las decisiones de diseño y los pasos operativos para mantener el árbol coherente.

## 1. Estado actual (control repo + multi-repo)

El directorio raíz **`D:\dakinis-systems` es un repositorio Git ligero** (“control repo”): versiona **Docker, gateway, docs, infrastructure, scripts** y el README, con [`.gitignore`](../.gitignore) que **excluye** `apps/` y `platform/`. Así obtienes historial y rollback del **stack completo** sin mezclar el código de los productos (cada uno sigue en su propio remoto).

| Ubicación | Rol |
|-----------|-----|
| `docker/`, `gateway/`, `docs/`, `infrastructure/`, `scripts/` | Versionados por el control repo. |
| `platform/auth`, `platform/core`, `platform/shared` | Tres repos con su propio `origin` (árbol ignorado en la raíz). |
| `apps/landing`, `apps/streamautomator` | Repos de producto (ignorados en la raíz). |
| `apps/akoenet/Client`, `apps/akoenet/Server` | Dos repos con sus propios remotos (ignorados en la raíz). |

`platform/shared` sigue siendo el **monorepo npm** interno (`pnpm`, Turborepo, paquetes `@dakinis/*`).

**Primer uso:** `git init` en la raíz (si aún no existe), `git add` / `commit` de lo que no está ignorado, y en otra máquina: clonar el control repo + volver a clonar `apps/*` y `platform/*` en sus rutas habituales.

## 2. Qué estaba mal y qué se corrige

### 2.1 AkoeNet: repo padre vacío (anti-pattern)

Antes: `apps/akoenet/.git` existía junto a `Client/.git` y `Server/.git`. El repo padre no tenía commits útiles ni remoto; Git trataba `Client/` y `Server/` como carpetas no rastreadas.

**Corrección aplicada:** eliminar solo `apps/akoenet/.git`. Siguen siendo repos válidos **`apps/akoenet/Client`** y **`apps/akoenet/Server`**.

### 2.2 Git en Windows: “dubious ownership”

Algunos clones (por ejemplo `apps/streamautomator`) pueden disparar el error de propiedad dudosa.

**Corrección:** ejecutar [`infrastructure/scripts/setup-git-safe-directories.ps1`](../infrastructure/scripts/setup-git-safe-directories.ps1) (añade rutas a `safe.directory` de forma idempotente).

### 2.3 Control repo vs monorepo de producto

Un `git init` en la raíz **más** `git add .` **sin** `.gitignore` agresivo **no** es viable: los `.git` bajo `apps/` y `platform/` harían el árbol confuso y mezclarían historiales.

| Objetivo | Enfoque |
|----------|---------|
| Versionar stack + gateway + contratos **sin** el código de apps/platform | **Control repo** (`.git` en la raíz + ignorar `apps/` y `platform/`). Es lo actual. |
| Un solo grafo que incluya **todo** el código | Monorepo real **o** submódulos/subtrees **explícitos** (migración aparte). |
| Repos de producto independientes | Clones bajo `apps/` y `platform/`; CI y releases por repo; semver en `@dakinis/*`. |

## 3. Dos rutas de producto (elección consciente)

### Opción A — Multi-repo (lo que tienes ahora)

- **Ventajas:** despliegues y permisos por repo; límites claros entre productos.
- **Inconvenientes:** coordinar cambios que cruzan `shared` + `core` + una app requiere disciplina (varios PRs, releases alineados, o tooling tipo Changesets).

### Opción B — Monorepo en la raíz

- **Ventajas:** un PR puede tocar plataforma y app; releases coordinados; CI unificado.
- **Inconvenientes:** migración de historial, tamaño del repo, políticas de ownership y de ramas.

### Híbrido habitual en equipos

- **Monorepo lógico** en `platform/shared` (paquetes) + **multi-repo** para apps hasta que unifique negocio.
- **Opcional:** mirrors o splits desde un futuro monorepo (subtree split, etiquetas, CI dispatch).

## 4. Checklist operativo

| Acción | Cuándo |
|--------|--------|
| [`finish-pending-moves.ps1`](../infrastructure/scripts/finish-pending-moves.ps1) | Migración física (zombie `dakinis-shared`, traslado StreamAutomator). Ya aplicado si el árbol está limpio. |
| [`setup-git-safe-directories.ps1`](../infrastructure/scripts/setup-git-safe-directories.ps1) | Tras clonar o en una máquina nueva (evita *dubious ownership*). |
| [`recreate-layout.ps1`](../infrastructure/scripts/recreate-layout.ps1) | Solo si necesitas recrear el junction de StreamAutomator (casos excepcionales). |

## 5. Próximos pasos opcionales (no automatizados aquí)

- **`pnpm-workspace.yaml` en la raíz de `dakinis-systems`:** valor cuando la mayoría de proyectos compartan stack Node y quieras un solo lockfile y referencias `workspace:*`. Requiere diseño (conflictos con repos que ya tienen su propio workspace).
- **Turborepo en raíz:** encaja cuando el workspace pnpm raíz exista y las tareas `build`/`dev` estén alineadas.
- **AkoeNet como un solo repo:** mover `Client` y `Server` bajo una única raíz Git (sin `.git` dentro de cada app), un remoto y carpetas `apps/client` y `apps/server` — migración planificada aparte.

## 6. Referencias

- [`README.md`](../README.md) — modelo mental y rutas.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — capas y integración.

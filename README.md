# dakinis-systems

Central orchestration repository for Dakinis Systems — infrastructure, Docker, gateway, scripts and architecture documentation for a multi-product SaaS platform.

Public remote: [github.com/dakinissystems/dakinis-systems](https://github.com/dakinissystems/dakinis-systems).

## Local workspace layout

On the maintainer machine the ecosystem root is **`D:\dakinis-systems`** (not a Git repo). This repository is checked out under that tree as:

`D:\dakinis-systems\dakinis-systems-control\dakinis-systems` → `origin` = this repo.

The authoritative description of folders, repos, and naming (`streamer-scheduler` → **Dakinis StreamAutomator**, **AkoeNet**, etc.) lives at:

`D:\dakinis-systems\README.md`

All **paths below** are relative to that root (`D:\dakinis-systems\…`).

## Stack ↔ código (mayo 2026)

| Capa cloud | Proveedor | Región / tamaño | Producto | Rutas en el workspace |
| --- | --- | --- | --- | --- |
| Base de datos / backend gestionado | **Supabase** | (proyecto **AkoeNet**) | Dakinis **AkoeNet** — Postgres, auth opcional, pooler | Código que habla con la DB: `apps/akoenet/Server` (ver `Server/.env.example`, migraciones). Cliente: `apps/akoenet/Client`. |
| Cómputo | **AWS** | **`eu-west-1`**, **nano** | **Streamer Schedule** (marca: **Dakinis StreamAutomator**, repo `dakinis-streamautomator`) | `apps/streamautomator` (`apps/api`, `apps/web`) |
| Cómputo | **AWS** | **`eu-west-1`**, **nano** | **AkoeNet** — API / servicios Node (capa de aplicación; la DB sigue en Supabase) | `apps/akoenet/Server` (y front según despliegue: `apps/akoenet/Client`) |

**Nano** = instancia / plan de cómputo mínimo en AWS (p. ej. Lightsail nano o equivalente).

### Resumen en una línea

- **Supabase `AkoeNet`** → datos y servicios gestionados de AkoeNet; implementación principal en `apps/akoenet/Server`.
- **Primer nano `eu-west-1`** → StreamAutomator (Streamer Schedule) en `apps/streamautomator`.
- **Segundo nano `eu-west-1`** → AkoeNet (app) en `apps/akoenet/`.

Si clonas solo este repo de orquestación, clona también los productos bajo `D:\dakinis-systems\apps\…` siguiendo el mapa en la raíz del workspace.

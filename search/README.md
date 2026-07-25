# Dakinis Search

**Búsqueda global** Hub + productos.

> **Prod:** Gateway [/search/](https://api.dakinissystems.com/search/health)

| | |
|---|---|
| **GitHub** | [dakinis-search](https://github.com/dakinissystems/dakinis-search) |
| **Gateway** | `/search/` |
| **Health** | `GET /search/health` |

## Local

```powershell
npm install
npm run dev
curl http://localhost:4082/health
```

## Deploy

API + worker. Runbook → [railway-workers](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/railway-workers.md)

## Contracts

[search.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/search.json)

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

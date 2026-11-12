# Dakinis Search

Búsqueda global para **Hub** y productos del ecosistema (índice unificado / proxies según contrato).

> **Estado:** desplegado detrás del gateway — límites y cobertura por producto → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md)

| | |
|---|---|
| **GitHub** | [dakinis-search](https://github.com/dakinissystems/dakinis-search) |
| **Gateway** | `https://api.dakinissystems.com/search/` |
| **Health** | `GET /search/health` |
| **Contrato** | [search.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/search.json) |
| **Consumidores** | Hub, Internal API (proxy), productos |

## Propósito

- Consultas cross-product para el dashboard Hub y experiencias de producto
- Si un producto/índice no está disponible, el contrato/cliente debe degradar (no asumir 100% cobertura)

## Local

```powershell
npm install
cp .env.example .env
npm run dev
```

```powershell
curl http://localhost:4082/health
```

## Deploy

API + worker. Runbook → [railway-workers](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/railway-workers.md)

## Seguridad

- Acceso vía gateway / service keys según contrato; no exponer búsqueda interna sin auth de producto.

## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)

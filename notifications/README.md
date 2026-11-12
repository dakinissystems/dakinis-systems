# Dakinis Notifications

Notificaciones **cross-product**: email, push, in-app y webhooks (según adapters habilitados).

> **Estado:** API + worker en plataforma — canales concretos y proveedores → contrato + STATUS

| | |
|---|---|
| **GitHub** | [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications) |
| **Gateway** | `https://api.dakinissystems.com/notifications/` |
| **Health** | `GET /notifications/health` |
| **Contrato** | [notifications.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/notifications.json) |

## Flujo

```text
Producto → evento / API → cola → Worker → adapters (email, push, in-app…)
```

| Proceso | Comando | Rol |
|---------|---------|-----|
| API | `npm start` / `npm run dev` | REST |
| Worker | `npm run worker` | Consumidor BullMQ |

## Local

```powershell
npm install
cp .env.example .env
npm run dev
```

```powershell
npm run worker
```

## Deploy

Railway: API + worker. Runbook → [railway-workers](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/railway-workers.md)

Fallos de proveedor: reintentos/deduplicación según implementación del worker — ver contrato y código; no asumir entrega garantizada sin dead-letter documentado.

## Seguridad

- Solo servicios/productos autenticados; no endpoint público anónimo para envío masivo.

## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)

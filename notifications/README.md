# Dakinis Notifications

**Notificaciones cross-product** — email, push, in-app, webhooks.

> **Prod:** Gateway [/notifications/](https://api.dakinissystems.com/notifications/health)

| | |
|---|---|
| **GitHub** | [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications) |
| **Gateway** | `/notifications/` |
| **Health** | `GET /notifications/health` |

## Flow

```
Product → Event bus → Notifications Worker → adapters (email, push, in-app…)
```

| Process | Start | Role |
|---------|-------|------|
| API | `npm start` | REST |
| Worker | `npm run worker` | BullMQ consumer |

## Local

```powershell
npm install
npm run dev
npm run worker
```

## Deploy

Railway: API + worker. Runbook → [railway-workers](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/railway-workers.md)

## Contracts

[notifications.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/notifications.json)

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

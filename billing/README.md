# Dakinis Billing

**Platform billing** — planes Stripe, suscripciones, facturas, usage y portal de cliente.

> **Prod:** Gateway [/billing/](https://api.dakinissystems.com/billing/health) · E2E pago live pendiente → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md)

| | |
|---|---|
| **GitHub** | [dakinis-billing](https://github.com/dakinissystems/dakinis-billing) |
| **Gateway** | `https://api.dakinissystems.com/billing/` |
| **Health** | `GET /billing/health` |
| **Database** | Supabase schema `billing` |
| **Runbook** | [billing-e2e](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/billing-e2e.md) |

## Scope

- Plans (Growth / Pro · product plans SA…)
- Stripe Customer Portal + webhooks
- Invoices, licenses, usage (AI / storage)
- Consumido por Core, Hub, StreamAutomator

## Local

```powershell
npm install
npm run dev
curl http://localhost:4080/health
```

## Environment

Copy `.env.example` → `.env`. Never commit secrets.

## Deploy (Railway)

1. Builder **Dockerfile** (`railway.toml`)
2. `PORT`, `DATABASE_URL`, `STRIPE_*`, `REDIS_URL`, service keys
3. Healthcheck `/health`
4. Webhook Stripe Live → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`

## Contracts

- [billing.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/billing.json)
- [ARCHITECTURE](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md)

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

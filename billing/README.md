# Dakinis Billing

Servicio de **plataforma** para planes Stripe, suscripciones, facturas, usage y Customer Portal. Consumido por Core, Hub y StreamAutomator.

> **Estado:** infraestructura y gateway desplegados · **ciclo de cobro E2E live pendiente** → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md)

| Capacidad | Madurez |
|-----------|---------|
| Servicio + health en gateway | 🟡 Beta / desplegado |
| Integración Stripe (código + webhooks) | 🟡 |
| Cobro E2E producción validado | ⬜ |

| | |
|---|---|
| **GitHub** | [dakinis-billing](https://github.com/dakinissystems/dakinis-billing) |
| **Gateway** | `https://api.dakinissystems.com/billing/` |
| **Health** | `GET /billing/health` |
| **Database** | Supabase schema `billing` |
| **Runbook** | [billing-e2e](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/RUNBOOKS/billing-e2e.md) |
| **Contrato** | [billing.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/billing.json) |

## Propósito

- Plans (Growth / Pro · planes de producto)
- Stripe Customer Portal + webhooks
- Invoices, licenses, usage (AI / storage)

## Local

```powershell
npm install
cp .env.example .env
npm run dev
```

```powershell
curl http://localhost:4080/health
```

Nunca commitear secretos.

## Deploy (Railway)

1. Dockerfile (`railway.toml`)
2. `PORT`, `DATABASE_URL`, `STRIPE_*`, `REDIS_URL`, service keys
3. Healthcheck `/health`
4. Webhook Stripe Live → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`

## Seguridad

- Llamadas entre servicios con claves de plataforma; no exponer Billing al browser sin proxy/producto autorizado.
- Webhooks: verificar firma Stripe.

## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)

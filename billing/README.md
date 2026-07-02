# Dakinis Billing

**Platform billing service** for the Dakinis ecosystem — plans, Stripe subscriptions, invoices, usage metering and marketplace commissions.

> **Status:** repo ✅ · scaffold en GitHub · **Railway:** not deployed yet.

| | |
|---|---|
| **GitHub** | [github.com/dakinissystems/dakinis-billing](https://github.com/dakinissystems/dakinis-billing) |
| **Railway Root Directory** | `/` (repo root) |
| **Domain (target)** | `billing.dakinissystems.com` |
| **Gateway prefix** | `/billing/` |
| **Database** | Supabase schema `billing` |

## Scope

- Plans (Starter, Growth, Pro, LifeFlow tiers…)
- Stripe Customer Portal + webhooks
- Invoices, licenses (SA, marketplace), usage (AI tokens, storage)
- Internal API for Core, LifeFlow, Hub

## Local

```powershell
cd billing
npm install
npm run dev
curl http://localhost:4010/health
```

## Environment

Copy `.env.example` → `.env`. Never commit secrets.

## Deploy (Railway)

1. Connect Railway service to [dakinis-billing](https://github.com/dakinissystems/dakinis-billing).
2. Variables: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`, `REDIS_URL`
3. Healthcheck path: `/health`
4. **Do not expose publicly** until Stripe migration from Core is complete.

## Contracts

- Gateway: [`docs/contracts/billing.json`](../docs/contracts/billing.json) (in control repo)
- Architecture: [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)

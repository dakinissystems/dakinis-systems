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
curl http://localhost:4080/health
```

## Environment

Copy `.env.example` → `.env`. Never commit secrets.

## Deploy (Railway)

> **Scaffold only** — builds and serves `/health`. Business routes return 501 until Fase 8.

1. Repo conectado: [dakinis-billing](https://github.com/dakinissystems/dakinis-billing) (debe incluir `package.json`, `Dockerfile`, `src/` — no solo README).
2. Railway: **Builder = Dockerfile** (via `railway.toml`). No uses Railpack/Nixpacks si el repo está vacío.
3. Variables mínimas: `PORT` (Railway auto), opcional `NODE_ENV=production`
4. Healthcheck: `/health`
5. **No exponer en prod** hasta migrar Stripe desde Core.

## Contracts

- Gateway: [`docs/contracts/billing.json`](../docs/contracts/billing.json) (in control repo)
- Architecture: [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)

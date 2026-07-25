# Runbook — Billing E2E Live

**Pre-requisito:** `.\scripts\smoke-billing.ps1` → 3 checks en **200**.

| Paso | Acción | Verificación |
|------|--------|--------------|
| 1 | Stripe → Webhooks → Live | `https://api.dakinissystems.com/billing/v1/webhooks/stripe` |
| 2 | Eventos | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed` |
| 3 | `STRIPE_WEBHOOK_SECRET` en **dakinis-billing** | Redeploy |
| 4 | Core: `DAKINIS_BILLING_URL` + `REDIS_URL` + `DAKINIS_EVENTS_QUEUE` | Sin `STRIPE_*` en Core |
| 5 | Checkout | `https://core.dakinissystems.com/precios` → Growth |
| 6 | Stripe delivery | **200** |
| 7 | Supabase | `billing.subscriptions` con `plan` + `tenant_id` |
| 8 | Core | `business.plan` actualizado |
| 9 | Impago (opcional) | `invoice.payment_failed` → degraded → restore |

```sql
SELECT plan, status, tenant_id, stripe_subscription_id, updated_at
FROM billing.subscriptions
ORDER BY updated_at DESC LIMIT 5;
```

Arquitectura del flujo → [`../ARCHITECTURE.md`](../ARCHITECTURE.md) § Billing E2E.  
Incidencias webhook → [`incidents.md`](./incidents.md).

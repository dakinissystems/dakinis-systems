# Condición 5 — Webhook no duplica

**Fecha:** 2026-11-27  
**Cobro live:** ⏸ deuda B6 (no ejercido)

## Código — PASS

| Pieza | Evidencia |
|-------|-----------|
| UNIQUE `billing.stripe_webhook_events.stripe_event_id` | `docs/supabase/migrations/004_billing.sql` L133–135 |
| Constante + ON CONFLICT | `platform/billing/src/webhook-idempotency.js` · `repository.js` |
| Tests | `node --test ./test/webhook-idempotency.test.js` → **4/4** |

## Live SQL — ⬜

Pendiente `\d billing.stripe_webhook_events` en PG (staging aparcado / sin sesión SQL aquí).  
No requiere cobro Stripe; solo inspección de índice.

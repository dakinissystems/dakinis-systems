# B6 — Cobro real

**Estado:** ⏸ **DEUDA** — no avanzar hasta desaparcar cobro (2026-11-27)

## Prep ya hecha (no cerrar B6)

| Check | Estado |
|-------|--------|
| `smoke-billing.ps1` 3×200 | ✅ |
| Stripe + webhook configured en health | ✅ |
| Payment links Growth/Pro | ✅ |

## Deuda explícita

- Checkout real `/precios` → webhook 200 → `billing.subscriptions` = `business.plan`
- B12 pago SA real (misma deuda de cobro)
- Ensayos Stripe live / impago / portal

Runbook cuando se retome: `docs/RUNBOOKS/billing-e2e.md`

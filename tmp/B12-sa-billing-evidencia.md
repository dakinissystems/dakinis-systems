# B12 — StreamAutomator cliente de Dakinis Billing

**Fecha:** 2026-11-26  
**Resultado:** **PASS parcial** — catálogo + cutover unificado listos · cobro SA real residual (como B6)

## Criterio backlog

| Requisito | Estado |
|-----------|--------|
| Un pago de SA pasa por Billing de plataforma | Infra + smoke OK · **pago real PENDING** (aparcado con B6) |

## Smoke `scripts/smoke-billing-unified-sa.ps1` (2026-11-26)

| Check | Resultado |
|-------|-----------|
| Billing health stripe+webhook | **200** |
| Planes `sa-creator-monthly` / `sa-pro-monthly` / `sa-lifetime` | **OK** en catálogo |
| Internal `/billing/plans` sin auth | **401** |
| SA `payments/config-status` | Stripe **true** · `billingUnifiedAvailable` **true** |
| SA `internal/billing/license-sync` sin auth | **401** (ruta viva) |

## Código ya en prod

- Billing: `sa-fanout.js`, planes SA, webhook → license sync  
- SA API: `billingUnifiedSync.js` · checkout/portal vía Internal `/billing/*`  
- Flag: `billing.unified`

## Residual operador

1. Usuario SA con `platformAuthSub` + flag on  
2. `-LiveCheckout` / cobro test  
3. Confirmar fila en `billing.subscriptions` + licencia SA  

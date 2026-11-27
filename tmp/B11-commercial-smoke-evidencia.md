# B11 — Smoke E2E automático diario (circuito comercial)

**Fecha:** 2026-11-26  
**Resultado:** **PASS** — systems [#97](https://github.com/dakinissystems/dakinis-systems/pull/97) en main (`b96df1fe`) · venta real → inventario sigue fuera (B6 aparcado)

## Criterio backlog

| Requisito | Estado |
|-----------|--------|
| Job programado | `.github/workflows/smoke-commercial-circuit.yml` · cron `0 7 * * *` + `workflow_dispatch` |
| Resultado fechado | `tmp/B11-smoke-YYYYMMDD-HHmmss.md` + artifact CI |
| Alerta si falla | workflow rojo en GitHub Actions |
| Cadena venta → inventario → Hub → plan=Stripe | Probes públicos Core/Hub/Billing/plans/webhook · timeline `stock.low` opcional (`-WithTimeline`) |

## Corrida local 2026-11-26

| Probe | HTTP |
|-------|------|
| core health | 200 |
| hub health | 200 |
| billing health | 200 |
| billing plans | 200 |
| core stripe plans | 200 |
| stripe webhook GET | 405 (vivo) |

Evidencia: `tmp/B11-smoke-20261126-195020.md`

## Código

| Pieza | Path |
|-------|------|
| Script | `scripts/smoke-commercial-circuit.ps1` |
| Workflow | `.github/workflows/smoke-commercial-circuit.yml` |
| Branch | `feat/b11-commercial-smoke-daily` |

## Residual

- Activar `-WithTimeline` en CI con secrets `DAKINIS_INTERNAL_SERVICE_KEY` + `DAKINIS_PLATFORM_USER_ID`
- Cobro real / `business.plan` sync = B6  

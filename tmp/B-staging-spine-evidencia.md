# Circuito paso 5 — Staging / MFA spine

**Fecha:** 2026-11-27  
**Resultado:** **PASS parcial** — health+request_id en **prod** del circuito · MFA CF + entorno staging aún ops

## request_id + live/ready (prod)

| Servicio | PR | Prod |
|----------|-----|------|
| Billing | [#4](https://github.com/dakinissystems/dakinis-billing/pull/4) | ✅ |
| Internal | [#3](https://github.com/dakinissystems/dakinis-internal-api/pull/3) | ✅ |
| Auth header | [#1](https://github.com/dakinissystems/dakinis-auth/pull/1) | ✅ |
| Auth live/ready `/auth` | [#2](https://github.com/dakinissystems/dakinis-auth/pull/2) | ✅ |
| Hub health header | [#6](https://github.com/dakinissystems/dakinis-hub/pull/6) | ✅ |
| Core | ya | ✅ |

Smoke: `.\scripts\smoke-circuit-health.ps1` → **10/10 OK** (2026-11-27)

## Residual ops

| Pieza | Estado |
|-------|--------|
| MFA Cloudflare | ✅ `tmp/B-mfa-cloudflare-checklist.md` |
| Entorno Railway staging (base/redis/secretos propios) | ⬜ infra-desarrollador orden 2 |
| B6 cobro real | ⏸ aparcado |

## Ocho condiciones

Matriz: `tmp/B-ocho-condiciones-evidencia.md` · cond. 8 docs + cond. 3 tests Auth en curso.

## Siguiente

1. `railway login` + duplicar entorno staging  
2. Merge Auth cond. 3 tests · nombrar suplente P0  
3. Re-ejecutar `smoke-circuit-health.ps1` contra staging  


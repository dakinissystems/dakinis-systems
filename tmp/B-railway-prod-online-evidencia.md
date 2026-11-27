# Railway prod — canvas Online

**Fecha:** 2026-11-27  
**Resultado:** **PASS** — captura dashboard: todos los servicios **Online**

## Circuito comercial (visibles en canvas)

| Servicio Railway | Dominio / nota |
|------------------|----------------|
| `dakinis-gateway` | api.dakinissystems.com |
| `dakinis-auth` | auth.dakinissystems.com |
| `Core Back` | dakinis-core-production… |
| `Core Front` | core.dakinissystems.com |
| `dakinis-billing` | — |
| `Hub` | hub.dakinissystems.com |
| `dakinis-internal-api` | — |
| Redis | volumen `redis-volume` |

Captura: `assets/image-e9caf52a-02c0-4fc0-aec9-972d1f3052ca.png`

Smoke alineado: `scripts/smoke-circuit-health.ps1` 10/10 el mismo día.

## No es staging

Este canvas es **producción**. Staging sigue siendo un entorno **aparte** (PG/Redis/secretos propios) — `tmp/B-railway-staging-checklist.md`.

# Ocho condiciones — estado 2026-11-27

Antes del segundo negocio. Código ≠ verificado en entorno aislado.  
Circuito prod smoke: **10/10** (`smoke-circuit-health.ps1`) · reconfirmado post Auth [#4](https://github.com/dakinissystems/dakinis-auth/pull/4).

| # | Condición | Código | Verificado | Siguiente |
|---|-----------|--------|------------|-----------|
| 1 | Tenant A ≠ B | Core/Search/Internal | 🟡 Search tests 7/7 local · [#2](https://github.com/dakinissystems/dakinis-search/pull/2) | Evidencia live cross-tenant |
| 2 | Rol sin permiso | Core rbac + B2 Viewer | 🟡 `tmp/B-cond2-rbac-evidencia.md` · rbac 4/4 · [#18](https://github.com/dakinissystems/dakinis-core/pull/18) | Evidencia browser rol |
| 3 | Sesión revocable | Auth revoke + reuse family | 🟢 código main [#3](https://github.com/dakinissystems/dakinis-auth/pull/3)+[#4](https://github.com/dakinissystems/dakinis-auth/pull/4) · Railway 🟢 | Live: refresh revocado → 401 |
| 4 | Secreto invalidable | `*_PREVIOUS` dual-key | 🟡 tests en main [#4](https://github.com/dakinissystems/dakinis-internal-api/pull/4) | Ensayo rotación staging aparcado |
| 5 | Webhook no duplica | Billing B8 UNIQUE + tests 4/4 | 🟡 `tmp/B-cond5-webhook-unique-evidencia.md` · mig `004` | SQL vivo: `\d billing.stripe_webhook_events` |
| 6 | Restore backup | `scripts/restore-postgres-test.*` | 🟢 dump local 2026-11-27 | `tmp/B-cond6-restore-checklist.md` · errores known supabase_vault/vector |
| 7 | Audit admin | `tenant_audit_logs` + mig 062 | 🟡 `tmp/B-cond7-audit-evidencia.md` · audit 2/2 · [#19](https://github.com/dakinissystems/dakinis-core/pull/19) | Evidencia live audit row |
| 8 | P0 + responsable | P0–P3 + slot suplente en `RUNBOOKS/incidents.md` | 🟡 docs listos · suplente ⬜ | Nombrar suplente (`B-cond8`) |

## Staging Railway

CLI instalada (`railway 5.76.0`) · **login pendiente** (`railway login`).  
Checklist: `tmp/B-railway-staging-checklist.md`.

## Aparcado

B6 cobro real Stripe.

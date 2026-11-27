# Tablero residual — circuito / puerta 2º negocio

**Actualizado:** 2026-11-27  
**Regla de merge:** no abrir merges feat/fix intermedios; acumular y avisar **un merge final** cuando haya lote docs/código listo.

## Leyenda

| Quién | Significado |
|-------|-------------|
| **Ops/agente** | Se puede cerrar sin login humano (o ya cerrado) |
| **Operador** | Necesita sesión, SQL, nombre o decisión |
| **⏸** | Aparcado a propósito (staging / cobro) |

---

## Cerrado (código / ops)

| Ítem | Evidencia |
|------|-----------|
| Circuit smoke prod 10/10 | `smoke-circuit-health.ps1` |
| Cond 3 Auth revoke + CI | Auth [#3](https://github.com/dakinissystems/dakinis-auth/pull/3) [#4](https://github.com/dakinissystems/dakinis-auth/pull/4) · Railway 🟢 |
| Cond 4 dual-key tests | Internal [#4](https://github.com/dakinissystems/dakinis-internal-api/pull/4) |
| Cond 5 UNIQUE código | Billing tests 4/4 · mig `004` |
| Cond 6 restore local | `B-cond6-restore-checklist.md` |
| Cond 2 RBAC código | Core rbac 4/4 · `B-cond2` |
| Cond 7 audit código | Core audit 2/2 · `B-cond7` |
| Cond 1 Search isolation | tests 7/7 |
| Hub Mi día código | `hub-live-attention` 5/5 |
| MFA Cloudflare | `B-mfa-cloudflare-checklist.md` |
| Inventario + registry draft | `estructura-…md` · `B-repository-registry-draft.yaml` |

---

## Abierto — operador (bloquea “verde total”)

| # | Qué | Cómo | Evidencia a marcar |
|---|-----|------|--------------------|
| B9 | Hub Mi día browser | Login piloto → stock/pedidos | `B9-hub-midia-browser-checklist.md` |
| Cond 2 live | Member sin admin | Login member Copérnico | `B2` residual / `B-cond2` |
| Cond 3 live | Refresh revocado → 401 | Ver `B-live-runbook-condiciones.md` | `B-cond3` |
| Cond 5 SQL | `\d` / index UNIQUE vivo | SQL billing (sin cobro) | `B-cond5` |
| Cond 7 live | Fila audit | cash-close o admin action | `B-cond7` |
| Cond 1 live | Cross-tenant | Dos tenants / Search | `B-live-runbook…` |
| Cond 8 | **Nombrar suplente** | Rellenar `B-cond8` | cierra docs P0 |
| B10 | Walkthrough humano | Persona ajena sin ayuda | `B10-onboarding-evidencia.md` |

## Aparcado

| Ítem | Nota |
|------|------|
| Staging Railway | Auth crash / secretos · `B-railway-staging-checklist.md` |
| B6 cobro Stripe | Deuda comercial |
| Cond 4 rotación ensayada | Necesita staging o ventana controlada |

---

## Merge final

**Auth #4:** ya merged · no pedir merge de feat/fix sueltos.

**Acumulando (aún no pedir merge):**

| Cambio | Dónde |
|--------|-------|
| Filas residual / Auth cond3 / restore | `docs/STATUS.md` (wt-ops) |
| restore script Windows | `scripts/restore-postgres-test.ps1` (wt-ops) |
| smoke-circuit-health | `scripts/smoke-circuit-health.ps1` (untracked → incluir en lote) |
| Tablero / live runbook / registry / estructura | `tmp/B-*` (opcional versionar) |

`incidents.md` en wt-ops **ya** tiene P0–P3 + suplente ⬜ (no duplicar).  

Cuando digas **merge final**, un solo PR desde wt-ops con STATUS + scripts (+ tmp si quieres evidencia en repo).

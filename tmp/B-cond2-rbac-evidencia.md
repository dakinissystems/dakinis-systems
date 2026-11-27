# Condición 2 — Rol sin permiso

**Fecha:** 2026-11-27  
**Entorno código:** Local CI-style `node --test`

## Código — PASS

| Pieza | Evidencia |
|-------|-----------|
| Core RBAC | `api/test/rbac-roles.test.js` → **4/4** (member denied, admin ok, missing role forbidden) |
| Core PR | [#18](https://github.com/dakinissystems/dakinis-core/pull/18) |
| Viewer invite rejected | Hub [#5] · Internal [#2] · `tmp/B2-miembros-roles-evidencia.md` |

## Browser / live — ⬜

Recorrido Copérnico: member sin admin; Viewer ausente del selector (`B2` residual).

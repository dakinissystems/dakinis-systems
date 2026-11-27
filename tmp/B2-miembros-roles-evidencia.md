# B2 — Invitar personal y permisos por rol

**Fecha:** 2026-11-26  
**Resultado:** **PASS** parcial — Hub [#5](https://github.com/dakinissystems/dakinis-hub/pull/5) · Internal [#2](https://github.com/dakinissystems/dakinis-internal-api/pull/2) · Core B7 consumers [#14](https://github.com/dakinissystems/dakinis-core/pull/14) · browser Copérnico residual

## Criterio backlog / runbook

| Requisito | Estado |
|-----------|--------|
| Invitar desde Hub Admin → Miembros | UI + API |
| Owner/admin → Core `admin`; member → `member` | Ya en Core `platform-user-bridge` |
| Viewer no se crea | **Fix** Hub + Internal |
| Empleado entra y solo hace lo de su rol | Smoke browser residual operador |

## Código

| Repo | Branch / compare |
|------|------------------|
| Hub | [#5](https://github.com/dakinissystems/dakinis-hub/pull/5) `8942b37` |
| Internal | [#2](https://github.com/dakinissystems/dakinis-internal-api/pull/2) `6d51f44` |
| Core | [#14](https://github.com/dakinissystems/dakinis-core/pull/14) consumers B7 + `viewer` → null en bridge |

## Tests

- Hub `test/admin-invite-roles.test.js` PASS  
- Internal `test/invite-viewer-rejected.test.js` PASS  

## Residual

Recorrido en navegador con `heladeria-copernico`: invitar member, login IdP, aceptar, comprobar que no ve admin; no aparece Viewer en el selector.  

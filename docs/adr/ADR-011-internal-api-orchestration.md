# ADR-011 — Internal API como orquestador

## Contexto

Hub necesita agregar datos de Billing, Search, workspace admin y AkoeNet Assistant sin que el frontend llame N servicios con N claves. Los productos no deben leer schemas ajenos en SQL.

## Decisión

**Internal API** (`dakinis-internal-api`, puerto 4083) es el **orquestador server-to-server** para:

- Dashboard Hub (`/hub/dashboard/*`)
- Workspace admin (`/workspaces/*`, `/admin/v1/*`)
- AkoeNet Assistant (`/akoenet/assistant/*`)
- Proxies a Billing, Notifications, Search, Knowledge

Acceso autenticado con `DAKINIS_INTERNAL_SERVICE_KEY`. Hub usa `HUB_INTERNAL_URL` (private DNS en prod).

Los productos **pueden** llamar Internal API; **no** deben duplicar su lógica en el frontend del Hub.

## Consecuencias

- Nuevas capacidades cross-product empiezan como rutas Internal API + funciones SQL versionadas.
- Contratos: [`contracts/internal-api.json`](../contracts/internal-api.json), [`admin-api.json`](../contracts/admin-api.json).
- Hub permanece SPA delgada; lógica de agregación en `internal/src/services/`.
- Super Admin futuro puede reutilizar las mismas rutas `/admin/v1/*`.

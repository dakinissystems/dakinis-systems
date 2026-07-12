# Contratos entre servicios

Referencias **ligeras** (legibles por humanos y CI) para rutas y nombres expuestos tras el gateway. No sustituyen OpenAPI de cada servicio; sirven para alinear equipos y detectar cambios rompedores.

| Archivo | Servicio tras el gateway |
|---------|---------------------------|
| [`auth.json`](./auth.json) | `/auth/` → `platform/auth` |
| [`core-api.json`](./core-api.json) | `/core/` → `platform/core` API |
| [`streamautomator-api.json`](./streamautomator-api.json) | `/streamautomator/` → StreamAutomator API |
| [`akoenet-backend.json`](./akoenet-backend.json) | `/akoenet/` → AkoeNet Server |
| [`dakinis-ai.json`](./dakinis-ai.json) | `/ai/` → `platform/ai` (Dakinis AI Platform) |
| [`finance-api.json`](./finance-api.json) | `/finance/` → LifeFlow API + web (repo `lifeflow`) |
| [`internal-api.json`](./internal-api.json) | `/internal/` → Internal API platform (scaffold) |
| [`billing.json`](./billing.json) | `/billing/` → [dakinis-billing](https://github.com/dakinissystems/dakinis-billing) |
| [`notifications.json`](./notifications.json) | `/notifications/` → [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications) |
| [`search.json`](./search.json) | `/search/` → [dakinis-search](https://github.com/dakinissystems/dakinis-search) |
| [`knowledge.json`](./knowledge.json) | `/knowledge/` → [dakinis-knowledge](https://github.com/dakinissystems/dakinis-knowledge) |
| [`fitness-platform-api.json`](./fitness-platform-api.json) | `/fitness/` → Fitness Platform API (demo JWT propio) |
| [`hub.json`](./hub.json) | Origen propio `hub.dakinissystems.com` (no prefijo gateway) |
| [`admin-api.json`](./admin-api.json) | Workspace Admin + Super Admin vía `/internal/` (migr. 031) |
| [`akoenet-assistant.json`](./akoenet-assistant.json) | AkoeNet Assistant modular — módulos nativos (migr. 032) |
| [`media-api.json`](./media-api.json) | `/media/` → Dakinis Media Player addon AkoeNet (diseño en [`projects/media-player/`](../../projects/media-player/)) |

Actualiza estos JSON cuando cambies prefijos en [`gateway/routes/`](../../gateway/routes/) o contratos públicos de las APIs.

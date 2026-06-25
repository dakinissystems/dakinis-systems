# Dakinis Systems — repositorio de orquestación

Repositorio remoto: [github.com/dakinissystems/dakinis-systems](https://github.com/dakinissystems/dakinis-systems).

Este repo versiona **gateway HTTP**, **Docker local**, **documentación legal**, **contratos entre servicios** y **esquemas SQL** compartidos. El código de cada producto (Core, Landing, StreamAutomator, AkoeNet, Auth) vive en **repos Git propios** bajo `apps/` y `platform/` (no incluidos aquí).

## Productos

| Producto | Descripción |
|----------|-------------|
| **Dakinis One (Core)** | Business Operating System multi-tenant — [core.dakinissystems.com](https://core.dakinissystems.com) |
| **Dakinis Systems (Landing)** | Sitio corporativo — [dakinissystems.com](https://dakinissystems.com) |
| **StreamAutomator** | Scheduler Twitch — [streamautomator.com](https://streamautomator.com) |
| **AkoeNet** | Comunidad y voz |

## Arranque local

```powershell
.\scripts\dev.ps1
```

Detalle: [`docker/README.md`](./docker/README.md) · Gateway: [`gateway/README.md`](./gateway/README.md)

Prefijos HTTP en dev (`localhost:80`): `/auth/`, `/core/`, `/streamautomator/`, `/akoenet/`, `/fitness/`

## Documentación

| Recurso | Contenido |
|---------|-----------|
| [`docs/README.md`](./docs/README.md) | Índice de documentación |
| [`docs/legal/`](./docs/legal/) | Textos legales (privacidad, términos, cookies) |
| [`docs/contracts/`](./docs/contracts/) | Contratos HTTP del ecosistema |
| [`docs/rules.md`](./docs/rules.md) | Reglas al modificar rutas del gateway |
| [`docs/DAKINIS-ESTRUCTURA-TEMP.md`](./docs/DAKINIS-ESTRUCTURA-TEMP.md) | Roadmap + pendientes internos (local) |

## Integración

- **Auth central:** JWT con `sub`, `tenantId`, `role`; el gateway valida vía `/auth/verify`.
- **Cambios en el borde HTTP:** actualizar [`gateway/`](./gateway/) + [`docs/contracts/`](./docs/contracts/) en el mismo PR ([`docs/rules.md`](./docs/rules.md)).

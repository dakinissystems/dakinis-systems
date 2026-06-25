# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL compartido, textos legales). El código de producto vive en repos separados (`dakinis-core`, `dakinis-landing`, etc.).

## Para clientes e integradores

| Recurso | Descripción |
|---------|-------------|
| [`legal/`](./legal/) | Plantillas legales **bilingües** (ES + EN): privacidad, LSSI, cookies, canal RGPD, copyright, seguridad |
| [`contracts/`](./contracts/) | Contratos HTTP entre servicios (prefijos gateway) |
| [`rules.md`](./rules.md) | Reglas al cambiar rutas públicas en el gateway |

## Infraestructura

| Recurso | Descripción |
|---------|-------------|
| [`railway.env.example`](./railway.env.example) | Plantilla de variables (sin secretos) |
| [`supabase/schemas/`](./supabase/schemas/) | Migraciones SQL legacy Core / Auth |
| [`supabase/migrations/`](./supabase/migrations/) | Multi-schema 000–019 + [`RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) |
| [`../docker/README.md`](../docker/README.md) | Stack local Docker |
| [`../scripts/clone-akoenet.ps1`](../scripts/clone-akoenet.ps1) | Clonar `akoenet-client` + `akoenet-backend` en `apps/akoenet/` |
| [`../gateway/README.md`](../gateway/README.md) | API Gateway Nginx |

## Operador interno

Roadmap, pendientes, estructura de todos los sistemas y estado Supabase: **`DAKINIS-ESTRUCTURA-TEMP.md`** (local, no versionado — ver cabecera del archivo).

# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL compartido, textos legales). El código de producto vive en repos separados (`dakinis-core`, `dakinis-landing`, etc.).

## Para clientes e integradores

| Recurso | Descripción |
|---------|-------------|
| [`legal/`](./legal/) | Plantillas legales (privacidad, términos, cookies, aviso legal, WhatsApp/Meta) |
| [`contracts/`](./contracts/) | Contratos HTTP entre servicios (prefijos gateway) |
| [`rules.md`](./rules.md) | Reglas al cambiar rutas públicas en el gateway |

## Infraestructura

| Recurso | Descripción |
|---------|-------------|
| [`railway.env.example`](./railway.env.example) | Plantilla de variables (sin secretos) |
| [`supabase/schemas/`](./supabase/schemas/) | Migraciones SQL Dakinis Core / Auth |
| [`../docker/README.md`](../docker/README.md) | Stack local Docker |
| [`../gateway/README.md`](../gateway/README.md) | API Gateway Nginx |

## Operador interno

| Recurso | Descripción |
|---------|-------------|
| [`PENDIENTES.md`](./PENDIENTES.md) | Checklist único de tareas abiertas (prod, Stripe, deploy) |

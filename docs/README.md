# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL compartido, textos legales). El código de producto vive en repos separados.

## Documentación de plataforma

| Documento | Para qué |
|-----------|----------|
| [**PLATFORM-STATUS.md**](./PLATFORM-STATUS.md) | **Estado unificado** — ecosistema, capas, roadmap, Railway |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Infrastructure · Platform · Products — decisiones técnicas |
| [**PRODUCTS.md**](./PRODUCTS.md) | Catálogo productos (Core, LifeFlow, SA, AkoeNet, Tabletop, Landing) |
| [**OPERATIONS.md**](./OPERATIONS.md) | Deploy, env, health checks |
| [**GITHUB-ORG.md**](./GITHUB-ORG.md) | Monorepo DES, descripciones GitHub |

## Para clientes e integradores

| Recurso | Descripción |
|---------|-------------|
| [`legal/`](./legal/) | Plantillas legales **bilingües** (ES + EN) |
| [`contracts/`](./contracts/) | Contratos HTTP entre servicios |
| [`rules.md`](./rules.md) | Reglas al cambiar rutas públicas en el gateway |

## Infraestructura

| Recurso | Descripción |
|---------|-------------|
| [`railway.env.example`](./railway.env.example) | Plantilla de variables (sin secretos) |
| [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) | Orden SQL multi-schema |
| [`../gateway/README.md`](../gateway/README.md) | API Gateway Nginx |
| [`../docker/README.md`](../docker/README.md) | Stack local Docker |

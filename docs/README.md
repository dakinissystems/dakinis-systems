# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL compartido, textos legales). El código de producto vive en repos separados.

## Documentación de plataforma (mayo 2026)

| Documento | Para qué |
|-----------|----------|
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Platform vs Products, servicios transversales, Internal API, agents |
| [**ROADMAP.md**](./ROADMAP.md) | Fases, workers, LifeFlow Engine, Marketplace |
| [**OPERATIONS.md**](./OPERATIONS.md) | Railway, deploy, env, health checks, pendientes ops |
| [**PRODUCTS.md**](./PRODUCTS.md) | Resumen por producto (Core BOS, LifeFlow, SA, AkoeNet…) |
| [**GITHUB-ORG.md**](./GITHUB-ORG.md) | Monorepo DES, descripciones GitHub, plantillas README |
| [`DAKINIS-ESTRUCTURA-TEMP.md`](./DAKINIS-ESTRUCTURA-TEMP.md) | Índice local + valoración global (no versionado) |

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

# Documentación — índice

Solo lo necesario para operar y cambiar el ecosistema.

| Documento | Cuándo usarlo |
|-----------|----------------|
| [**PRODUCTION-CHECKLIST-TEMP.md**](./PRODUCTION-CHECKLIST-TEMP.md) | Estado prod y pendientes (borrar cuando estable) |
| [**supabase/SETUP.md**](./supabase/SETUP.md) | Supabase SQL, `DATABASE_URL`, Railway variables |
| [**railway.env.example**](./railway.env.example) | Plantilla env (sin secretos) |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Mapa de carpetas, productos, integración |
| [**WORKSPACE-STRATEGY.md**](./WORKSPACE-STRATEGY.md) | Control repo vs multi-repo, clones |
| [**rules.md**](./rules.md) | **Obligatorio** al cambiar rutas del gateway |
| [**contracts/**](./contracts/) | Prefijos HTTP públicos por servicio |
| [**observability/SENTRY-SETUP.md**](./observability/SENTRY-SETUP.md) | Sentry por servicio |
| [**observability/uptime-kuma.md**](./observability/uptime-kuma.md) | URLs de health para monitoreo |
| [**adr/**](./adr/) | Decisiones formales (Postgres, event bus, Fastify) |
| [**legal/**](./legal/) | Textos legales base por producto |

**SQL Supabase:** `supabase/schemas/` + `004` / `006` / `005` — orden en [SETUP.md](./supabase/SETUP.md).

**Eliminados** (contenido absorbido): `RAILWAY-PRODUCTION.md`, `ARCHITECTURE-DECISIONS.md`, `DAKINIS-ESTRUCTURA-TEMP.md`, `SUPABASE-SECURITY.md`.

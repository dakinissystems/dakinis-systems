# Decisiones de arquitectura — Dakinis Systems

Documento de referencia con **opciones**, **ventajas** y **decisión recomendada** para el ecosistema. Actualizado mayo 2026.

---

## 1. Base de datos de Core (CRÍTICO)

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| **A. SQLite (actual dev)** | Cero ops, rápido para MVP/demo | Sin concurrencia real, backups frágiles, no escala horizontal |
| **B. PostgreSQL + `tenant_id` en tablas** | Un solo cluster, queries cross-tenant para admin, backups estándar | RLS obligatorio; riesgo de fuga si mal configurado |
| **C. PostgreSQL + schema por tenant** | Aislamiento fuerte | Muchos schemas, migraciones complejas, coste operativo alto |

**Decisión:** **B** — PostgreSQL con schema `dakinis_core` y `tenant_id`/`business_id` en filas.

**Implementado:** capa `db/query.js` (SQLite + Postgres), `schema.postgres.sql`, Compose con `DATABASE_URL_CORE` + `DB_DRIVER_CORE`.

**Activar Postgres en Core:**

```env
DB_DRIVER_CORE=postgres
DATABASE_URL_CORE=postgres://dakinis:dakinis@postgres:5432/dakinis?options=-c%20search_path%3Ddakinis_core
```

---

## 2. Unificación de auth

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| **A. Auth por producto (hoy)** | Autonomía por equipo, despliegues independientes | Usuarios duplicados, sesiones inconsistentes |
| **B. `platform/auth` IdP + bridges** | Identidad única, gateway unificado | Migración gradual por producto |
| **C. OAuth2/OIDC externo (Auth0, Clerk)** | Menos código propio | Coste, vendor lock-in |

**Decisión:** **B** — IdP central con bridges en Core, StreamAutomator y AkoeNet.

**Implementado:** refresh tokens rotativos (`POST /auth/refresh`, `POST /auth/logout`), access token 15m, roles canónicos en `platform/auth/src/constants/roles.js`.

**Pendiente:** AkoeNet y Fitness dejan de emitir JWT propio en login humano; solo consumen IdP.

---

## 3. Backend framework único

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| **Express** | Ecosistema enorme, ya usado en auth/SA/AkoeNet | Menos performance que Fastify |
| **Fastify** | Rápido, schema validation nativa | Migrar Core (HTTP nativo) y SA |

**Decisión recomendada:** **Express** para servicios nuevos; migrar Core API a **Fastify** en fase 2 (opt-in `USE_FASTIFY=true` ya disponible).

Ver comparativa en [`DAKINIS-ESTRUCTURA-TEMP.md`](./DAKINIS-ESTRUCTURA-TEMP.md) §14.

---

## 4. Package manager

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| **pnpm (todo el ecosistema)** | Un lockfile, `workspace:*`, menos disco | Repos multi-git requieren coordinación |
| **npm por repo (actual)** | Simple, cada repo autónomo | Duplicación, versiones divergentes |

**Decisión:** **npm por repo** hasta monorepo raíz; **`platform/shared` ya usa pnpm**.

---

## 5. Observabilidad

| Componente | Opciones | Recomendación |
|------------|----------|---------------|
| Logs | Loki, Elastic, Railway logs | **JSON estructurado ya en Core/Auth** → Loki o Better Stack |
| Errores | Sentry, Rollbar | **Sentry** (free tier) con `SENTRY_DSN` |
| Uptime | Uptime Kuma, BetterStack | BetterStack si ya usas Railway |
| Métricas | Prometheus + Grafana | Prometheus cuando >10 servicios |

**Implementado:** `structured-logger.js` en Core y Auth.

**Guía:** [`docs/observability/README.md`](./observability/README.md)

---

## 6. Secrets

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| `.env` local + Railway vars | Simple | Sin rotación automática |
| Doppler / Vault / AWS SM | Rotación, auditoría | Setup inicial |

**Decisión:** Railway/Doppler en prod; **nunca** commitear `.env.dev`.

---

## 7. Engine extensible (Core)

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| Módulos hardcoded | Simple hoy | No marketplace ni white-label |
| **`registerModule()` registry** | Activar features por tenant/plan | Requiere cablear rutas al registry |

**Implementado:** `platform/core/shared/core/modules/registry.js` + bootstrap de módulos engine.

**Siguiente paso:** montar rutas API desde registry en lugar de `app.js` manual.

---

## 8. AkoeNet — escala realtime

| Fase | Arquitectura |
|------|--------------|
| **Ahora** | Monolito Server (REST + Socket.IO) |
| **>1k usuarios concurrentes** | Separar: chat WS gateway, uploads S3, notifications worker |
| **>10k** | Redis cluster, sharding por serverId |

**Decisión:** mantener monolito; documentar límites y plan de split.

---

## 9. CI/CD

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| Manual Railway | Rápido ahora | Sin preview, rollback lento |
| **GitHub Actions** | Tests + build en PR | Config por repo |

**Implementado:** CI ampliado (compose + build Core/AkoeNet).

**Pendiente:** deploy automático Railway/Vercel por rama.

---

## 10. Branding comercial

```
Dakinis Systems (empresa)
├── Dakinis One      → negocios locales (Core)
├── AkoeNet          → comunidades
└── StreamAutomator  → creadores
```

Compartido: auth, legal (`docs/legal/`), soporte `contacto@dakinis-systems.com`.

---

## Prioridades (orden)

1. ✅ Core → PostgreSQL (infra + query layer)
2. ✅ Refresh tokens IdP
3. ✅ Logs estructurados
4. ⏳ Migrar AkoeNet login al IdP
5. ⏳ Sentry + backups Postgres automáticos
6. ⏳ RBAC enforcement en APIs
7. ⏳ Rutas Core desde module registry
8. 🔮 Event bus, multi-region, marketplace

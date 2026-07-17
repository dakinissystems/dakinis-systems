# Dakinis — Onboarding desarrollador

> Primer día en el monorepo de control · julio 2026

---

## 1. Clonar repos

```powershell
git clone https://github.com/dakinissystems/dakinis-systems.git
cd dakinis-systems
```

Repos de producto (gitignored localmente) — ver [`GITHUB-ORG.md`](./GITHUB-ORG.md):

```powershell
# Ejemplo — ajustar rutas según tu máquina
git clone ... hub/
git clone ... platform/auth platform/auth
git clone ... platform/core platform/core
```

Script futuro: `scripts/setup-dev-clones.ps1` (pendiente).

---

## 2. Variables de entorno

| Archivo | Uso |
|---------|-----|
| [`docs/railway.env.example`](./railway.env.example) | Plantilla prod (sin secretos) |
| `docker/.env.example` | Stack local |

**Nunca** commitear `.env` con secretos.

---

## 3. Stack local (Docker)

```powershell
.\scripts\dev.ps1
```

Gateway local + servicios según `docker/compose.full.yml`. Ver [`docker/README.md`](../docker/README.md).

Servicios individuales:

```powershell
cd internal && npm install && npm run dev   # :4083
cd billing && npm run dev                   # :4080
cd DND && npm run dev                       # Tabletop
```

---

## 4. Railway (solo si tienes acceso)

- Proyecto Dakinis en Railway dashboard
- Cada servicio: Settings → Variables (ver [`OPERATIONS.md`](./OPERATIONS.md))
- Deploy: push a `main` del repo correspondiente
- Private DNS: `*.railway.internal`

---

## 5. Supabase

- Proyecto **Dakinis Production** (acceso restringido)
- SQL: **solo** archivos en `docs/supabase/migrations/` en orden [`RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md)
- **No** ejecutar SQL ad-hoc en prod sin revisión
- Conexión apps: pooler `:6543` + `pgbouncer=true`

---

## 6. Primer deploy (platform scaffold)

1. Cambio en `billing/` o `internal/`
2. PR en `dakinis-systems`
3. Merge → Railway auto-deploy del servicio
4. `GET /health` del servicio
5. Smoke si aplica: `.\scripts\smoke-*.ps1`

---

## 7. Primer PR — convenciones

| Tema | Regla |
|------|-------|
| Commits | Imperativo, enfocado en *why* |
| Scope | Cambio mínimo — no mezclar refactors |
| Docs | Estado → `STATUS.md` · arquitectura → `ARCHITECTURE.md` |
| SQL | Nueva migr. numerada + `RUN-ORDER.md` |
| Contratos | Actualizar `docs/contracts/` si cambia API |
| Packages | `node scripts/sync-shared-brand.mjs` si tocas DES |

---

## 8. Arquitectura (lectura obligatoria)

Orden sugerido (2–3 h):

1. [`WHY.md`](./WHY.md) — decisiones en prosa
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — capas + diagramas
3. [`OPERATIONS.md`](./OPERATIONS.md) — deploy y servicios Railway
4. [`adr/README.md`](./adr/README.md) — ADRs
5. [`STATUS.md`](./STATUS.md) — qué está roto hoy

---

## 9. Debug habitual

| Problema | Dónde mirar |
|----------|-------------|
| 502 gateway | [`OPERATIONS.md`](./OPERATIONS.md) § Runbook |
| Auth/JWT | Auth logs · `JWT_SECRET` igual en servicios |
| Hub vacío | Internal API · migr. Hub |
| Billing | Stripe webhook · [`OPERATIONS.md`](./OPERATIONS.md) § Runbook |
| Tests | `finanzas`: `npm test` (87 tests) |

Smokes: `scripts/smoke-prod-suite.ps1` (prod, con cuidado).

---

## 10. Ownership

Al tomar un servicio, actualizar Owner en [`STATUS.md`](./STATUS.md).

Equipos iniciales: **Platform** · **ERP** · **Finance** · **Social** · **Games** · **GTM**

---

## Checklist día 1

- [ ] `dakinis-systems` clonado
- [ ] Docker stack arranca
- [ ] `internal` health local OK
- [ ] Leídos ARCHITECTURE + STATUS + OPERATIONS
- [ ] Acceso Railway/Supabase solicitado si aplica
- [ ] Primer issue asignado con Owner claro

---

*¿Dudas de producto/UX?* → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md)

# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · julio 2026  
> Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Plan → [`ROADMAP.md`](./ROADMAP.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Go-Live Score

```
████████░░  82%
```

| Área | Score | Bloqueador |
|------|-------|------------|
| Billing | 80% | E2E live sin cliente real |
| Hub | 95% | Mi día DB + screenshot landing |
| Core | 90% | UX piloto restaurante |
| AI | 100% | — |
| Support / ops | 70% | Sin staging · backups auto |
| Security | 92% | Security Advisor post-034 |

**Piloto comercial:** 🔴 0 clientes de pago

---

## KPIs del proyecto

| Métrica | Valor | Notas |
|---------|-------|-------|
| Productos | 5 | Core, LifeFlow, AkoeNet, StreamAutomator, Tabletop |
| Repos GitHub | ~18 | Ver [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md) |
| Servicios Railway | 11+ | Gateway, platform, productos |
| Workers activos | 4 | AI, Knowledge, Notifications (parcial), SA |
| Clientes de pago | 0 | Objetivo ago 2026 |
| Tenants prod | 1+ | demo + provision manual |
| Usuarios IdP | 4+ | smoke / demo + `velezcampeon_88@hotmail.com` |
| MRR | 0 € | — |
| Tiempo deploy medio | ~6 min | Dockerfile services |
| React Doctor (media apps) | ~92% | LF/TT 100 · SA 61 |
| Último release platform | Jul 2026 | Internal API v0.3.1+ |
| Último backup auto | ⬜ | `BACKUP_DATABASE_URL` pendiente |

Métricas negocio → actualizar en esta sección (archivo `KPIS.md` eliminado 17 jul 2026)

---

## Catálogo de servicios (resumen)

URLs y deploy → [`OPERATIONS.md`](./OPERATIONS.md) § Railway.

| Servicio | Madurez | Owner | Versión | Pendiente clave |
|----------|---------|-------|---------|-----------------|
| Gateway | 🟢 Production | Platform | nginx 1.27 | — |
| Auth | 🟢 Production | Platform | — | — |
| Hub | 🟡 Beta | Platform | v0.2.1+ | Mi día DB · demo OS |
| Billing | 🟡 Beta | Platform | v0.2.0 | **E2E live** |
| Notifications | 🟠 MVP | Platform | v0.3.1 | Resend live |
| Search | 🟠 MVP | Platform | — | pgvector |
| Knowledge | 🟠 MVP | Platform | — | ingest masivo |
| AI | 🟢 Production | Platform | — | costes/workspace |
| Internal API | 🟡 Beta | Platform | v0.3.1+ | hub-dashboard sin stub |
| Core (Dakinis One) | 🟡 Beta | ERP | — | UX piloto |
| LifeFlow | 🟢 Production | Finance | — | SQLite → PG |
| AkoeNet | 🟡 Beta | Social | client v1.5.33 | worker `@AI` (código; deploy Railway) |
| StreamAutomator | 🟡 Beta | Social | — | React Doctor |
| Tabletop | 🟠 MVP | Games | — | SQLite → Supabase |
| Landing | 🟢 Production | GTM | — | screenshot Hub real |
| Redis / BullMQ | 🟡 Beta | Platform | — | workers Assistant |

---

## Supabase prod

| Fase | Migraciones | Estado |
|------|-------------|--------|
| A–B | `000`–`015` | ✅ |
| C | `016`–`019` | ✅ prod (smoke `stub=false`) |
| C+ | `027`–`029` | ✅ prod (`hub.mi_dia` ON) |
| C++ | `048`–`049` | ✅ automation metrics + `stream.automation_runs` (16 jul) |
| D | `020`–`026`, `024` | ✅ |
| D+ | `030` | ✅ LifeFlow ↔ IdP (`app_user_links` + hub-sso velez → `usr_da09193c-ae6`) |
| E | `031` | ✅ workspace admin |
| F | `032`–`033` | ✅ AkoeNet Assistant |
| G | `034` (RLS + `media`) | ✅ jul 2026 |
| H | `035`–`036` | ✅ Workspace addons + capabilities |

Orden → [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md)

---

## Despliegue pendiente (código listo)

| # | Sistema | Commit | Estado |
|---|---------|--------|--------|
| 1 | dakinis-internal-api | `b1c5910` | ✅ invite accept live (16 jul) |
| 2 | dakinis-hub | `027e8b6` | ✅ `/invite/:token` live |
| 3 | streamautomator-api | `e73b3d7` | ✅ `/api/automation/runs` + migración `AutomationRuns` |
| 4 | streamautomator-frontend | `e73b3d7` | ✅ historial ejecuciones AutomationPage |
| 5 | Supabase | `049` + seed score | ✅ `lifeflow_score=72` velez |
| 7 | Billing | `9ad3ef1` + SA probe | ✅ LiveCheckout UNIFICADO (user 20 + platformAuthSub) |

**Billing (16 jul):** `smoke-billing-unified-sa.ps1 -LiveSync -LiveCheckout` ✅ — login velezcampeon → `saUserId=20`, `Checkout UNIFICADO`. Causa LEGACY anterior: JWT era user 17 sin enlace. Siguiente: pago test / webhook → `billing.subscriptions` + fan-out license-sync.

**LifeFlow 030 (16 jul):** tabla `app_user_links` aplicada ✅; hub-sso → `usr_da09193c-ae6` ↔ `a1000088-…`. Finance-api `14171c2` en `origin/main` (rebind upsert) — verificar imagen Railway si SSO falla. Smokes: `finance-api.dakinissystems.com`.

**Código listo en prod (invite / SA / SSO) — 16 jul:** ver tabla § Despliegue. Scripts: `pilot-workspace-invite.ps1`, `docs/scripts/seed_lifeflow_score_velezcampeon.sql`.

**Arquitectura (17 jul):**
- Fase A ✅ — `@dakinis/domain`, PlatformContext, CommandBus middleware, CachedQuery, invite facade
- Fase B ✅ — SDK modular (`sdk-*`), cache tags, DTO gen v1, QueryMap, rate-limit Gateway (código; **redeploy edge pendiente**)
- Fase C parcial ✅ — outbox invite→timeline; Director/AutomationRun SM; invite create/accept vía bus
- Quick wins ✅ — `background.enqueue`; domain tests en CI; SDK migration guide
- **En curso (código):** cutover SA restante (outbox/billing) · DTO gen v2
- **Listo (17 jul, deploy pendiente):** Hub `platform.hub.dashboard` · worker Internal `worker:assistant` (`dakinis.ai` + `background.enqueue`) · SA `getPlatform()` en copilot
- Diferido — automation nodes, OTel, billing E2E profundo

Smokes: `scripts/smoke-hub.ps1` · `scripts/deploy-hub-automation.ps1 -RunSmoke`

---

## Definición de Done (hitos)

Criterios objetivos — marcar en [`ROADMAP.md`](./ROADMAP.md) al cumplir.

### Billing E2E Live

- [ ] `smoke-billing-e2e.ps1` OK
- [ ] Checkout Stripe test completo
- [ ] Webhook prod **200**
- [ ] `billing.subscriptions` actualizado en Supabase
- [ ] Plan reflejado en Core (`business.plan`)
- [ ] Degrade: `smoke-billing-degraded.ps1` OK
- [ ] Restore tras pago OK
- [ ] Portal Billing desde Hub `/admin` OK
- [ ] Logs sin error 5xx en webhook 24h

### Hub SSO E2E

- [x] `smoke-hub-sso-products.ps1` 3/3 productos (SA + AkoeNet + LifeFlow `finance-api`) — 16 jul 2026
- [ ] JWT válido en Core, LifeFlow, AkoeNet
- [ ] Logout / re-login OK

### Primer cliente piloto

- [ ] Workspace provisionado (`031`)
- [ ] ≥1 usuario invitado y aceptado (`POST /workspaces/invites/:token/accept` + Hub `/invite/:token`)
- [ ] Demo Hub → Core completada en reunión
- [ ] Feedback documentado
- [ ] Uso real ≥2 sesiones/semana durante 2 semanas

### Hub Mi día (DB)

- [x] migr. `016`–`019` + `027`–`029` en prod
- [x] `hub.v1_get_dashboard` sin stub (smoke `stub=false`)
- [ ] Widgets con datos reales ≥2 productos (piloto)

### AkoeNet Assistant Fase 1

- [x] migr. `032`–`033`
- [x] Vars Railway backend (AI + webhook)
- [x] Path sync `@AI` → canal (`processAssistantAiAsk`)
- [ ] Worker BullMQ `dakinis.ai` desplegado en Railway (`npm run worker:assistant`)
- [ ] `@AI` respuesta en canal &lt;30s verificado en prod
- [ ] Toggle módulos persiste (E2E)

---

## Smokes prod

| Script | Requiere |
|--------|----------|
| `smoke-prod-suite.ps1` | probes · `-E2E` + creds |
| `smoke-billing-e2e.ps1` | creds o `INTERNAL_API_KEY` |
| `smoke-billing-degraded.ps1` | `INTERNAL_API_KEY` + `DAKINIS_BUSINESS_ID` |
| `smoke-ai.ps1` | `DAKINIS_AI_SERVICE_KEY` |
| `smoke-hub-search-query.ps1` | creds Core |
| `smoke-notifications.ps1` | creds IdP |
| `smoke-knowledge-search-sync.ps1` | `DAKINIS_INTERNAL_SERVICE_KEY` |

---

## Prioridad por capacidad (negocio)

| Capacidad | Componentes | Estado |
|-----------|-------------|--------|
| **Cobrar** | Billing → Stripe → Hub `/admin` → Gateway → Auth | 🔴 E2E |
| **Invitar equipo** | Hub → Notifications → Internal API → `031` | 🟡 accept + enlace listos |
| **Usar IA** | AI → Knowledge → BullMQ → Assistant | 🟡 workers |
| **Operar negocio** | Core → Hub widgets | 🟡 |
| **Comunidad** | AkoeNet → Assistant | 🟡 |

Detalle temporal → [`ROADMAP.md`](./ROADMAP.md)

---

## Riesgos

| ID | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| R1 | Sin staging | Alto | Espejo Railway Q3 · smokes con cuidado |
| R2 | Backups no auto | Crítico | `BACKUP_DATABASE_URL` + workflow |
| R3 | Billing sin cliente real | Alto | E2E + piloto jul–ago |
| R4 | Bus factor (1 dev) | Alto | Onboarding · hire Q4 |
| R5 | SQLite LF/Tabletop | Medio | 030 links ✅; cutover goals/tx pendiente |
| R6 | Monitorización parcial | Medio | Sentry ago |
| R7 | migr. manual Supabase | Medio | `meta.migration_history` |
| R8 | Workers BullMQ parciales | Medio | Redeploy Assistant |
| R9 | Stripe webhook mal config | Alto | [`OPERATIONS.md`](./OPERATIONS.md) § Runbook |
| R11 | RLS sin política | Medio | migr. `034` ✅ — revisar Security Advisor periódicamente |

**Producto:** Hub no debe percibirse como launcher — priorizar Mi día, acciones recomendadas y Copilot (ver [`archive/HUB-WORKSPACE.md`](./archive/HUB-WORKSPACE.md)).

**Docs (17 jul 2026):** limpieza — TEMP/duplicados borrados; históricos en [`archive/`](./archive/); networking canónico → [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md). AkoeNet desktop **1.5.33** (updater CI + tag).

**Pendiente código / ops (17 jul) — priorizado:**
1. Redeploy Gateway (rate limits) + piloto invite real
2. Deploy worker Internal `worker:assistant` (cola `dakinis.ai`)
3. Cutover SA `dakinisInternalFetch` → SDK (gradual)
4. Billing E2E cuando haya cliente (dry-run semanal OK)
5. DTO gen v2 / OTel / automation nodes — solo con demanda

Incidencia prod → [`OPERATIONS.md`](./OPERATIONS.md) § Runbook.

---

## Automatización de este documento

Partes generables → [`scripts/generate-docs-status.mjs`](../scripts/generate-docs-status.mjs):

- Versiones desde `package.json` de scaffolds
- Migraciones desde `meta.migration_history` (cuando exista en prod)
- Health desde endpoints públicos
- React Doctor desde CI (futuro)

**Manual obligatorio:** clientes, MRR, piloto, decisiones de prioridad.

---

*Pregunta guía: ¿Qué necesita un cliente para pagar por Dakinis este mes?*

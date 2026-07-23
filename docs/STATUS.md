# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · julio 2026  
> Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Plan → [`ROADMAP.md`](./ROADMAP.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Go-Live Score

```
█████████░  90%
```

| Área | Score | Bloqueador |
|------|-------|------------|
| Billing | 80% | E2E live sin cliente real |
| Hub | 95% | Mi día DB + screenshot landing |
| Core | 90% | UX piloto restaurante |
| AI | 100% | — |
| Support / ops | 98% | Uptime externo + alerta |
| Security | 99% | Sin GHAS · Gitleaks en repos clave · RL `/api/` · [`SECURITY-OPS.md`](./SECURITY-OPS.md) |

**Piloto comercial:** 🟡 1 cliente fijo gratis (Heladería Copérnico) · 0 de pago

---

## Qué falta (23 jul 2026)

### Consola (tú) — no automatizable
| Ítem | P | Estado | Cómo |
|------|---|--------|------|
| MFA GitHub / Railway / Supabase / Stripe | P0 | ✅ 23 jul | — |
| Cloudflare WAF + Full Strict + Auth RL | P1 | ✅ 23 jul | Dashboard · falta RL `/api/` si plan |
| GitHub Advanced Security / Dependabot / CodeQL / Push Protection | P1 | ✅ 23 jul | Org + Core verificado |
| Secret Scanning GitHub (privados) | P1 | ⏸ sin GHAS · ✅ Gitleaks | CLI workflow en systems/core/auth/SA/akoenet · sync `scripts/sync-gitleaks-workflow.mjs` |
| Dependabot / CodeQL (gratis) | P1 | 🟡 ~13/16 | Faltan hub · search |
| Health checks externos + alerta email/Slack | P1 | ⬜ | Better Stack / UptimeRobot / CF Health Checks |
| Auditoría permisos admin | P0 | ⬜ | Trimestral GH · Railway · Supabase · Stripe |

### Código / deploy
| Ítem | Estado |
|------|--------|
| Uptime probes GH Actions | 🟡 workflow listo · falta **push** monorepo |
| Redeploy SA API (Discord fix + `getPlatform`) | ⬜ push/redeploy |
| Billing E2E live (Stripe) | ⬜ cuando haya pago real |
| Invite piloto + demo reunión | ⬜ ops |

### Cerrado recientemente
**Consola seguridad 23 jul** (MFA · CF Full Strict/WAF/Auth RL · GH Advanced Security) · Backups #61 · restore test · RLS `052`–`054` · Gateway rate limits · **Heladería Copérnico** (carta editable + floor/kitchen/inventory) · AppGuard bearer `/api/me`

---

## KPIs del proyecto

| Métrica | Valor | Notas |
|---------|-------|-------|
| Productos | 5 | Core, LifeFlow, AkoeNet, StreamAutomator, Tabletop |
| Repos GitHub | ~18 | Ver [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md) |
| Servicios Railway | 11+ | Gateway, platform, productos |
| Workers activos | 4 | AI, Knowledge, Notifications (parcial), SA |
| Clientes de pago | 0 | Objetivo ago 2026 |
| Tenants prod | 2+ | demo + **heladeria-copernico** (pro free) |
| Usuarios IdP | 4+ | smoke / demo + `velezcampeon_88@hotmail.com` |
| MRR | 0 € | — |
| Tiempo deploy medio | ~6 min | Dockerfile services |
| React Doctor (media apps) | ~92% | LF/TT 100 · SA 61 |
| Último release platform | 23 jul 2026 | Gateway rate limits live · Core menú PATCH + inventory stubs · SA getPlatform cutover (pendiente push) |
| Último backup auto | ✅ | Workflow `Postgres backup` #61 · 22 jul 2026 · secret OK |
| Último restore test | ✅ | 22 jul 2026 · `scripts/restore-postgres-test.mjs` · 79 tablas `public` · 21 schemas |
| Dependabot / audit CI | ✅ | `.github/dependabot.yml` + `npm audit` en CI |
| Security headers (edge) | ✅ | HSTS · X-Frame-Options · nosniff (verificado prod) |

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
| AkoeNet | 🟡 Beta | Social | client v1.5.33 | worker `@AI` online (`dakinis.ai`) |
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
| F+ | `050`–`054` | ✅ Gamificación + Hub XP · RLS public gaps · lockdown `rls_auto_enable` (22 jul) |
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
- Fase B ✅ — SDK modular (`sdk-*`), cache tags, DTO gen v1, QueryMap, rate-limit Gateway (**redeploy edge ✅ 23 jul**)
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

- [x] Workspace provisionado (`heladeria-copernico` · plan pro · 23 jul)
- [x] Owner Hub: `christiandvillar@gmail.com` (member activo)
- [x] Core business + menú seed 24 ítems (cartas Montaditos/Pizzas/Empanadas/Heladería)
- [x] Admin carta: `PATCH /api/tenant/restaurant/menu` (precios + alta manual) · floor GET/PATCH · inventory stubs
- [ ] ≥1 usuario invitado del cliente (staff Copérnico) vía invite
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
- [x] Worker BullMQ `dakinis.ai` desplegado (`dakinis-internal-assistant-worker` · 20 jul)
- [x] `@AI` respuesta en canal &lt;30s verificado en prod (23 jul · `latencyMs=2487` · smoke enqueue server=1)
- [x] Toggle módulos persiste (E2E · `scripts/smoke-assistant-modules.mjs` · 23 jul)

### AkoeNet Gamificación MVP

- [x] Motor XP + ledger idempotente + cooldowns (`levels.service.js`)
- [x] Reacciones → XP al autor · reputación · misiones diarias · AK Coins al level-up
- [x] API `/servers/:id/levels/*` + panel Ajustes → Niveles
- [x] Migración Server `1735000000000` aplicada en prod (20 jul)
- [x] Redeploy akoenet-backend + client + internal (20 jul)
- [x] Migr. Supabase `050` aplicada (mirror `akoenet.member_xp`)
- [x] Módulo `levels` activado en servidor piloto (`server_id=1`, 20 jul)
- [x] Botón ✔️ reputación en mensajes (client redeploy SUCCESS · `8652143`)

---

## Smokes prod

| Script | Requiere |
|--------|----------|
| `smoke-prod-suite.ps1` | probes · `-E2E` + creds |
| `smoke-billing-e2e.ps1` | creds o `INTERNAL_API_KEY` |
| `smoke-billing-degraded.ps1` | `INTERNAL_API_KEY` + `DAKINIS_BUSINESS_ID` |
| `smoke-akoenet-ai-ask.mjs` | Railway env Internal (`DATABASE_URL` + service key) |
| `smoke-stream-started.mjs` | Railway env Internal |
| `smoke-assistant-modules.mjs` | Railway env Internal |
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
| R2 | Backups auto | Mitigado | Workflow diario OK (#61) · restore test ✅ 22 jul |
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

**Pendiente código / ops (23 jul) — priorizado:**
1. **Secrets en git** — sin GHAS · **Gitleaks** en CI (systems/core/auth/SA/akoenet) · ampliar con `docs/templates/gitleaks.yml` · Dependabot ~13/16
2. Cloudflare RL `/api/` (si plan) + **uptime externo** con alerta
3. Auditoría permisos admin (trimestral)
4. Push monorepo (`uptime-probes.yml`) + redeploy SA API
5. Billing E2E cuando haya primer euro
6. Invite/demo reunión con Copérnico (cliente ya provisionado)

**Productos (17 jul higiene):** Core unifica `DAKINIS_INTERNAL_*` + sync `shared-ai`; LifeFlow normaliza `DAKINIS_AUTH_URL` → `/auth/me` (hub-sso + platform-exchange).

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

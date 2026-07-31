# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · julio 2026  
> Sistemas → [`SYSTEMS.md`](./SYSTEMS.md) · Plan → [`ROADMAP.md`](./ROADMAP.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Seguridad → [`SECURITY.md`](./SECURITY.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Go-Live Score

```
█████████░  91%
```

| Área | Score | Bloqueador |
|------|-------|------------|
| Billing | 80% | E2E live sin cliente real |
| Hub | 100% | DES v1.1 · system theme · HC |
| Core | 98% | A3 cerrado · escaneo stock rápido |
| LifeFlow | 98% | hex UI → tokens · system theme |
| AkoeNet | 100% | dakinis-shell marker · Nexora intacto |
| AI | 100% | — |
| Support / ops | 99% | UptimeRobot 7 monitores ✅ |
| Security | 99% | Sin GHAS · Gitleaks · CF RL · [`SECURITY.md`](./SECURITY.md) |

**Piloto comercial:** 🟡 1 cliente fijo gratis (Heladería Copérnico) · 0 de pago

---

## Pendientes accionables

| Ítem | Estado |
|------|--------|
| Invite staff + demo reunión Copérnico | ⬜ ops (bridge invite→Core en prod) |
| Billing E2E live (Stripe) | ⬜ cuando haya pago real |
| Dependabot / CodeQL repos restantes | 🟡 tabletop / search |
| MFA Cloudflare (perfil) | ⬜ ver [`SECURITY.md`](./SECURITY.md) |
| Supabase: cutover LifeFlow goals/tx · `015b` AkoeNet | diferido — Issues / ROADMAP |

Histórico jul (consola, PRs, KPIs densos) → [`archive/CHANGELOG-ops-2026-07.md`](./archive/CHANGELOG-ops-2026-07.md).

---

## Servicios (resumen)

URLs → [`OPERATIONS.md`](./OPERATIONS.md) · mapa → [`SYSTEMS.md`](./SYSTEMS.md).

| Servicio | Madurez | Pendiente clave |
|----------|---------|-----------------|
| Gateway | 🟢 | — |
| Auth | 🟢 | — |
| Hub | 🟡 | Piloto UX / widgets WIP local |
| Billing | 🟡 | **E2E live** |
| Notifications | 🟠 | Resend live · worker |
| Search | 🟠 | Worker · pgvector |
| Knowledge | 🟠 | Ingest masivo |
| AI | 🟢 | Costes/workspace |
| Internal API | 🟡 | — (invite→Core bridge live 28 jul) |
| Core | 🟡 | UX piloto · demo Copérnico |
| LifeFlow | 🟢 | SQLite → PG (parcial) · sin Gmail import |
| AkoeNet | 🟡 | Verificar Media en prod |
| StreamAutomator | 🟡 | React Doctor (WIP local) |
| Tabletop | 🟠 | SQLite → Supabase |
| Landing | 🟢 | — (`hub.png` + Hub-first en prod 28 jul) |

**Supabase prod:** fases A–H aplicadas (`000`–`036`, `048`–`054`, …). Orden → [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md).

---

## Definición de Done (abreviado)

### Billing E2E Live

- [ ] Checkout Stripe + webhook prod **200**
- [ ] `billing.subscriptions` + plan en Core
- [ ] Degrade / restore OK
- [ ] Portal Hub `/admin`

### Piloto Copérnico

- [x] Workspace + menú seed + admin carta/floor/inventory
- [x] Hub invite → `core.tenant_memberships` (accept bridge en Internal `ensureCoreTenantMembership` · prod 28 jul)
- [ ] Invite staff + demo reunión + feedback (ops)

### Hub SSO / Mi día

- [x] SSO 3/3 productos (16 jul) · Mi día sin stub
- [x] Widgets con datos reales ≥2 productos (LifeFlow + Stream; seed `docs/scripts/seed_hub_mi_dia_widgets_velezcampeon.sql` · smoke `scripts/smoke-hub.ps1` asserts ≥2)
- [x] Screenshot landing (`apps/landing/public/showcase/hub.png` — Mi día con KPIs · redeploy 28 jul)
- [x] Login: redirect sesión con `<Navigate>` (sin `navigate()` en render · Hub prod 28 jul)

Smokes: `smoke-prod-suite.ps1` · `smoke-billing-e2e.ps1` · `smoke-hub.ps1` · ver [`OPERATIONS.md`](./OPERATIONS.md).

---

## Riesgos (top)

| ID | Riesgo | Mitigación |
|----|--------|------------|
| R1 | Sin staging | Espejo Railway Q3 |
| R3 | Billing sin cliente real | E2E + piloto |
| R4 | Bus factor (1 dev) | Hire Q4 |
| R9 | Stripe webhook mal config | [`RUNBOOKS/incidents.md`](./RUNBOOKS/incidents.md) |

---

*Última actualización: 31 jul 2026 (DES v1.1 · HC QA · Hub system theme).*  
*Design System → [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).*
*Pregunta guía: ¿Qué necesita un cliente para pagar por Dakinis este mes?*  
*Narrativa TEMP → [`DAKINIS-SISTEMA-ACTUAL-TEMP.md`](./DAKINIS-SISTEMA-ACTUAL-TEMP.md).*

# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · julio 2026  
> Sistemas → [`SYSTEMS.md`](./SYSTEMS.md) · Plan → [`ROADMAP.md`](./ROADMAP.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Seguridad → [`SECURITY.md`](./SECURITY.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Go-Live Score

```
█████████░  90%
```

| Área | Score | Bloqueador |
|------|-------|------------|
| Billing | 80% | E2E live sin cliente real |
| Hub | 95% | Screenshot landing · widgets piloto |
| Core | 90% | UX piloto restaurante |
| AI | 100% | — |
| Support / ops | 99% | UptimeRobot 7 monitores ✅ |
| Security | 99% | Sin GHAS · Gitleaks · CF RL · [`SECURITY.md`](./SECURITY.md) |

**Piloto comercial:** 🟡 1 cliente fijo gratis (Heladería Copérnico) · 0 de pago

---

## Pendientes accionables

| Ítem | Estado |
|------|--------|
| Redeploy SA API (`getPlatform` en `main`) | ⬜ confirmar Railway |
| Billing E2E live (Stripe) | ⬜ cuando haya pago real |
| Invite piloto + demo reunión Copérnico | ⬜ ops |
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
| Hub | 🟡 | Mi día widgets piloto · screenshot |
| Billing | 🟡 | **E2E live** |
| Notifications | 🟠 | Resend live · worker |
| Search | 🟠 | Worker · pgvector |
| Knowledge | 🟠 | Ingest masivo |
| AI | 🟢 | Costes/workspace |
| Internal API | 🟡 | — |
| Core | 🟡 | UX piloto |
| LifeFlow | 🟢 | Suscripciones F1–F4 ✅ · siguiente: Open Banking (F5) · SQLite → PG (parcial) |
| AkoeNet | 🟡 | — |
| StreamAutomator | 🟡 | Redeploy + React Doctor |
| Tabletop | 🟠 | SQLite → Supabase |
| Landing | 🟢 | Screenshot Hub real |

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
- [ ] Invite staff + demo reunión + feedback

### Hub SSO / Mi día

- [x] SSO 3/3 productos (16 jul) · Mi día sin stub
- [ ] Widgets con datos reales ≥2 productos

Smokes: `smoke-prod-suite.ps1` · `smoke-billing-e2e.ps1` · ver [`OPERATIONS.md`](./OPERATIONS.md).

---

## Riesgos (top)

| ID | Riesgo | Mitigación |
|----|--------|------------|
| R1 | Sin staging | Espejo Railway Q3 |
| R3 | Billing sin cliente real | E2E + piloto |
| R4 | Bus factor (1 dev) | Hire Q4 |
| R9 | Stripe webhook mal config | [`RUNBOOKS/incidents.md`](./RUNBOOKS/incidents.md) |

---

*Última actualización: 25 jul 2026 (docs cleanup v1).*  
*Pregunta guía: ¿Qué necesita un cliente para pagar por Dakinis este mes?*

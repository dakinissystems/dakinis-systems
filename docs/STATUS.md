# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · **8 ago 2026**  
> Sistemas → [`SYSTEMS.md`](./SYSTEMS.md) · Dominios Core → [`architecture/README.md`](./architecture/README.md) · Plan → [`ROADMAP.md`](./ROADMAP.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Seguridad → [`SECURITY.md`](./SECURITY.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Go-Live Score

```
█████████░  90%
```

| Área | Score | Bloqueador |
|------|-------|------------|
| Billing | 80% | E2E live sin cliente real |
| Hub | 90% | Screenshot landing · widgets con datos reales |
| Core | 90% | Piloto hospitality · confirmar CRM `057` en prod |
| AI | 95% | Costes / cuotas por workspace |
| Support / ops | 99% | UptimeRobot OK · ver [`OPERATIONS.md`](./OPERATIONS.md) |
| Security | 99% | Gitleaks · CF RL · [`SECURITY.md`](./SECURITY.md) |

**Piloto comercial:** 🟡 1 cliente fijo gratis (Heladería Copérnico) · **0 de pago**

---

## Core / Hospitality (código en branch)

| Ítem | Estado |
|------|--------|
| Shell por tareas + TPV | 🟢 en branch Core |
| Delivery Channel Bus + Registry + idempotencia | 🟢 en branch (Glovo/Uber = stubs partner) |
| Caja: dinero inicio de día (localStorage) | 🟢 en branch |
| i18n: sin claves `ns.key` en UI | 🟢 en branch |
| Docs arquitectura por dominios | 🟢 |
| CRM API v1 + migración `057` | 🟡 confirmar SQL en prod |
| System Health unificado | ⬜ diseño |
| SSE/WS pulse | ⬜ roadmap |
| Glovo/Uber API partner real | ⬜ stubs |

Changelog → [`architecture/changelog/hospitality-2026-08.md`](./architecture/changelog/hospitality-2026-08.md).

**Branches de trabajo:** Core `feat/restaurant-stock-ops-alerts` · Docs `chore/ops-alert-env-and-ai-usage` (no sustituyen `main` hasta merge).

---

## Pendientes accionables

| Ítem | Estado |
|------|--------|
| Merge / redeploy Core hospitality + CRM | ⬜ |
| Confirmar `057` (y `055`/`056` si aplica) en Supabase prod | ⬜ |
| Billing E2E live (Stripe) | ⬜ cuando haya pago real |
| Invite piloto + demo Copérnico | ⬜ ops |
| Redeploy SA API (`getPlatform` en `main`) | ⬜ Railway |
| MFA Cloudflare (perfil) | ⬜ [`SECURITY.md`](./SECURITY.md) |

Histórico jul → [`archive/CHANGELOG-ops-2026-07.md`](./archive/CHANGELOG-ops-2026-07.md).

---

## Servicios (resumen)

URLs → [`OPERATIONS.md`](./OPERATIONS.md) · mapa → [`SYSTEMS.md`](./SYSTEMS.md).

| Servicio | Madurez | Pendiente clave |
|----------|---------|-----------------|
| Gateway | 🟢 | — |
| Auth | 🟢 | — |
| Hub | 🟡 | Widgets datos reales · screenshot landing |
| Billing | 🟡 | **E2E live** |
| Notifications | 🟠 | Resend live · worker |
| Search | 🟠 | Worker · pgvector |
| Knowledge | 🟠 | Ingest masivo |
| AI | 🟢 | Costes / workspace |
| Internal API | 🟡 | — |
| Core | 🟡 | Merge hospitality · CRM `057` prod |
| LifeFlow | 🟢 | SQLite → PG (parcial) |
| AkoeNet | 🟡 | Módulos Assistant (scaffolds ≠ todos live) |
| StreamAutomator | 🟡 | Redeploy |
| Tabletop | 🟠 | SQLite → Supabase |
| Landing | 🟢 | Screenshot Hub real |

**Supabase prod:** ver flags en [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md). No asumir migraciones de branch como aplicadas.

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

- [x] SSO productos · Mi día operativo (`stub=false` en smoke)
- [ ] Widgets con datos reales ≥2 productos

Smokes → [`OPERATIONS.md`](./OPERATIONS.md).

---

## Riesgos (top)

| ID | Riesgo | Mitigación |
|----|--------|------------|
| R1 | Sin staging | Espejo Railway Q3 |
| R3 | Billing sin cliente real | E2E + piloto |
| R4 | Bus factor (1 dev) | Hire Q4 |
| R9 | Stripe webhook mal config | [`RUNBOOKS/incidents.md`](./RUNBOOKS/incidents.md) |

---

*Última actualización: 8 ago 2026.*  
*Pregunta guía: ¿Qué necesita un cliente para pagar por Dakinis este mes?*

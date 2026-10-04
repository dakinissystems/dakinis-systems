# Dakinis — Estado actual

> **Fuente canónica de estado** · actualizar al cerrar hitos · **3 oct 2026**  
> Sistemas → [`SYSTEMS.md`](./SYSTEMS.md) · Narrativa → [`company/WHAT-IS-DAKINIS.md`](./company/WHAT-IS-DAKINIS.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Seguridad → [`SECURITY.md`](./SECURITY.md)

**Leyenda madurez:** 🟢 Production · 🟡 Beta · 🟠 MVP · ⚪ Experimental

---

## Dual score (no confundir)

| Métrica | Score | Pregunta |
|---------|-------|----------|
| **Technical Readiness** | ~90% | ¿La plataforma está levantada y coherente? |
| **Commercial Readiness** | ~55% | ¿Un negocio real opera 30 días y puede pagar sin ti? |

```
Technical   █████████░  90%
Commercial  █████░░░░░  55%
```

| Área técnica | Score | Bloqueador comercial |
|--------------|-------|----------------------|
| Billing | 80% tech | E2E live + cliente de pago |
| Hub | 90% tech | Attention operable · narrativa Landing |
| Core | 92% tech | Piloto Copérnico feedback · multi-location demo |
| AI | 95% tech | Cuotas workspace · tool-calling gated |
| Ops / Security | 99% / 8 | Secrets fuera de docs ✅ · MFA CF ⬜ · staging ⬜ |

**Piloto:** 🟡 Heladería Copérnico (gratis) · **0 de pago**  
**Golden Path:** Landing → Hub → Dakinis One → valor → Billing (ver WHAT-IS-DAKINIS).

---

## Core / Hospitality

| Ítem | Estado |
|------|--------|
| Shell por tareas + TPV | 🟢 en `main` · redeployed |
| Delivery Channel Bus + Registry + idempotencia | 🟢 (Glovo/Uber = stubs partner) |
| Caja: dinero inicio de día (localStorage) | 🟢 |
| i18n: sin claves `ns.key` en UI | 🟢 |
| Docs arquitectura por dominios | 🟢 (PR docs → `main`) |
| CRM API v1 + migración `057` | 🟢 SQL prod ✅ · API en prod |
| Migraciones `055` / `056` / `057` / `058` | ✅ aplicadas en Supabase prod |
| System Health unificado | ⬜ diseño |
| SSE/WS pulse | ⬜ roadmap |
| Glovo/Uber API partner real | ⬜ stubs |

Changelog → [`architecture/changelog/hospitality-2026-08.md`](./architecture/changelog/hospitality-2026-08.md).

**Shipped:** Core `feat/restaurant-stock-ops-alerts` → `main` (ago 2026). Docs branch pendiente de PR (branch protegida).

---

## Pendientes accionables

| Ítem | Estado |
|------|--------|
| Merge / redeploy Core hospitality + CRM | ✅ |
| Migraciones `055`/`056`/`057`/`058` Supabase prod | ✅ |
| Merge docs ADRs / STATUS → `main` (PR) | ✅ |
| Org → Venture → Location (ADR-016 / mig 058) | ✅ SQL prod · código Hub/Internal pushed · seed Calle Brava ⬜ |
| Dominios CF + Google Workspace (Calle Brava / Ármala) | ❌ no contratado · **verificar disponibilidad primero** → [`RUNBOOKS/google-workspace-domains.md`](./RUNBOOKS/google-workspace-domains.md) |
| Billing E2E live (Stripe) | ⬜ cuando haya pago real |
| Invite piloto + demo Copérnico | ⬜ ops |
| Redeploy SA API (`getPlatform` + security) | ✅ Railway |
| MFA Cloudflare (perfil) | ⬜ [`SECURITY.md`](./SECURITY.md) |

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
| Core | 🟡 | Piloto Copérnico · System Health |
| LifeFlow | 🟢 | SQLite → PG (parcial) |
| AkoeNet | 🟡 | Módulos Assistant (scaffolds ≠ todos live) |
| StreamAutomator | 🟡 | Dependabot / cuotas |
| Tabletop | 🟠 | SQLite → Supabase |
| Landing | 🟢 | Screenshot Hub real |

**Supabase prod:** ver flags en [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md). `055`/`056`/`057` ✅ (ago 2026) · `058` ✅ (20 sep 2026).

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

## Próximo foco (comercial)

1. Copérnico E2E: invite staff + operación + feedback  
2. Billing E2E live (checkout → webhook → plan)  
3. Hub Mi día con datos/acciones reales (≥2 productos)  
4. Landing: Golden Path + «Qué es Dakinis» en ≤30 s  
5. Staging mínimo + smoke E2E  

Narrativa → [`company/WHAT-IS-DAKINIS.md`](./company/WHAT-IS-DAKINIS.md) · Messaging → [`company/MESSAGING.md`](./company/MESSAGING.md).

---

*Última actualización: 3 oct 2026.*  
*Pregunta guía: ¿Puede un restaurante real usar Dakinis 30 días y pagar sin que intervengas?*

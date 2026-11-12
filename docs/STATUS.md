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
| Migración `059` hospitality (floor/menu/delivery) | ✅ aplicada en Supabase el 12 nov 2026 |
| Migración `060` fiscal VERI*FACTU base | ✅ SQL en Supabase el 12 nov 2026. Core `1c67ec5` en Railway desde las 19:03 CET. No es un SIF certificado. Falta recorrer Config → Fiscal ([runbook](./RUNBOOKS/fiscal-verifactu.md)) |
| Migración `062` audit append-only | ✅ SQL en Supabase el 12 nov 2026. `UPDATE` y `DELETE` en `meta.audit_logs` fallan por trigger. El rol de la aplicación no está comprobado |
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
5. Staging mínimo + smoke E2E, con el orden de [`RUNBOOKS/infra-desarrollador.md`](./RUNBOOKS/infra-desarrollador.md)

Narrativa → [`company/WHAT-IS-DAKINIS.md`](./company/WHAT-IS-DAKINIS.md) · Messaging → [`company/MESSAGING.md`](./company/MESSAGING.md).

## Puerta antes del segundo negocio (11 nov 2026)

Condiciones de aceptación. Escribirlas no las cierra. Cada una necesita estado de código, despliegue y verificación en [`RUNBOOKS/infra-desarrollador.md`](./RUNBOOKS/infra-desarrollador.md). La prueba, cuando se haga, se guarda en [`evidence/`](./evidence/README.md). Hoy esa carpeta no tiene resultados. Dueño: el operador. Suplente de las condiciones 4, 6 y 8: sin nombrar.

| # | Condición | Qué la bloquea |
|---|---|---|
| 1 | Una empresa no lee datos de otra | Pruebas con dos tenants, también en búsqueda, exportación y workers |
| 2 | Un rol sin el permiso no ejecuta la operación | Falta la evidencia. Quien tiene `AKOENET_MEMBER_KEY` todavía puede nombrar a otro miembro. El alta de Search sigue aceptando el tenant de la clave de servicio. Las llamadas de workspace de AkoeNet no reenvían el JWT y en producción responden 401. El runbook tiene la revisión posterior |
| 3 | Una sesión se puede revocar | Sesiones revocables en Auth. El access token dura `JWT_ACCESS_TTL` (15 min si no se define) y sigue válido hasta `exp`. El MFA de usuario no bloquea esta puerta |
| 4 | Un secreto comprometido se puede invalidar | Inventario y dos rotaciones ensayadas: `JWT_SECRET` y `DAKINIS_INTERNAL_SERVICE_KEY` |
| 5 | Un reintento no duplica un cobro | `UNIQUE` visto en la base viva, más eventos repetidos, desordenados y a medias |
| 6 | La base se recupera en un entorno aislado | Restauración contra el RPO y el RTO del runbook, con evidencia |
| 7 | Una acción administrativa queda registrada | Audit log de la aplicación (Auth, Core, Billing) y revisión mensual del audit log nativo de Railway, Cloudflare, Supabase, Stripe y GitHub |
| 8 | Una incidencia P0 tiene procedimiento | Niveles P0–P3, el plazo de 72 h si hay datos personales, y un suplente nombrado |

Orden para cerrarlas, cuando haya evidencia: 3, 4, 5, 8, 7, 6, 1, 2. La 8 va antes de la 6. Escribir el orden no cierra ninguna.

Antes del segundo negocio, y fuera de estas ocho: reautenticación para exportar, borrar una organización o crear una clave API; exportación y borrado de la cuenta (RGPD), distinguiendo lo que la factura obliga a conservar.

---

*Foto comercial: 3 oct 2026. Puerta de seguridad añadida el 11 nov 2026.*  
*Pregunta guía: ¿Puede un restaurante real usar Dakinis 30 días y pagar sin que intervengas?*

# TEMP — Dakinis: sistema, narrativa y prioridades comerciales

> **Temporal / no SoT** · 3 oct 2026 · actualizado tras análisis estratégico + conversación Héctor.  
> Canónico: [`STATUS.md`](./STATUS.md) · [`SYSTEMS.md`](./SYSTEMS.md) · [`company/MESSAGING.md`](./company/MESSAGING.md) · [`company/WHAT-IS-DAKINIS.md`](./company/WHAT-IS-DAKINIS.md)  
> UI/DES → [`_TEMP-dakinis-ui-pages-styles.md`](./_TEMP-dakinis-ui-pages-styles.md)

---

## Tesis

Dakinis **ya no necesita principalmente más funcionalidades**. Necesita pasar de  
«ecosistema técnicamente muy completo» → **«SaaS comercialmente demostrable, operable y cobrable»**.

| Métrica | ~Score | Lectura |
|---------|--------|---------|
| **Technical Readiness** | ~90% | Arquitectura, Hub, Platform, CI, DES scaffold |
| **Commercial Readiness** | ~50–60% | 1 piloto gratis · 0 pagos · Billing E2E ⬜ · narrativa débil |

**Pregunta operativa:**  
*¿Puede un restaurante real usar Dakinis 30 días sin que intervengas?*

---

## Qué es (frase oficial)

> Dakinis Systems es una plataforma de software que reúne herramientas para **gestionar, automatizar y conectar** negocios y comunidades desde un mismo ecosistema.

Detalle humano → [`company/WHAT-IS-DAKINIS.md`](./company/WHAT-IS-DAKINIS.md).

### Señal Héctor (28 sep 2026)

Mandar 4 URLs sin marco → «necesito una explicación de todo eso».  
Riesgo: se percibe como **apps sueltas**, no como plataforma.

| ❌ Explicación improvisada | ✅ Explicación producto |
|----------------------------|-------------------------|
| «Un Discord nuevo» | Comunidad integrada con Dakinis |
| «Página para desarrollar según plan» | **Dakinis One** = gestión empresarial modular |
| «Empresa de software» solo | **SaaS** con productos conectados |

---

## Golden Path (único onboarding oficial)

```
Landing → Registro → Workspace → Hub (Mi día)
    → Dakinis One (CRM · Ventas · Inventario · Hospitality)
    → Valor diario → Plan → Pagar → Retención
```

LifeFlow / StreamAutomator / AkoeNet / Tabletop = **ecosistema**, no requisito día 1.

Comercialmente:

| Capa narrativa | Contenido |
|----------------|-----------|
| **Dakinis Business** | Hub + One + AI + Billing |
| **Dakinis Apps** | LifeFlow · SA · AkoeNet · Tabletop |

---

## Mapa técnico (resumen)

```
PLATFORM          EXPERIENCE           PRODUCTS
Auth Billing      Hub · DES · SSO      One · LifeFlow · SA · AkoeNet · Tabletop
Events Internal   Attention · Mi día
AI Search Notif
```

Características por sistema → sección 2 del snapshot anterior / [`SYSTEMS.md`](./SYSTEMS.md).

**Hecho reciente relevante:** F1 seed Copérnico · bridge Core→`hub.timeline` · Attention con **impact + recommendation + CTA** · CI deps #45–#47 · passwords fuera de OPERATIONS.

---

## Hub = centro de decisión

Mi día no es un dashboard de KPIs: es **problema → impacto → acción**.

```
EVENT → RULE → ATTENTION → RECOMMENDATION → ACTION (CTA)
```

Ejemplo:

```
🔴 Stock crítico
Inventario bajo el mínimo
Impacto: riesgo de romper la carta hoy
→ [Ver inventario]
```

Código: `internal/hub-actions.js` + `HubAttentionPanel` (impact / recommendation / ctaLabel).

**Siguiente:** Action Engine formal (rules) + deep-links que ejecuten flujo (crear pedido), no solo abrir pantalla.

---

## Prioridades (nuevo orden)

### 🔴 P0 — Vender / evidencia

| ID | Tarea | Evidencia de done |
|----|--------|-------------------|
| **P0.1** | Copérnico E2E: invite staff + operación + feedback | Caso de uso real |
| **P0.2** | F1 live (Core + hospitality domains; seed solo bootstrap) | Mi día con datos/acciones reales |
| **P0.3** | Billing E2E (checkout → webhook → plan → degrade/restore → portal) | Primer cobro posible |
| **P0.4** | Security: sin secrets en docs · rotar si filtraron | OPERATIONS limpio ✅ |
| **P0.5** | Golden Path en producto + Landing | Visitante entiende en ≤30 s |
| **N1–N6** | Narrativa: frase, productos, One, /products, diagrama, SaaS≠factory | WHAT-IS-DAKINIS ✅ · Landing ⬜ |

### 🟠 P1 — Plataforma operable

1. Staging mínimo (Railway + DB + Stripe test)  
2. RBAC: plan ∧ capability ∧ permission ∧ scope (org/venture/location)  
3. Event contract formal + Outbox (Core/Billing)  
4. Notification Center unificado  
5. Audit log transversal  
6. Org/Venture/Location demo multi-local  
7. Dakinis Health + Business Health  
8. Correlation ID / observabilidad  
9. DES Definition of Done + `design:audit`  
10. Onboarding wizard negocio  

### 🟡 P2 — Diferenciación

Action Engine completo · Copilot permission-aware · AI budgets · Global Search · Knowledge+ACL · Command Center · Hospitality realtime · Product analytics / Activation  

### ⚪ P3 — Después / bajo demanda

Tabletop PG · Marketplace · Public API · Banking · Glovo/Uber reales · Mobile genérico · PWA  

---

## Mejoras arquitectónicas (backlog P1, no features)

| Tema | Idea |
|------|------|
| **Event Bus** | Envelope: event_id, type, version, workspace/venture/location, actor, correlation_id, source, payload |
| **Outbox** | Transacción negocio + outbox_event → worker → bus (no perder pedidos/stock/pagos) |
| **Internal API** | Solo orquesta (Hub/Workspace/Admin BFF); Core/Billing/AI deciden su dominio |
| **Policy Engine** | ALLOW = plan ∧ capability ∧ permission ∧ resource scope |
| **Security Gate** | PR → CI (tests, audit, contracts, migrations) → staging → smoke → prod → post-smoke + Release ID |
| **Rollback** | Smoke fail → versión anterior; migraciones expand/contract |
| **Activation** | org + location + ≥1 invite + ≥5 productos + ≥3 ventas + dashboard abierto |
| **Vertical packs** | Business / Hospitality / Retail / Services sobre el mismo Core |
| **Copérnico case study** | Antes/después medible → Landing/ventas |

---

## 5 tareas si solo pudieras hacer esas ahora

1. 🔴 Security secrets (docs) — **hecho parcial** (OPERATIONS)  
2. 🔴 Copérnico E2E staff + feedback  
3. 🔴 Billing E2E primer pago  
4. 🔴 Hub Mi día datos/acciones reales (Attention impact ✅; deep actions ⬜)  
5. 🟠 Staging + smoke E2E + rollback  

---

## Valoración (snapshot)

| Área | Nota |
|------|------|
| Arquitectura | 9/10 |
| Visión plataforma | 9/10 |
| Base técnica | 8.5/10 |
| UX/DES | 7/10 |
| Operaciones | 8/10 |
| Seguridad | 8/10 (P0 docs mitigado) |
| Producto comercial | 6/10 |
| Validación mercado | 3/10 |
| Narrativa externa | 4/10 → subir con WHAT-IS + Landing |

---

## No hacer ahora

Ampliar catálogo · cutover Tabletop · marketplace · API pública · “20 features nuevas”.  
**Cerrar huecos estructurales** y convertir Copérnico en la primera prueba real de cobro/uso diario.

---

*Fin TEMP — no SoT.*

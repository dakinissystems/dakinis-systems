# TEMP — Cobro Dakinis: flujo, precios y costos

> **Temporal / no SoT** · 7 oct 2026 · borrar o fusionar en `company/PRICING-STRATEGY.md` + `BUSINESS-MODEL.md` cuando cierre.  
> Canónico: [`company/PRICING-STRATEGY.md`](./company/PRICING-STRATEGY.md) · [`company/BUSINESS-MODEL.md`](./company/BUSINESS-MODEL.md) · ADR [`adr/ADR-005-billing-platform.md`](./adr/ADR-005-billing-platform.md) · E2E [`RUNBOOKS/billing-e2e.md`](./RUNBOOKS/billing-e2e.md)  
> Cifras de catálogo: `platform/core/shared/catalog/bos-pricing.js` · Stripe Live es la verdad de cobro.

---

## 1. Qué se cobra (hoy)

| Capa | Qué paga el cliente | Dónde vive |
|------|---------------------|------------|
| **Suscripción SaaS** | Plan mensual Dakinis One (Starter / Growth / Pro · Enterprise ancla) | Billing platform + Stripe Live |
| **Implantación** | Pago único (consultoría: config, migración, formación) | Fuera del checkout automático · propuesta / WhatsApp |
| **Excesos** | IA y WhatsApp por encima de cuota | Modelo híbrido en catálogo · facturación automática aún parcial |
| **Servicios** | €/h o packs de proyecto | Landing / propuesta |
| **Soporte** | Add-on mensual opcional (básico / prioridad / premium) | Catálogo comercial |
| **Satélites** | SA tiene Stripe propio (Creator / Pro / Lifetime); LifeFlow/AkoeNet vía plataforma o futuro | SA + Billing unified (cutover parcial) |

**Piloto actual:** Heladería Copérnico en plan Pro **sin cobro** (seed gratis). **0 clientes de pago** → Commercial Readiness ~55 %.

---

## 2. Cómo se hace el cobro (flujo técnico)

```
Cliente → Core /precios (o Hub admin)
       → Gateway → Billing (:4080)
       → Stripe Checkout (Live)
       → Webhook Stripe → Billing
       → Supabase billing.subscriptions
       → Redis/BullMQ event
       → Core: business.plan + access_state
```

Detalle secuencia → [`ARCHITECTURE.md`](./ARCHITECTURE.md) §13 Billing E2E.

### Piezas

| Pieza | Rol |
|-------|-----|
| **Billing** (`dakinis-billing`) | Único dueño de Stripe keys + webhooks |
| **Core** | UI `/precios`, proxy público, aplica `plan` / `access_state` |
| **Gateway** | Enruta `/billing/v1/*` |
| **Stripe** | Checkout, suscripción, facturas |
| **Supabase `billing.*`** | Catálogo + subscriptions |
| **Redis** | Eventos `billing.payment_succeeded` / `failed` |

### Estados de acceso

| Evento | Efecto |
|--------|--------|
| Checkout OK / `invoice.paid` | `plan` activo · `access_state = active` |
| `invoice.payment_failed` | `past_due` → **degraded** (módulos premium limitados; datos no se borran) |
| Pago recuperado | Restore a `active` |

Legal → [`legal/TENANT-ACCESS-AND-SUSPENSION.md`](./legal/TENANT-ACCESS-AND-SUSPENSION.md).

### Qué falta para “cobrar de verdad” (E2E Live)

- [ ] Checkout Stripe + webhook prod **200**
- [ ] Fila en `billing.subscriptions` + `business.plan` en Core
- [ ] Degrade / restore probado
- [ ] Portal cliente (roadmap)

Runbook → [`RUNBOOKS/billing-e2e.md`](./RUNBOOKS/billing-e2e.md).

---

## 3. Precios al cliente (catálogo BOS v1.2)

Fuente código: `DAKINIS_PLAN_BASE_EUR` etc. en `bos-pricing.js`.  
**Stripe Dashboard puede diferir** — no inventar Price IDs; Railway usa `STRIPE_PRICE_*_MONTHLY`.

### Suscripción mensual

| Plan | €/mes | Usuarios | Storage | IA incl. | WhatsApp incl. | Ancla comercial |
|------|------:|----------|---------|----------|----------------|-----------------|
| **Starter** | **39** | 2 | 5 GB | 0 | 0 | Entrada / ordenar agenda + CRM |
| **Growth** | **89** | 8 | 50 GB | 0 | 250 conv./mes | **Ancla de venta** (stock + WA) |
| **Pro** | **169** | ilimitados | 200 GB | 2.000 resp./mes | 2.000 conv./mes | Automatizar + Copilot |
| **Enterprise** | **299+** | ilimitados | 500 GB | 10.000 | 10.000 | Multiempresa / SLA (propuesta) |

Usuario extra: **+8 €/mes**.

### Excesos (factura comercial)

| Concepto | Tarifa al cliente |
|----------|-------------------|
| IA extra | **5 €** / cada 1.000 respuestas por encima de cuota |
| WhatsApp extra | **5 €** / cada 500 conversaciones por encima de cuota |

### Implantación (pago único, no Stripe sub)

| Plan SaaS | Implantación recomendada |
|-----------|--------------------------:|
| Starter | **290 €** |
| Growth | **690 €** |
| Pro | **1.490 €** |
| Proyecto a medida | **3.000 €+** |

### Servicios profesionales

| Tipo | Precio |
|------|--------|
| Tarifa horaria | **60 €/h** |
| Packs proyecto | **600 / 1.500 / 3.000+ €** |
| Soporte básico | **29 €/mes** (1 h) |
| Soporte prioridad | **79 €/mes** (3 h) |
| Soporte premium | **149 €/mes** (6 h) |

### StreamAutomator (referencia satélite)

Licencias legacy / Stripe SA (aprox. catálogo SA): mensual ~**6,99 USD**, trimestral ~**14,99**, lifetime ~**99** — cutover a Billing unificado en curso (`045`/`046`).

---

## 4. Costos (margen / infra)

### Coste variable por uso (interno, catálogo)

| Driver | Coste interno estimado | Precio exceso cliente | Nota |
|--------|------------------------:|----------------------:|------|
| IA | **0,002 €** / 1k tokens | 5 € / 1k respuestas | Margen alto si el “response” ≈ pocos k tokens |
| WhatsApp | **0,05 €** / mensaje | 5 € / 500 conv. | Depende tarifa Meta real del número |

Heurística query ligera: ~**0,001 €** (catálogo).

### Coste fijo de plataforma (orden de magnitud)

No hay P&L cerrado en docs. Componentes típicos (prod):

| Línea | Notas |
|-------|--------|
| **Railway** | Muchos servicios (Gateway, Auth, Hub, Core, Billing, AI, Internal, Notif, Search, Knowledge, SA, …) — coste dominante operativo |
| **Supabase** | Postgres + pooler (Core `dakinis_core_prod` + schemas platform) |
| **Redis / BullMQ** | Eventos billing, workers |
| **Stripe** | Comisión ~1,4–1,5 % + fijo por cargo exitoso (UE) — pagar desde ingreso bruto |
| **Cloudflare** | DNS / WAF / edge |
| **Dominios + email** | Workspace / correo operador |
| **OpenAI / providers IA** | Variable según uso Pro+ |
| **Meta WhatsApp** | Variable cuando envío live esté activo |

> Actualizar con export Railway + Stripe Fees cuando haya primer cliente de pago.

### Margen conceptual (Growth ejemplo)

```
Ingreso Growth:     89 €/mes
− Stripe (~2–3 %):  ~2–3 €
− Infra prorrateada: ? (hoy 0 clientes → coste fijo / 0)
− WA 250 × 0,05 €:  hasta ~12,5 € si se usan todos los mensajes
= Margen contribución: alto en Starter/Growth sin IA; Pro depende de uso IA/WA
```

Implantación Growth **690 €** es margen de servicios (horas tuyas), no SaaS recurrente.

---

## 5. Mapa mental “quién cobra qué”

```
CLIENTE PYME
  │
  ├─ Suscripción mensual ──► Stripe ──► Billing ──► plan en Core/Hub
  ├─ Implantación ─────────► Factura / transferencia / acuerdo (manual hoy)
  ├─ Exceso IA/WA ─────────► Modelo en catálogo (automatizar con usage metering)
  └─ Proyectos / soporte ──► Propuesta comercial

STREAMER (SA)
  └─ Licencia SA ──────────► Stripe SA (o Billing unificado si flag on)
```

---

## 6. Estado comercial (snapshot)

| Ítem | Estado |
|------|--------|
| Catálogo precios en UI Core `/precios` | ✅ (39 / 89 / 169) |
| Price IDs Stripe en Railway Billing | ✅ env `STRIPE_PRICE_*` |
| Checkout E2E Live verificado | ⬜ |
| Primer cobro real | ⬜ |
| Portal Hub/Core | ⬜ roadmap |
| Piloto Copérnico | 🟡 gratis (no valida ARPU) |

**Pregunta guía:** ¿Puede un restaurante pagar Growth/Pro y operar 30 días sin que intervengas?

---

## 7. Fuentes

| Tema | Archivo |
|------|---------|
| Precios / cuotas / excesos | `platform/core/shared/catalog/bos-pricing.js` |
| UI pricing | `platform/core/web/src/data/pricingCatalog.js` · `/precios` |
| Estrategia | [`company/PRICING-STRATEGY.md`](./company/PRICING-STRATEGY.md) |
| Modelo | [`company/BUSINESS-MODEL.md`](./company/BUSINESS-MODEL.md) |
| ADR Billing | [`adr/ADR-005-billing-platform.md`](./adr/ADR-005-billing-platform.md) |
| Seeds planes | [`supabase/seeds/billing.sql`](./supabase/seeds/billing.sql) |
| Env Price IDs | `docs/railway.env.example` (`STRIPE_PRICE_*`) |

---

*Fin TEMP — no SoT. Cifras Stripe Live mandan sobre este documento.*

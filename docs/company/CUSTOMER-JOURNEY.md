# Customer journey

> **Guía de producto y GTM.** Entrada = **Hub** · Cliente nunca ve "Core".  
> Ciclo workspace → [`../WORKSPACE-LIFECYCLE.md`](../WORKSPACE-LIFECYCLE.md) · Estrategia → [`STRATEGY.md`](./STRATEGY.md)

**Regla:** Toda nueva funcionalidad debe preguntarse si mejora este recorrido. Si no → posponer hasta después del primer cliente piloto.

---

## Recorrido completo

```
Landing (dakinissystems.com)
      ↓
Registro / Auth
      ↓
Crear o unirse a Workspace
      ↓
Hub — Mi día (escritorio)
      ↓
Primer producto (Dakinis One · LifeFlow · …)
      ↓
Primera acción de valor (< 30 min)
      ↓
Invitar equipo (Hub Admin)
      ↓
IA + Knowledge (copilot útil)
      ↓
Pago (Billing / Stripe)
      ↓
Uso diario (retención)
      ↓
Expandir productos / plan
      ↓
Integraciones · Marketplace (futuro)
```

Jerarquía mental: **Dakinis Platform → Workspace → Hub → Productos**

---

## Fases y métricas

### Fase 1 — Descubrimiento

| Elemento | Detalle |
|----------|---------|
| Canal | Landing, SEM, demo, boca a boca |
| Mensaje | [`MESSAGING.md`](./MESSAGING.md) — *Empieza en tu Hub* |
| CTA | Empezar gratis · Descubrir Dakinis |
| Métrica | Visitas → registro (conv. landing) |

**Sensación:** plataforma empresarial unificada — no "otra app de facturas".

### Fase 2 — Identidad y workspace

| Paso | Sistema |
|------|---------|
| Login Auth | `auth.dakinissystems.com` |
| Workspace creado o unido | `meta.workspaces` |
| Primer Hub | Mi día, widgets, tiles productos |

**Objetivo:** *"Este es el escritorio de mi empresa."*

**Métrica:** % usuarios que llegan a Hub en < 2 min post-registro.

### Fase 3 — Activación (primer producto)

| Producto piloto | Primera acción de valor |
|-----------------|-------------------------|
| Dakinis One | CRM contacto o pedido restaurante demo |
| LifeFlow | Score o escenario creado |
| AkoeNet | Servidor + canal + módulo Welcome |
| Tabletop | Ficha o campaña sin cuenta |

**Objetivo:** valor percibido en **< 30 minutos**.

**Métrica:** activación D1 (acción core completada).

### Fase 4 — Equipo

| Paso | Hub Admin |
|------|-----------|
| Invitar admin / empleado | `/admin/members` |
| Rol asignado | owner · admin · member |
| SSO equipo a producto | Sin segundo registro |

**Objetivo:** PYME usa Dakinis con 2+ personas.

**Bloqueo jul 2026:** Billing E2E para cobrar seats/plan.

### Fase 5 — IA y conocimiento

| Touchpoint | Beneficio |
|------------|-----------|
| Copilot Dakinis One | Responde con contexto negocio |
| Ctrl+K / Search | Encuentra docs |
| LifeFlow Coach | Insight sobre finanzas |
| AkoeNet @AI | Ayuda en servidor |

**Objetivo:** *"La IA conoce mi negocio."*

### Fase 6 — Conversión (pago)

```
/precios · CTA Hub · Checkout Stripe
      ↓
Webhook 200 → billing.subscriptions
      ↓
Plan Growth/Pro activo
```

**Métrica:** trial → paid · MRR primer piloto.

**Estado jul 2026:** 🔴 Billing E2E pendiente.

### Fase 7 — Retención

| Palanca | Frecuencia |
|---------|------------|
| Hub Mi día | Diario |
| Notificaciones | Eventos negocio |
| Coach / copilot | Semanal |
| Soporte help@ | Según necesidad |

**Métrica:** DAU workspace · retención semana 2+.

### Fase 8 — Expansión (post-piloto)

| Acción | Ejemplo |
|--------|---------|
| Segundo producto | LifeFlow + Dakinis One |
| Upgrade plan | Starter → Growth → Pro |
| Integración | WhatsApp, Calendar |
| Marketplace | Template vertical |

---

## Journey por persona

### Dueño restaurante (piloto B2B)

```
Landing → Hub → Dakinis One demo restaurante → invita cocina/admin → paga Growth → usa pedidos diario
```

### Profesional LifeFlow

```
Landing finanzas → Hub → LifeFlow → import CSV o manual → escenario 10 años → Premium
```

### Streamer

```
StreamAutomator → AkoeNet servidor → módulo Streamer → comunidad automatizada
```

---

## Anti-patterns (no optimizar aún)

| Recorrido | Por qué esperar |
|-----------|-----------------|
| Marketplace primero | Sin MRR |
| 10 integraciones | Sin cliente que las pida |
| Super Admin completo | Studio + Stripe bastan para piloto |
| PSD2 global | GoCardless ES primero |

---

## Métrica norte jul 2026

**1 piloto** que use **Hub + Dakinis One** (o LifeFlow) **2+ semanas** y **pague** o confirme piloto de pago.

Técnico → [`../PLATFORM-STATUS.md`](../PLATFORM-STATUS.md)

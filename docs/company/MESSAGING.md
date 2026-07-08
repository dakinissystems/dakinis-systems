# Mensaje y posicionamiento

> Para **landing**, demos e inversores. Técnico → [`../ARCHITECTURE.md`](../ARCHITECTURE.md) · Copy → [`LANDING-COPY.md`](./LANDING-COPY.md)

## Pregunta guía

*¿Qué necesita un cliente para pagar por Dakinis este mes?*

---

## Jerarquía única (usar siempre)

Una sola historia en todos los documentos y la UI comercial:

```
Dakinis Platform
        ↓
      Hub
        ↓
   Productos (Dakinis One · LifeFlow · StreamAutomator · AkoeNet …)
```

| Contexto | Término |
|----------|---------|
| **Marca / landing / ventas** | Dakinis Platform · Hub · Dakinis One |
| **Hero metáfora** | Sistema operativo para empresas modernas |
| **Código / repos / gateway `/core/`** | Core (solo ingeniería — el cliente **nunca** lo ve) |

**Regla:** ❌ “Entra en Core” · “Core CRM” · “Core ERP” → ✅ “Abre Dakinis One desde tu Hub”

---

## Frases Hub (repetir en landing y demos)

- **Empieza en tu Hub.**
- **Todo vive en el Hub.**
- **Tu negocio comienza aquí.**
- Un login · un Hub · una factura.

---

## Qué vendemos

1. **Dakinis Platform** — identidad, Hub, billing, IA, conocimiento compartidos  
2. **Hub** — escritorio y punto de entrada (no “menú de apps”)  
3. **Productos** — Dakinis One primero; LifeFlow, StreamAutomator, AkoeNet…

El cliente **entra por el Hub**, no por “otro ERP”.

---

## Posicionamiento vs competencia

**Usar en concepto / pitch técnico:** inspirados en Microsoft 365, Zoho One y Atlassian Cloud (Hub + workspace + suite).

**No usar en ventas:** "comparable a Microsoft 365" — genera expectativas de escala que aún no tenemos.

Comparativa completa → [`STRATEGY.md`](./STRATEGY.md)

---

## Propuesta de valor (canónica jul 2026)

**Headline (H1):**

> **Un sistema operativo para empresas modernas**

**Subheadline (canónica jul 2026):**

> Gestiona clientes, operaciones, facturación e inteligencia artificial desde un único lugar. **Empieza en tu Hub** y abre los productos que necesites.

**Alternativas subheadline (A/B):**

| ID | Texto |
|----|--------|
| B | Todo tu negocio funcionando desde un único lugar — empieza en tu Hub. |
| C | La plataforma que conecta operaciones, clientes, facturación e IA. |

**Evitar (genérico):** ~~Gestiona tu negocio desde una sola plataforma impulsada por IA.~~

---

## CTAs

| Rol | Copy recomendado |
|-----|------------------|
| **Primario** | Empezar gratis |
| **Secundario** | Descubrir Dakinis · Ver una demo · Explorar la plataforma |
| Evitar secundario pasivo | ~~Ver cómo funciona~~ (correcto pero poco curiosidad) |

---

## Hub — protagonista

Hub **no es solo un launcher**. Es identidad, Mi día, widgets, SSO, notificaciones, preferencias.

**Mensaje cliente:** *Tu escritorio Dakinis* — *Todo vive en el Hub.*

---

## IA — beneficio cliente

> **La IA conoce tu negocio.** Responde preguntas, asiste a tu equipo y automatiza tareas — desde el Hub o Dakinis One.

No: LLM · embeddings · agents (solo docs técnicos).

---

## Knowledge — memoria de la empresa

> *Tu empresa pregunta; Dakinis responde con tus datos.*

Alimenta Ctrl+K y copilot. Mismo peso narrativo que IA.

---

## Dakinis One (nombre comercial)

| ❌ Marketing | ✅ Marketing |
|-------------|-------------|
| Core · Core ERP · Core CRM | **Dakinis One** |
| “Vendemos Core” | “Vendemos la plataforma; Dakinis One es el producto principal” |
| Listar 40 módulos en landing | Un problema + 4 bullets |

Detalle módulos → [`../PRODUCTS.md`](../PRODUCTS.md) (post-login).

---

## Recorrido mental del cliente (guía de producto)

```
Landing → Auth → Hub → Dakinis One → IA + Knowledge → Pago → Retención
```

Ver [`CUSTOMER-JOURNEY.md`](./CUSTOMER-JOURNEY.md)

---

## Lo que NO prometer hasta clientes

Marketplace · Storage · multi-provider IA — [`../PLATFORM-STATUS.md`](../PLATFORM-STATUS.md) 🔵

**Valores:** Consolidar antes de ampliar · Cliente pagador > feature lista

Pendientes mensaje/landing → [`../PLATFORM-STATUS.md`](../PLATFORM-STATUS.md) § Prioridad 2.  

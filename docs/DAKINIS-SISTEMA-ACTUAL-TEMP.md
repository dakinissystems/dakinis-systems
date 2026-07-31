# Dakinis Systems — Cómo explicarlo + estado actual (TEMP)

> **Documento temporal** · 28 jul 2026 · no canónico  
> Fuentes: [`STATUS.md`](./STATUS.md) · [`ROADMAP.md`](./ROADMAP.md) · [`OPERATIONS.md`](./OPERATIONS.md) · [`SYSTEMS.md`](./SYSTEMS.md)  
> Combina: narrativa de producto · feedback de comunicación por audiencia · estado real desplegado.

---

## Opinión sobre el feedback (síntesis)

El feedback es **muy sólido** y apunta en la dirección correcta.

| Criterio | Valoración |
|----------|------------|
| Claridad | Alta — problema → solución → profundidad según audiencia |
| Exactitud | Alta — con matices: Core **no** es la plataforma; Auth/Hub/Billing/AI/Gateway sí |
| Valor estratégico | Alto — sirve para clientes, inversores y técnicos |
| Utilidad | **Mantener** casi todo; **separar** doc comercial vs técnica |

**Qué mantendría**
- Empezar por el **problema**, no por Railway/Redis.
- Tres niveles (cualquiera / empresario / técnico).
- Analogía del **teléfono** primero (más universal que “SO”).
- Honestidad: 0 clientes de pago, piloto gratis, betas.
- Filosofía: cada producto funciona solo; juntos valen más.
- Eslogan: *no crea aplicaciones → construye un ecosistema*.

**Qué cambiaría / matizaría**
1. **Core ≠ Dakinis.** Core es un **producto** (motor empresarial). La plataforma es Auth + Hub + Billing + AI + Gateway.
2. Dividir **documento comercial** (problema → beneficio → casos) y **documento técnico** (stack, workers, pgvector).
3. Hablar de **resultados** (“evita quedarte sin stock”), no solo de módulos (“Inventario”).
4. El **Hub** como concepto estrella: no es “otra app”, es el escritorio.
5. El flujo “crear empresa en Core → LifeFlow la ve → …” describe la **visión de integración**; hoy el SSO y el Hub ya unifican acceso; la sincronización profunda de datos entre productos aún es **parcial** (hay que ser honestos en demos).
6. Añadir **casos** (restaurante, streamer, agencia) y la frase: *no reemplaza una app concreta; reemplaza gestionar muchas apps desconectadas*.

**Notas orientativas:** técnico/interno ~9–9.5 · clientes ~7.5–8 hasta que el énfasis sea beneficio. Base buena; el salto es de énfasis, no de inventar otra historia.

---

## Eslogan

> **Dakinis Systems no crea aplicaciones. Construye un ecosistema donde cada herramienta potencia a las demás.**

Complemento útil:

> Dakinis no pretende reemplazar una aplicación concreta. Pretende reemplazar la necesidad de gestionar muchas aplicaciones desconectadas.

---

# Parte A — Cómo explicar Dakinis (por audiencia)

## A0. Por qué existe (antes de la tech)

Las empresas y profesionales terminan con demasiadas herramientas que **no se hablan entre sí**: más tiempo perdido, más errores, más costes, más logins.

**Dakinis nace para resolver ese problema:** un acceso, datos que pueden compartirse, módulos especializados sobre una infraestructura común.

---

## A1. Para cualquier persona (30 segundos)

Dakinis Systems desarrolla un **ecosistema de aplicaciones** para que personas y empresas gestionen su trabajo **desde un solo lugar**.

En lugar de diez herramientas sueltas (negocio, clientes, finanzas, comunicación, automatización…), Dakinis las conecta en una plataforma.

### Analogía preferida: el teléfono

Un móvil tiene **una cuenta**, **una configuración** y **muchas apps**:
- WhatsApp → hablar  
- Spotify → música  
- Maps → navegar  

Independientes, pero en el mismo dispositivo.

**Dakinis hace eso para empresas y profesionales.**

*(Opcional)* Es también como un “sistema operativo” para el día a día del negocio: cada app una tarea; todas juntas.

---

## A2. Para empresarios / dueños de negocio

### El problema

Hoy suele haber:
- un programa para facturar  
- otro para clientes  
- otro para reservas  
- otro para inventario  
- otro para finanzas  
- otro para comunicación  
- otro para IA  

Cada uno: usuarios distintos, pagos distintos, datos separados, configs distintas → **tiempo perdido**.

### La solución

**Un usuario. Una plataforma. Módulos según el negocio.**

No vendemos “Inventario / CRM / IA” como lista técnica; vendemos resultados:

| Módulo | Resultado que compra el cliente |
|--------|----------------------------------|
| Inventario / carta | Evitar quedarte sin stock; carta al día |
| CRM / clientes | Conocer mejor a tus clientes |
| Reservas / cocina | Operar el local sin caos |
| IA | Automatizar tareas repetitivas |
| Finanzas (LifeFlow) | Ver dinero, suscripciones y flujo sin Excel eterno |
| Comunicación (AkoeNet) | Coordinar al equipo sin salir del ecosistema |
| Automatización (StreamAutomator) | Publicar en redes sin trabajo manual repetido |

### Ejemplo: una cafetería / heladería

```
Negocio (piloto: Heladería Copérnico)
        ↓
   Dakinis Hub  ← escritorio de trabajo
        ↓
   Dakinis Core (empresa: carta, inventario, floor…)
        +  LifeFlow (dinero / suscripciones) cuando aplique
        +  AkoeNet (equipo / comunidad) cuando aplique
        +  Auth (un solo login) · Billing (un cobro de plataforma)
        +  IA (asistente)
```

Todo con **la misma identidad**. No reinventar usuarios en cada herramienta.

### Transparencia comercial (hoy)

| Aspecto | Estado |
|---------|--------|
| Ecosistema en producción | ~90% Go-Live |
| Piloto | Heladería Copérnico (pro free) |
| Clientes de pago | **0** — primer objetivo |
| Core | 🟡 Beta (piloto) |
| LifeFlow | 🟢 Production |
| AkoeNet / StreamAutomator | 🟡 Beta |

**Qué necesitamos:** validar el modelo con el **primer cliente de pago**.

---

## A3. Para personas técnicas

Dakinis **no es un monolito**. Es una plataforma SaaS **modular**: servicios independientes + infraestructura común.

```
Infraestructura → Plataforma → Productos → Clientes
```

| Capa | Qué hay |
|------|---------|
| Infra | Railway, Cloudflare, Postgres/Supabase, Redis, Docker, GitHub, Sentry |
| Plataforma | **Auth, Hub, Billing, AI, Gateway**, Notifications, Search, Knowledge, Internal |
| Productos | **Core**, LifeFlow, AkoeNet, StreamAutomator, Tabletop, Landing |
| Clientes | Empresas, creadores, comunidades, uso personal (LifeFlow) |

**Regla:** los productos **consumen** plataforma; no duplican auth/billing/IA (salvo legado puntual).

### “Ecosistema” = mismo idioma

No es “tener muchas apps”. Es que **hablan el mismo idioma** (identidad, orgs, APIs, en el futuro más datos compartidos).

Visión de integración (hacia donde vamos):

```
Empresa creada en Core
  → Hub la muestra
  → Auth es el mismo usuario
  → otros productos pueden enganchar workspace / permisos / datos
```

Hoy: **SSO operativo** entre productos clave; sincronización profunda de negocio aún **en progreso** — no vender sync total como ya hecho.

### Stack (resumen)

| Capa | Uso real |
|------|----------|
| Frontend | React, Vite (TS parcial; mucho JSX) |
| Backend | Node.js, Express |
| Datos | PostgreSQL (Supabase) · SQLite (LifeFlow/Tabletop volumes) · Redis |
| Edge/infra | Railway, Cloudflare, Docker, GitHub, Sentry |
| Servicios | Stripe, Resend, OAuth IdP |

---

## A4. Casos que visualizan el valor

### Restaurante / heladería
- **Core** → carta, inventario, operación del local  
- **LifeFlow** → finanzas / suscripciones (si el dueño lo usa)  
- **AkoeNet** → coordinación del equipo / comunidad  
- **Hub** → un solo escritorio  

### Streamer / creador
- **StreamAutomator** → publicar y planificar  
- **AkoeNet** → comunidad  
- **LifeFlow** → ingresos y herramientas de pago  
- **Hub** → centraliza  

### Agencia
- **Core** → clientes / operación  
- **StreamAutomator** → campañas / contenido  
- **AkoeNet** → equipo  
- **Billing** → cobro de plataforma  

---

# Parte B — Mapa de sistemas (quién es quién)

## Diagrama rápido (marca correcta)

```
                    DAKINIS
                       │
         ┌─────────────┼─────────────┐
         │             │             │
        Hub          Auth           AI
         │             │             │
         └──────┬──────┴──────┬──────┘
                │             │
            Gateway       Billing
                │
    ┌───────────┼───────────┬─────────────┐
    │           │           │             │
  Core      LifeFlow     AkoeNet    StreamAutomator
 empresa     dinero     colaboración   creadores
```

**Hub** = escritorio (como Windows: no es Paint; es donde viven Paint y el Explorador).  
**Auth** = una cuenta → todos los productos (SSO).  
**Core** = motor **empresarial** (producto), no “todo Dakinis”.  
**LifeFlow** = dinero / finanzas personales (y suscripciones SaaS).  
**AkoeNet** = capa de colaboración (no “otro Discord” vacío de sentido).  
**StreamAutomator** = automatización para creadores (más que un calendario).

### Filosofía de producto

> Cada producto debe ser excelente **solo**.  
> Mucho más potente **en el ecosistema** (Auth, Hub, AI, Billing).

LifeFlow, AkoeNet, StreamAutomator y Core **funcionan solos**.  
Conectados, el valor del conjunto > suma de partes.

---

# Parte C — Estado real (julio 2026)

**Pregunta guía:** *¿Qué necesita un cliente para pagar por Dakinis este mes?*

## Madurez

| Servicio | Madurez | Función / nota |
|----------|---------|----------------|
| Gateway | 🟢 | `api.dakinissystems.com` |
| Auth | 🟢 | SSO · JWT · orgs · `auth.dakinissystems.com` |
| Landing | 🟢 | Hub-first + `hub.png` Mi día en prod (28 jul) |
| AI | 🟢 | Copilot · costes |
| LifeFlow | 🟢 | Finanzas + Suscripciones (sin import Gmail — retirado por privacidad) |
| Hub | 🟡 | Escritorio · widgets reales ≥2 productos · screenshot en landing |
| Core | 🟡 | Multitenant · carta/floor/inventory · piloto Copérnico · bridge invite→Core live |
| Billing | 🟡 | Código listo · E2E Stripe live pendiente |
| AkoeNet | 🟡 | Chat/comunidades/workspace · Media móvil mejorado |
| StreamAutomator | 🟡 | API redeployed 28 jul · React Doctor WIP local |
| Notifications | 🟠 | Resend + worker |
| Search / Knowledge | 🟠 | Worker · pgvector · ingest |
| Tabletop | 🟠 | Experimental · SQLite → Supabase |

## Dominios

| | URL |
|--|-----|
| Hub | `hub.dakinissystems.com` |
| Core | `core.dakinissystems.com` · API `/core/` |
| LifeFlow | `finance.dakinissystems.com` · `finance-api.dakinissystems.com` |
| AkoeNet | `api.akoenet.dakinissystems.com` |
| StreamAutomator | `api.streamautomator.com` |
| Auth | `auth.dakinissystems.com` |
| Landing | `dakinissystems.com` |

⚠️ No usar `api.finance.*`.

## Detalle productos (visión vs hoy)

| Sistema | En una frase no técnica | Hoy |
|---------|-------------------------|-----|
| **Auth** | Un login para todo | SSO 3/3 · MFA perfil pendiente |
| **Hub** | El escritorio de Dakinis | Mi día activo · widgets reales · screenshot en landing |
| **Core** | Gestiona el negocio (carta, stock, local…) | Beta · piloto Copérnico · bridge invite listo · falta demo ops |
| **LifeFlow** | Controla el dinero y las suscripciones | Prod · Suscripciones manuales · Open Banking diferido |
| **AkoeNet** | Hablar y organizar equipos/comunidades | Beta · Media responsive · verificar en prod |
| **StreamAutomator** | Automatiza publicar en redes | Beta · API en prod (28 jul) |
| **Billing** | Un cobro de plataforma | Falta E2E live |
| **AI** | Ayuda a automatizar tareas | Prod |

## Pendientes (prioridad)

1. Invite staff + demo **Copérnico** (ops)  
2. Billing E2E live (con pago real)  
3. Verificar Media AkoeNet en prod  
4. Diferido: LifeFlow → PG · Open Banking · Marketplace · React Doctor SA  

## Roadmap 2026 (compacto)

| Mes | Objetivo |
|-----|----------|
| Jul | Billing E2E · SSO · piloto Hub+Core · screenshot landing ✅ |
| Ago | Demo Copérnico · **primer cliente de pago** |
| Sep | Workspace Admin · LifeFlow → PG · AkoeNet `@AI` |
| Q4 | Automatizaciones Hub · hire · Marketplace solo si lo piden |

**No iniciar hasta validar pago:** Marketplace · Railway vacíos · features sin cliente.

---

# Parte D — Dos documentos (recomendación)

| Documento | Contenido |
|-----------|-----------|
| **Comercial** | Problema → solución → beneficios → casos → productos → precios → transparencia |
| **Técnico** | Capas · madurez · dominios · stack · workers · deudas (SQLite, MFA, E2E) |

Este TEMP mezcla ambos a propósito; al pasar a canónico, **separarlos**.

---

# Resumen ejecutivo

**Dakinis** es un ecosistema (no una sola app): Hub + Auth + Billing + AI como plataforma; Core, LifeFlow, AkoeNet y StreamAutomator como productos.

- Cada uno puede vivir solo; juntos eliminan el cambio constante entre herramientas desconectadas.  
- Estado: ~90% en producción, piloto gratis activo, **cuello de botella = primer cliente de pago**, no inventar más módulos.  
- Al explicar: **problema primero**, teléfono como analogía, Hub como escritorio, Core como producto empresarial — no como “toda la marca”.

---

*TEMP · archivar o fusionar en landing / company cuando el mensaje comercial esté cerrado.*

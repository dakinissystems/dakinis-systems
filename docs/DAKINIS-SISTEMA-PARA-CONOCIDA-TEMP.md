# Dakinis Systems — Todo el sistema (para alguien que entiende tecnología)

> **Documento temporal** · julio 2026 · no canónico  
> Pensado para una conversación: visión completa del ecosistema **sin entrar en stack, infra ni código**.  
> Si hace falta el detalle técnico → `STATUS.md` / `ARCHITECTURE.md`.

---

## En una frase

**Dakinis no es “una app más”.** Es una **plataforma operativa modular**: un acceso, un escritorio (el Hub) y varios productos especializados que pueden vivir solos… pero ganan mucho más cuando trabajan juntos.

No pretende sustituir *una* herramienta concreta.  
Pretende sustituir el caos de **gestionar muchas herramientas desconectadas**.

---

## El problema que ataca

Casi cualquier negocio o profesional acaba así:

- una cosa para el día a día del local / clientes  
- otra para el dinero y las suscripciones  
- otra para hablar con el equipo  
- otra para publicar en redes  
- otra para “la IA”  
- y encima **varios logins, varias facturas, datos que no se hablan**

El resultado no es solo molestia: es **tiempo perdido, errores, coste y fricción**.

Dakinis nace para que eso deje de ser normal.

---

## Analogía (la más útil)

Piensa en un **móvil**:

| En el teléfono | En Dakinis |
|----------------|------------|
| Una cuenta / un dispositivo | Una identidad (un login) |
| El “escritorio” del teléfono | El **Hub** |
| WhatsApp, Maps, Spotify… | Los **productos** (negocio, finanzas, comunicación, automatización…) |
| Cada app hace una cosa bien | Cada producto hace una cosa bien |
| Todas viven en el mismo sitio | Todas viven bajo la misma plataforma |

No es “tener muchas apps”. Es **tener un ecosistema coherente**.

---

## Cómo se organiza (mapa mental)

```
                    Dakinis Platform
                            │
                    ┌───────┴───────┐
                    │     Hub       │  ← entras aquí
                    └───────┬───────┘
           ┌────────┬───────┼───────┬────────┐
           ▼        ▼       ▼       ▼        ▼
      Dakinis    LifeFlow  AkoeNet  Stream   (+ otros)
        One                         Automator
     (negocio)  (dinero)  (equipo)  (redes)
```

### Capas (sin tecnicismos)

1. **Plataforma** — lo compartido: identidad, escritorio, cobro, IA, “pegamento” entre productos.  
2. **Hub** — el punto de entrada y el día a día: “¿qué tengo que mirar hoy?”.  
3. **Productos** — módulos de negocio concretos; abres solo los que necesitas.

**Regla de oro comercial:** el cliente **empieza en el Hub**. No “entra a un ERP raro”.

---

## Qué es cada pieza (todo el sistema)

### Plataforma (invisible pero esencial)

| Pieza | Qué es, en lenguaje humano |
|-------|----------------------------|
| **Identidad / Auth** | Un usuario para todo. Entras una vez y abres productos sin reinventar cuentas. |
| **Hub** | El escritorio de Dakinis. Resumen del día, acceso a productos, administración del espacio de trabajo. |
| **Billing** | Un cobro de plataforma (planes / suscripción), no “una factura por cada app suelta”. |
| **IA** | Ayuda transversal: asistente / automatizar tareas repetitivas — capacidad de plataforma, no “otro chat suelto”. |
| **Gateway / servicios de soporte** | La puerta común y piezas de apoyo (avisos, búsqueda, conocimiento…). El usuario no tiene que “entenderlas”; están para que el ecosistema aguante. |

### Productos (lo que el cliente *usa*)

| Producto (nombre que ve el cliente) | Para qué sirve | Resultado que compra |
|-------------------------------------|----------------|----------------------|
| **Dakinis One** *(internamente “Core”)* | Operar el negocio: carta, stock, sala/cocina, inventario, día a día del local | Menos caos operativo; carta al día; no quedarte sin stock |
| **LifeFlow** | Dinero personal/profesional, flujo, suscripciones | Ver el dinero claro sin Excel eterno |
| **AkoeNet** | Comunicación: equipos, comunidades, chat, organización | Coordinar sin saltar a cinco apps |
| **StreamAutomator** | Automatizar publicación en redes | Publicar sin trabajo manual repetido |
| **Tabletop** | Pieza más experimental (juego / mesa) | Aún no es el foco comercial |

**Importante:** en ventas y demos se habla de **Dakinis One**, no de “Core”. Core es nombre interno de ingeniería.

### Landing / marca

La web pública presenta **Dakinis Platform → Hub → productos**, con el mensaje: menos herramientas, más negocio hecho.

---

## Cómo se siente usarlo (flujo real)

1. Te registras / inicias sesión **una vez**.  
2. Entras al **Hub** (tu escritorio).  
3. Ves tu día (“Mi día”: señales útiles de productos conectados).  
4. Abres el producto que necesitas (Dakinis One, LifeFlow, etc.).  
5. Si trabajas en equipo, invitas gente al **mismo espacio** — sin montar un universo distinto por herramienta.

Hoy ya funciona bien el **acceso unificado** (mismo login entre productos clave).  
La visión completa es que los datos de negocio también fluyan más entre productos; eso va **en progreso** — no se vende como “ya está 100% sincronizado todo con todo”.

---

## Para quién es

| Audiencia | Qué le importa de Dakinis |
|-----------|---------------------------|
| **Dueño de negocio / local** (ej. heladería, cafetería) | Operar el día a día + un solo sitio desde el que entrar |
| **Profesional / autónomo** | Finanzas + herramientas sin fragmentarse |
| **Creador / streamer** | Comunidad + automatizar redes |
| **Equipo pequeño** | Misma identidad, menos fricción entre herramientas |

Caso piloto real: **Heladería Copérnico** (piloto en condiciones especiales / gratis). Sirve para validar Hub + Dakinis One con un negocio de verdad.

---

## Filosofía de producto (por qué no es un monolito)

- Cada producto **puede vivir solo**.  
- Juntos **valen más** (mismo login, mismo Hub, misma lógica de plataforma).  
- No se inventa “otra suite gigante” de golpe: se **añaden módulos** según necesidad.  
- La apuesta no es “más features”. Es **menos fragmentación**.

Eslogan útil:

> *Dakinis Systems no crea aplicaciones. Construye un ecosistema donde cada herramienta potencia a las demás.*

---

## Estado honesto (julio 2026)

| Aspecto | Realidad |
|---------|----------|
| Madurez general | ~90% en producción / go-live |
| Clientes de pago | **0** — objetivo inmediato: el primero |
| Piloto | Heladería Copérnico (activo) |
| Hub | Muy avanzado (escritorio + “Mi día” con datos reales) |
| Dakinis One | Beta / piloto |
| LifeFlow | En producción (suscripciones manuales; sin escanear Gmail por privacidad) |
| AkoeNet / StreamAutomator | Beta |
| Billing | Código listo; falta validar cobro real de punta a punta |
| Integración profunda de datos entre productos | Parcial — SSO y Hub sí; sync total de negocio aún no |

**Cuello de botella actual:** no es “falta inventar otro módulo”.  
Es **validación comercial** (demo con piloto + primer cliente de pago).

---

## Qué NO es (para no confundirse)

| No es… | Porque… |
|--------|---------|
| Solo un ERP | Dakinis One es *un* producto; la plataforma es más grande |
| Solo una fintech | LifeFlow es un producto, no toda la marca |
| “ChatGPT para empresas” | La IA es capacidad transversal, no el producto estrella |
| Microsoft 365 “ya” | Hay inspiración conceptual (hub + suite); **no** se compara en ventas como si fuera esa escala |
| Un monolito | Son piezas modulares sobre plataforma común |

---

## Preguntas frecuentes (nivel “conoce tech, no necesita código”)

**¿Es SaaS?**  
Sí: plataforma en la nube, productos modulares, identidad compartida.

**¿Compites con Notion / Slack / un TPV / un Excel?**  
Compites sobre todo con el **stack improvisado** de muchas tools. Cada producto puede solapar con algo del mercado; la diferencia es el **ecosistema**.

**¿Qué ve primero un cliente?**  
El **Hub**. Luego Dakinis One u otros según el caso.

**¿Qué falta para que “cuadre” el negocio?**  
Demo seria con el piloto, feedback, y **cobrar** (Billing E2E con un pago real).

**¿Por qué no meter Marketplace / mil features?**  
Porque sin primer pago, más superficie solo aumenta riesgo. Primero validar valor.

---

## Pitch de 60 segundos (puedes leerlo tal cual)

> La mayoría de negocios no sufren por falta de apps: sufren por tener demasiadas que no se hablan. Dakinis es una plataforma operativa modular: un login, un Hub como escritorio, y productos para operar el negocio, el dinero, el equipo y las redes. Cada uno funciona solo; juntos dejan de ser un puzzle. Hoy está casi todo en producción, con un piloto real; el siguiente paso no es inventar más, es demostrar valor y conseguir el primer cliente de pago.

---

## Si quieres profundizar después

| Si pregunta… | Documento |
|--------------|-----------|
| Estado / qué falta | `STATUS.md` |
| Prioridades | `ROADMAP.md` |
| Mensaje de marca / landing | `company/MESSAGING.md` |
| Arquitectura / stack | `ARCHITECTURE.md` (eso sí es técnico) |

---

*TEMP · para compartir con alguien de confianza · archivar o fusionar cuando el mensaje quede canónico.*

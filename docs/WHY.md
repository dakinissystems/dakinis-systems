# Por qué — decisiones de arquitectura y producto

> **Julio 2026** · Contexto para nuevos desarrolladores, socios y futuros hires.  
> El **qué** está en [`ARCHITECTURE.md`](./ARCHITECTURE.md) y [`PRODUCTS.md`](./PRODUCTS.md). Aquí el **por qué**.

---

## Plataforma

### ¿Por qué existe el Hub?

**Problema:** Cinco productos = cinco logins, cinco facturas, datos fragmentados.  
**Solución:** Un escritorio (Hub) donde el cliente ve su día, su equipo y abre productos con SSO.

El Hub no es un launcher bonito — es la **identidad de workspace** y el punto de entrada comercial (*Empieza en tu Hub*).

### ¿Por qué Core está separado de Platform?

**Core (Dakinis One)** es un producto ERP con lógica de negocio (CRM, restaurante, facturas).  
**Platform** (Auth, Billing, AI) sirve a *todos* los productos.

Mezclarlos haría que cada producto nuevo reescribiera login y pagos. La separación permite LifeFlow, AkoeNet y Tabletop sin duplicar infra.

### ¿Por qué Billing es platform y no parte de Core?

Stripe, webhooks y planes son **transversales**. Un workspace paga una vez; varios productos consumen el mismo plan.

Core solo hace proxy — no tiene SDK Stripe embebido.

### ¿Por qué Knowledge es servicio aparte de AI?

La **memoria de la empresa** (docs, FAQ, RAG) debe sobrevivir al modelo LLM que uses hoy. Search indexa; AI consume. Cambiar de proveedor IA no debe re-ingestar todo.

### ¿Por qué Internal API?

Orquestación service-to-service (Hub dashboard, workspace admin, AkoeNet Assistant) sin exponer Supabase cross-schema a cada producto.

---

## Productos

### ¿Por qué existe LifeFlow si ya hay fintech en España?

LifeFlow **no compite con Fintonic** (agregador). Compite con la idea de **planificación de vida** — gemelo financiero, escenarios, coach IA. Océano azul en España; comparable internacional: ProjectionLab.

Sin agregación bancaria el valor es manual; con [`BANKING-PLATFORM.md`](./BANKING-PLATFORM.md) el coach IA trabaja sobre datos reales.

### ¿Por qué AkoeNet no usa bots externos como Discord?

Discord obliga a invitar Carl, Dyno, MEE6, StreamElements… cada uno con su token, su factura OpenAI y sin contexto del servidor.

**AkoeNet Assistant** = un panel, módulos nativos, misma AI Platform, permisos unificados. → [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md)

### ¿Por qué StreamAutomator es producto aparte?

Nicho streaming (Twitch, YouTube, overlays) con Stripe propio y usuarios que pueden no ser clientes ERP. La **integración nativa con AkoeNet** es el puente al ecosistema Dakinis.

### ¿Por qué Tabletop con cuenta opcional?

Onboarding sin fricción → usuario prueba Dakinis → descubre Hub → otros productos. D&D Beyond exige cuenta y licencia; nosotros SRD + offline.

### ¿Por qué vertical restaurante en Dakinis One?

Holded domina ERP genérico español con años de ventaja y PSD2. **Restaurante + IA** es nicho donde Holded no compite fuerte — mensaje de venta claro para el piloto.

---

## Disciplina estratégica

### ¿Por qué no crear más productos antes del piloto?

La arquitectura ya está varios pasos por delante del producto comercial. Cada feature nueva debe pasar:

> *¿Mejora el recorrido Landing → Workspace → Hub → Producto → Pago → Uso diario?*

Si no → esperar. Ver [`company/CUSTOMER-JOURNEY.md`](./company/CUSTOMER-JOURNEY.md).

### ¿Por qué compararse con Microsoft 365 solo en concepto?

Arquitectónicamente el patrón Hub + workspace + suite es similar. **Comercialmente** somos PYME española en piloto — decir "comparable a Microsoft 365" en ventas genera expectativas falsas.

Usar: *"Inspirado en la experiencia de Microsoft 365 y Zoho One."*

---

## Lecturas relacionadas

| Tema | Doc |
|------|-----|
| Capacidades platform | [`PLATFORM-CAPABILITIES.md`](./PLATFORM-CAPABILITIES.md) |
| Competencia y FODA | [`company/STRATEGY.md`](./company/STRATEGY.md) |
| Ciclo workspace | [`WORKSPACE-LIFECYCLE.md`](./WORKSPACE-LIFECYCLE.md) |
| Mensaje comercial | [`company/MESSAGING.md`](./company/MESSAGING.md) |

---

*Añadir una sección cuando una decisión no sea obvia para alguien nuevo en el equipo.*

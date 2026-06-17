# WhatsApp y Condiciones de las herramientas empresariales de Meta (base)

**Última actualización:** 3 de junio de 2026  
**Implementación en UI:** `platform/core/web/src/locales/legal-core.js` (Dakinis One) · resumen en Landing privacidad.

> Este documento **no sustituye** las condiciones de Meta. Es un resumen operativo para clientes de Dakinis One. El texto legal vinculante es el publicado por Meta (actualizable sin previo aviso).

## Enlaces oficiales (consultar versión vigente)

| Documento | URL |
|-----------|-----|
| Condiciones de las herramientas empresariales de Meta (ES) | https://www.facebook.com/legal/terms/businesstools |
| Meta Data Processing Terms (DPA) | https://www.facebook.com/legal/terms/dataprocessing |
| WhatsApp Business Terms | https://www.whatsapp.com/legal/business-terms |
| Política de privacidad de Meta | https://www.facebook.com/privacy/policy/ |
| Recurso sobre consentimiento (cookies Meta) | https://www.facebook.com/business/gdpr/consent |

## Cuándo aplica

- El **cliente (tenant)** activa mensajería comercial vía **WhatsApp Business API** u otras **Herramientas empresariales de Meta** desde Dakinis One (módulo Comunicaciones).
- Dakinis Systems facilita la integración técnica; **Meta** trata datos según sus propias condiciones.
- En la UE/EEE, suelen aplicarse cláusulas de **encargado del tratamiento** (Meta Ireland) y, en ciertos casos, **corresponsabilidad** (art. 26 RGPD) respecto a datos de eventos en web/apps del cliente.

## Conceptos Meta (resumen)

| Término Meta | Significado breve |
|--------------|-------------------|
| **Datos de herramientas empresariales** | Conjunto que el cliente envía a Meta vía píxel, API de conversiones, SDK, WhatsApp API, etc. |
| **Información de contacto** | Datos que identifican personas (email, teléfono, nombre) para **búsqueda de coincidencias**; debe ir **cifrada** según documentación Meta. |
| **Datos de eventos** | Acciones en web/app/tienda (visitas, compras, mensajes comerciales, etc.) usados para medición, audiencias y anuncios. |

## Obligaciones clave del cliente (tenant)

El cliente declara y garantiza, entre otras (según Meta):

1. **Base legal y permisos** para compartir datos con Meta (RGPD / LOPDGDD y normativa aplicable).
2. **No** datos de menores de **14 años** ni categorías prohibidas (salud, financiera, SSN, tarjetas, etc.).
3. **Aviso transparente** en web/app: uso de tecnologías de terceros (incl. Meta) para medición y publicidad; cómo optar out (p. ej. https://www.aboutads.info/choices , https://www.youronlinechoices.eu/ ).
4. **Consentimiento** previo donde la ley lo exija (p. ej. cookies en UE) antes de almacenar cookies Meta en dispositivos de usuarios finales.
5. **Notificación** a Dakinis y colaboración ante reclamaciones relacionadas con el uso de herramientas Meta.
6. **Píxeles** solo en sitios **propiedad del cliente** (no en sitios de terceros sin autorización).

## Uso que Meta puede hacer (resumen sección 2)

- Búsqueda de coincidencias (información de contacto).
- Exclusión de audiencias, medición, informes de campaña, análisis.
- Creación de públicos personalizados y **mensajes comerciales** (p. ej. transaccionales en Messenger/WhatsApp).
- Mejora de entrega de anuncios y seguridad en productos Meta.
- Conservación de **datos de eventos hasta 2 años** (salvo eliminación de audiencias por el cliente).

## Rol de Dakinis Systems

| Parte | Rol habitual |
|-------|----------------|
| Cliente final del negocio | Interesado / titular de sus datos personales |
| Cliente (tenant) | **Responsable** frente a sus clientes; debe cumplir Meta Business Tools Terms al activar WhatsApp |
| Dakinis Systems | Proveedor de plataforma; tratamiento según contrato y política de privacidad de Dakinis One |
| Meta | **Encargado** / **corresponsable** según el tipo de dato y la herramienta (ver condiciones Meta y DPA) |

**Dakinis Systems no controla el tratamiento independiente de Meta.** Los clientes deben revisar la documentación legal de Meta antes de activar integraciones.

## Estado producto Dakinis One

- Módulo **Comunicaciones** (`/app/messages`): canales, reglas y vistas previa.
- Envío real por **WhatsApp Business API** requiere activación comercial y cumplimiento de condiciones Meta/WhatsApp.

---

## English summary (reference)

When a tenant enables **WhatsApp Business API** or other **Meta Business Tools** through Dakinis One, **Meta’s Business Tools Terms** apply in addition to Dakinis policies. The tenant is typically the **controller** for its end-customers’ data; Meta processes **Business Tool Data** (contact information for matching, event data for measurement and messaging) under Meta’s terms. Tenants must provide lawful basis, clear notices, consent where required, and must not send prohibited data categories. Official terms: https://www.facebook.com/legal/terms/businesstools · DPA: https://www.facebook.com/legal/terms/dataprocessing · WhatsApp Business: https://www.whatsapp.com/legal/business-terms

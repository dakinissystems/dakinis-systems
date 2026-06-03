# Roadmap WhatsApp — Dakinis One

Alineado con la arquitectura Hub → WhatsApp → CRM → OpenAI.

| Fase | Alcance | Estado en repo |
|------|---------|----------------|
| **1** | App Meta, Phone Number ID, WABA ID, mensaje de prueba | Operativo vía `POST /api/v1/whatsapp/send` + env Railway |
| **2** | Webhook público | `GET/POST /webhooks/whatsapp` (también `/api/webhooks/whatsapp`) |
| **3** | Persistencia PostgreSQL | Tablas `tenant_whatsapp_messages`, `tenant_whatsapp_contacts` — SQL: `docs/supabase/schemas/03-whatsapp-messages.sql` |
| **4** | Módulo Hub WhatsApp | UI `/app/whatsapp/*` — Conversaciones, Contactos, Plantillas, Automatizaciones, IA |
| **5** | CRM ↔ WhatsApp ↔ OpenAI | Evento `crm.whatsapp.inbound` (stub); IA cuando exista `OPENAI_API_KEY` |

## URL de producción (Meta)

```
https://api.dakinissystems.com/webhooks/whatsapp
```

(Ajusta el host al dominio real del Core Back en Railway. Alias: `/api/webhooks/whatsapp`.)

## Árbol de producto (Fase 4)

```
Hub
 └── WhatsApp  (/app/whatsapp)
      ├── Conversaciones   (/app/whatsapp/conversations)
      ├── Contactos        (/app/whatsapp/contacts)
      ├── Plantillas       (/app/whatsapp/templates)
      ├── Automatizaciones (/app/whatsapp/automations)
      └── IA               (/app/whatsapp/ai)  — roadmap Fase 5
```

## API v1 (tenant autenticado)

| Método | Ruta |
|--------|------|
| POST | `/api/v1/whatsapp/send` |
| GET | `/api/v1/whatsapp/conversations` |
| GET | `/api/v1/whatsapp/conversations/:phone/messages` |
| GET | `/api/v1/whatsapp/contacts` |
| POST | `/api/v1/whatsapp/contacts` |
| GET | `/api/v1/whatsapp/rules` |
| POST | `/api/v1/whatsapp/preview` |

Detalle operativo: [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md).

## Fase 5 — siguiente sprint

1. Handler `crm.whatsapp.inbound` → crear/actualizar contacto CRM persistido.
2. Cola + OpenAI para borrador de respuesta (opt-in tenant).
3. Tickets desde mensajes con palabras clave o reglas.

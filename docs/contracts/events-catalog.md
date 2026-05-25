# Catálogo de eventos de dominio

Convención: `producto.entidad.accion`

## Core (implementado)

| Evento | Payload |
|--------|---------|
| `tenant.created` | `tenantId`, `slug`, `type`, `plan` |
| `tenant.updated` | `tenantId`, `slug`, `type`, `plan` |
| `user.login` | `userId`, `tenantId`, `source` |
| `booking.created` | `tenantId`, `recordId`, `entity` |
| `crm.lead.created` | `tenantId`, `recordId`, `entity` |
| `message.sent` | `tenantId`, `channel`, `kind` |

## StreamAutomator (pendiente)

`stream.scheduled`, `stream.started`, `overlay.updated`, `payment.completed`, `license.activated`

## AkoeNet (pendiente)

`server.created`, `channel.created`, `message.created`, `voice.connected`, `invite.accepted`

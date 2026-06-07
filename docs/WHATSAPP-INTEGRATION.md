# WhatsApp Business API en Dakinis One

> **Audiencia:** control interno. Plan Pro, cuotas WA y exceso: [`OPERATIONS.md`](./OPERATIONS.md) §3.

## Seguridad

- **Nunca** commitear `WHATSAPP_ACCESS_TOKEN` ni pegarlo en issues/chat.
- Si un token se filtró: revocar en [Meta Business Suite](https://business.facebook.com/) → WhatsApp → API Setup → generar token nuevo.
- Variables solo en **Railway** (Core Back) o `.env` local gitignored.

## Variables (Railway / Core Back)

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `WHATSAPP_ACCESS_TOKEN` | Sí (envío) | Token permanente de la app Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Sí | ID del número (ej. `1108940402311174`) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Recomendado | WABA ID |
| `WHATSAPP_VERIFY_TOKEN` | Sí (webhook) | Cadena que defines tú al registrar el webhook en Meta |
| `WHATSAPP_APP_SECRET` | Recomendado | Valida firma `X-Hub-Signature-256` en POST webhook |
| `WHATSAPP_GRAPH_API_VERSION` | No | Default `v22.0` |
| `WHATSAPP_DEFAULT_BUSINESS_ID` | Webhook | `business.id` o slug del tenant que recibe mensajes |
| `DAKINIS_WHATSAPP_AUTO_SEND` | No | `true` para enviar en eventos de dominio (requiere `phone` + `message` en payload) |

Plantilla: `platform/core/api/.env.example`

## Endpoints

### Envío (autenticado — JWT o `x-api-key` + `x-business-id`)

```http
POST /api/v1/whatsapp/send
Content-Type: application/json

{ "phone": "34600111222", "message": "Hola desde Dakinis One" }
```

Respuesta: `{ success, messageId, to, recordId }`

### Conversaciones (almacenadas en `tenant_records`)

```http
GET /api/v1/whatsapp/conversations?limit=50
```

### Webhook Meta (público, sin auth)

| Método | URL |
|--------|-----|
| GET | `https://<core-api>/webhooks/whatsapp` — verificación (`hub.verify_token` = `WHATSAPP_VERIFY_TOKEN`) |
| POST | `https://<core-api>/webhooks/whatsapp` — mensajes entrantes y estados |

Alias: `/api/webhooks/whatsapp`, `/api/whatsapp/webhook`. Ver también [`WHATSAPP-ROADMAP.md`](./WHATSAPP-ROADMAP.md).

Alias: `/api/whatsapp/webhook`

En Meta Developer → WhatsApp → Configuration:

1. **Callback URL:** `https://<tu-dominio-core>/api/webhooks/whatsapp`
2. **Verify token:** mismo valor que `WHATSAPP_VERIFY_TOKEN`
3. Suscribir campos: `messages` (y opcionalmente statuses)

### Health

`GET /api/health` incluye `whatsappConfigured: true|false` (sin exponer secretos).

## Eventos internos

| Evento | Cuándo |
|--------|--------|
| `whatsapp.message.inbound` | Mensaje entrante guardado |
| `whatsapp.message.status` | Estado de entrega (sent, delivered, read…) |
| `message.sent` | Tras envío manual o automatización |

Próximo paso producto: UI de hilos en Comunicaciones, CRM ticket desde `whatsapp.message.inbound`, colas Redis.

## Legal

Política Core §§10–12 y [Condiciones Meta Business Tools](./legal/whatsapp-meta-business-tools-base.md).

# Integraciones — catálogo platform

> **Julio 2026** · Roadmap de conectores. La mayoría **no están implementados** — documentar intención y prioridad.  
> UI futura: Hub `/admin/integrations` · Capacidad → [`PLATFORM-CAPABILITIES.md`](./PLATFORM-CAPABILITIES.md)

---

## Principio

Las integraciones son **capacidad de plataforma**, no features sueltas por producto. Un conector Slack sirve a Hub, AkoeNet y notificaciones; un conector bancario sirve a LifeFlow y futuro Dakinis One.

**Regla piloto:** no implementar conectores nuevos hasta Billing E2E + primer cliente — salvo los que desbloqueen el piloto (p. ej. Stripe ✅).

---

## Catálogo por categoría

### Identidad y productividad

| Integración | Uso Dakinis | Estado | Prioridad |
|-------------|-------------|--------|-----------|
| **Google Workspace** | SSO, Calendar, Drive ingest | ⬜ | 🟡 post-piloto |
| **Microsoft 365** | SSO, Outlook, Teams | ⬜ | 🟡 |
| **Apple** | Sign in with Apple | ⬜ | 🔵 |

### Comunicación

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **Slack** | Notificaciones, slash, tickets | ⬜ | 🟡 |
| **Microsoft Teams** | Notificaciones enterprise | ⬜ | 🔵 |
| **Discord** | Migración comunidades → AkoeNet | ⬜ | 🔵 |
| **WhatsApp (Meta)** | Dakinis One mensajes | 🔄 código Core | 🟠 |
| **Twilio** | SMS, voz | ⬜ | 🔵 |

### Desarrollo y ops

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **GitHub** | AkoeNet Developer module, webhooks | ⬜ | 🟡 |
| **GitLab** | CI/CD alerts | ⬜ | 🔵 |
| **Railway** | Deploy notifications | ⬜ | 🔵 |
| **Supabase** | Schema alerts | ⬜ | 🔵 |

### Productividad y datos

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **Notion** | Knowledge ingest | ⬜ | 🟡 |
| **Zapier** | Automations no-code | ⬜ | 🟡 |
| **Make (Integromat)** | Automations EU | ⬜ | 🟡 |
| **n8n** | Self-hosted automations | ⬜ | 🔵 |

### Pagos y finanzas

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **Stripe** | Billing platform | ✅ Live | — |
| **GoCardless** | Open Banking EU (LifeFlow) | ⬜ diseño | 🟡 |
| **Plaid** | Agregación US | ⬜ diseño | 🟡 |
| **Belvo / Prometeo** | LATAM | ⬜ diseño | 🔵 |

→ Arquitectura bancaria: [`BANKING-PLATFORM.md`](./BANKING-PLATFORM.md)

### Marketing y ads

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **Meta (Pixel)** | Landing analytics | ✅ | — |
| **Google Ads** | SEM | ⬜ | 🟠 |
| **Mailchimp / Resend** | Email marketing | 🔄 Resend scaffold | 🟡 |

### Streaming

| Integración | Uso | Estado | Prioridad |
|-------------|-----|--------|-----------|
| **Twitch** | StreamAutomator OAuth | ✅ | — |
| **YouTube** | StreamAutomator | ✅ | — |
| **StreamElements** | No — nativo SA+AkoeNet | — | — |

---

## Modelo técnico (futuro)

```
Hub / Producto
      ↓
Integration Registry (meta.integrations)
      ↓
Connector (OAuth / API key / webhook)
      ↓
Normalizer → Events bus → Notifications / AI / Producto
```

Tablas previstas (migr. 031): `api_keys`, `webhooks`, `webhook_logs`.

---

## Priorización

| Fase | Integraciones |
|------|---------------|
| 🔴 Piloto | Stripe ✅ · WhatsApp si cliente restaurante |
| 🟠 Piloto+ | Google Calendar · Slack notificaciones |
| 🟡 5+ clientes | Zapier · Notion ingest · GoCardless LifeFlow |
| 🔵 Escala | Marketplace connectors · Teams · n8n |

---

*Actualizar estado al implementar cada conector. No prometer en landing hasta ✅.*

# Dakinis Scout

Alertas de oportunidades (Amazon ↔ Wallapop / marketplaces) → Discord embeds primero; pensado para enganchar luego a `opportunity.created` (Telegram, email, WhatsApp, dashboard).

## Discord notifier

```js
import { discordNotifier } from "@dakinis/scout";

await discordNotifier.sendOpportunity({
  product: "LEGO Star Wars 75379",
  buyPrice: 54.99,
  sellPrice: 79.95,
  profit: 17.3,
  roi: 31,
  amazonUrl: "https://…",
  wallapopUrl: "https://…",
  urgency: "green", // green | yellow | red | blue | purple
});
```

## Setup

1. En Discord: canal → Integraciones → Webhooks → crear (**nombre:** `Dakinis Scout`).
2. Copiar la URL solo a `.env` (nunca a git ni chats):

```bash
cd tools/dakinis-scout
cp .env.example .env
# edita DISCORD_WEBHOOK_URL=…
npm run test:discord
```

Webhook = secreto. Si lo pegaste en un chat, **regenera el token** en Discord.

## Multi-canal

Opcional por categoría:

```env
DISCORD_WEBHOOK_URL=…                 # default
DISCORD_WEBHOOK_URL_LEGO=…
DISCORD_WEBHOOK_URL_TECNOLOGIA=…
```

`sendOpportunity({ category: "lego", … })` usa el webhook específico si existe.

## Arquitectura (siguiente)

```
Opportunity Engine → opportunity.created
        ├── Discord  (este paquete)
        ├── Telegram
        ├── Email
        └── Dashboard / historial
```

Umbrales tipicos: profit > 15 → Telegram; > 25 → Discord; > 50 → WhatsApp; > 100 → todos.

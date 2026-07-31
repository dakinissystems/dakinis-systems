# Dakinis Scout

Opportunity engine: watchlist → Wallapop search → compare → `opportunity.created` → Discord (Telegram/WhatsApp stubs).

## Quick start

```bash
cd tools/dakinis-scout
cp .env.example .env   # set DISCORD_WEBHOOK_URL
npm run once           # one scan + Discord alerts
npm run loop           # every SCOUT_LOOP_SECONDS (default 300)
```

Dry-run (no Discord):

```bash
# PowerShell
$env:SCOUT_DRY_RUN=1; npm run once
```

## How it works

```
config/watchlist.json
        │
        ▼
 Opportunity Engine
        │  Wallapop /api/v3/search
        ▼
 opportunity.created
        │
        ├── Discord   (profit ≥ SCOUT_MIN_PROFIT_DISCORD, default 15€)
        ├── Telegram  (stub)
        └── WhatsApp  (stub)
```

### Strategies per watch item

1. **amazon_to_wallapop** — `buyPrice` vs Wallapop median sell  
2. **wallapop_undervalued** — listings ≥10% under `targetSellPrice` (or median) with profit ≥ threshold

Dedup in `data/seen.json` so the same deal is not re-alerted.

## Watchlist

Edit `config/watchlist.json`:

```json
{
  "id": "iphone-13-128",
  "product": "iPhone 13 128GB",
  "category": "tecnologia",
  "wallapopQuery": "iphone 13 128",
  "buyPrice": 190,
  "targetSellPrice": 260,
  "amazonUrl": "https://www.amazon.es/s?k=iphone+13+128",
  "minProfit": 15,
  "enabled": true
}
```

## Discord-only helper

```js
import { discordNotifier } from "@dakinis/scout";
await discordNotifier.sendOpportunity({ product: "…", buyPrice: 10, sellPrice: 40, profit: 25, roi: 250 });
```

## Notes

- Amazon buy prices are **manual / watchlist** in v0.2 (live Amazon scrape comes later).
- Wallapop access can rate-limit; keep `SCOUT_LOOP_SECONDS` ≥ 180.
- Webhook URL is a secret — never commit `.env`.

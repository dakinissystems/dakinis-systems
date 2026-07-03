# Dakinis Notifications

**Cross-product notifications platform** — email, push, in-app inbox, webhooks and channel adapters.

> **Status:** repo ✅ · scaffold en GitHub · **Railway:** not deployed yet.

| | |
|---|---|
| **GitHub** | [github.com/dakinissystems/dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications) |
| **Railway** | API service + Worker (same repo, different start command) |
| **Domain (target)** | `notifications.dakinissystems.com` |
| **Gateway prefix** | `/notifications/` |
| **Database** | Supabase `hub.notifications` + Redis queues |

## Flow

```
Product → Event bus → Notifications Worker → channel adapters (email, push, in-app…)
```

## Services in this repo

| Process | Start command | Role |
|---------|---------------|------|
| API | `npm start` | REST: send, preferences, inbox |
| Worker | `npm run worker` | BullMQ consumer (scaffold) |

## Local

```powershell
cd notifications
npm install
npm run dev          # API :4081
npm run worker       # worker (needs REDIS_URL)
```

## Deploy (Railway)

1. Connect to [dakinis-notifications](https://github.com/dakinissystems/dakinis-notifications).
2. Service **API**: start `npm start`
3. Service **Worker** (later): start `npm run worker`, no public domain
4. `REDIS_URL`, `DATABASE_URL`, `RESEND_API_KEY`, `JWT_SECRET`

## Contracts

[`docs/contracts/notifications.json`](../docs/contracts/notifications.json)

# Dakinis Hub

**Unified application shell, launcher and cross-product workspace** for the Dakinis ecosystem.

The Hub is evolving from a simple app launcher into the **operating system layer** of Dakinis: the user's home for activity, AI summaries, notifications and widgets — with product apps as a secondary entry point.

Production: [hub.dakinissystems.com](https://hub.dakinissystems.com)

---

## Vision

```
Home (Mi día)
    ↓
Timeline (cross-product activity)
    ↓
Notifications
    ↓
Apps (launcher — last, not first)
    ↓
Widgets (LifeFlow, Core, StreamAutomator…)
```

The Hub shares the **same AppShell** as Core and LifeFlow via `@dakinis/shared-layouts`. Only the product accent color changes.

---

## Architecture role

| Layer | Responsibility |
|-------|----------------|
| **Platform** | Hub is a platform service (like Auth or AI), not a product |
| **DES** | UI from `@dakinis/shared-des` — AppShell, dashboard sections, command palette |
| **Data** | Aggregates cross-product activity via Internal API and event bus (roadmap) |
| **Deploy** | Railway service — static/SPA or SSR frontend |

---

## Dashboard sections (canonical)

Order defined in `@dakinis/shared-ux/hub-dashboard`:

1. Mi día · Agenda · Notifications · Activity · AI summary · Health · Widgets · **Applications** (last)

---

## Related repos

| Repo | Role |
|------|------|
| `dakinis-shared` | DES packages (AppShell, tokens, components) |
| `dakinis-systems` | Gateway routes, contracts |
| `dakinis-ai` | Shared AI platform — summaries and agents |
| Product repos | Widget data sources (Core, LifeFlow, etc.) |

---

## Local development

Clone into `hub/` next to `dakinis-systems` (gitignored control repo pattern).

```bash
npm install
npm run dev
```

Gateway prefix: `/hub/` or dedicated subdomain in production.

---

## Roadmap

- 🔄 Hub-first UX (Mi día before launcher)
- ⬜ Cross-product timeline from event bus
- ⬜ Notifications center wired to Notifications service (when live)
- ⬜ Full AppShell adoption from `@dakinis/shared-layouts`

Use **`HubDashboardPage`** from `@dakinis/shared-layouts` as the starting dashboard:

```jsx
import { HubDashboardPage } from "@dakinis/shared-layouts";

export default function HomePage() {
  return <HubDashboardPage userName="Christian" />;
}
```

Internal API: `GET /internal/hub/dashboard/:userId` (via gateway) for aggregated section data.

---

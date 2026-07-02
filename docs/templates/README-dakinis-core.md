# Dakinis Core

**Multi-tenant Business Operating System (BOS)** for Dakinis Systems — CRM, inventory, restaurant operations, reservations, invoicing, internal messaging and **AI Copilot** for SMEs.

Production: [core.dakinissystems.com](https://core.dakinissystems.com)

---

## What Core is

Core is a **product**, not the platform. It runs on shared platform services:

| Platform service | Usage |
|------------------|-------|
| Auth | JWT, multi-tenant identity |
| AI | `core-advisor` agent, Copilot |
| Gateway | `/core/` API routing |
| DES | Shared UI via `@dakinis/shared-*` |

---

## Modules

- CRM, inventory, restaurant, reservations, invoices
- Internal messaging, WhatsApp integration (roadmap)
- Stripe billing (migrating to platform Billing service)
- Demo tenant and commercial funnel

Plans: **Starter · Growth · Pro**

---

## Repository layout

Typical structure: `api/` + `web/` + vendored `packages/shared-brand/`.

Sync brand tokens from monorepo:

```bash
node scripts/sync-shared-brand.mjs   # in dakinis-systems control repo
```

---

## Related

- Platform overview: [dakinis-systems](https://github.com/dakinissystems/dakinis-systems)
- DES / AppShell: [dakinis-shared](https://github.com/dakinissystems/dakinis-shared)

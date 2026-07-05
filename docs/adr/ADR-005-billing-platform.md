# ADR-005 — Billing platform

## Contexto

Stripe, planes, suscripciones y acceso degradado afectan a Core y futuros productos. Billing embebido en Core no escala.

## Decisión

**Billing** como servicio platform (`dakinis-billing`, `/billing/`, schema `billing`). Core proxy público `/api/public/stripe/*` hacia Billing. Webhooks Stripe solo en Billing. Eventos Redis → Core actualiza `business.plan` y `access_state`.

## Consecuencias

- Stripe Live keys solo en Billing (no Core Back).
- Roadmap: Plans → Subscriptions → Invoices → Credits → Marketplace usage → Licenses.
- E2E checkout Live es hito de ejecución, no de rediseño.

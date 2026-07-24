# External uptime (consola) — complementa `.github/workflows/uptime-probes.yml`

## Objetivo

Alerta por email/Slack si cae un health crítico, sin depender solo de GitHub Actions.

## Opción A — UptimeRobot (gratis)

1. https://uptimerobot.com → Add New Monitor (HTTP(s))
2. Intervalo 5 min · Alert Contacts = tu email (o Slack webhook)
3. Monitores sugeridos:

| Nombre | URL |
|--------|-----|
| Gateway | `https://api.dakinissystems.com/health` |
| Auth | `https://auth.dakinissystems.com/health` |
| Core API | `https://api.dakinissystems.com/core/api/health` |
| Billing | `https://api.dakinissystems.com/billing/health` |
| Internal | `https://api.dakinissystems.com/internal/health` |
| AkoeNet | `https://api.akoenet.dakinissystems.com/health` |
| StreamAutomator | `https://api.streamautomator.com/api/health` |

4. Anotar fecha en [`STATUS.md`](../STATUS.md) KPI / «Qué falta».

## Opción B — Cloudflare Health Checks

Dashboard → Traffic → Health Checks (o Reliability) · mismo set de URLs · notificación email.

## Opción C — Better Stack

https://betterstack.com → Uptime → Add monitor · webhook Slack opcional.

## Relación con CI

`.github/workflows/uptime-probes.yml` corre cada 15 min en GitHub (fail job = señal en Actions).
La alerta externa es la que te despierta sin mirar Actions.

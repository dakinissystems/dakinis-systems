# Modelo de negocio

## Qué vendemos

**Dakinis Platform** — suscripción que incluye Hub, identidad, billing platform e IA compartida.

**Dakinis One** — producto principal de operaciones (CRM, citas, inventario, WhatsApp…). **Un producto entre varios**, no la marca entera. *(Nombre interno en repos: Core.)*

Satélites: LifeFlow, StreamAutomator, AkoeNet (SSO desde Hub; SA con Stripe propio).

Mensaje → [`MESSAGING.md`](./MESSAGING.md)

## Ingresos

| Fuente | Mecanismo |
|--------|-----------|
| **Plataforma + Dakinis One** | Planes Growth / Pro (Billing · Stripe Live) |
| **Upsell productos** | LifeFlow, SA, AkoeNet |
| **Servicios a medida** | Landing «Soluciones» |

## Ventaja estructural

Auth · Hub · Billing · AI · Knowledge **una vez** — cada producto nuevo no reescribe login ni pagos.

## Cliente ideal (jul 2026)

PYME España que quiere **un solo lugar** (Hub) para operar el negocio y abrir módulos sin montar 5 SaaS.

## Qué NO vendemos aún

Marketplace · plugins · storage enterprise · banking global — post-validación comercial.

Diseño documentado: [`MARKETPLACE.md`](../MARKETPLACE.md) · [`BANKING-PLATFORM.md`](../BANKING-PLATFORM.md)

Detalle planes → [PRICING-STRATEGY.md](./PRICING-STRATEGY.md)

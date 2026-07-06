# Estrategia de precios

## Posicionamiento

**Valor:** plataforma + Hub, no un ERP barato ni 40 herramientas sueltas.

**Mensaje canónico:** *Un sistema operativo para empresas modernas* — [`MESSAGING.md`](./MESSAGING.md)

## Planes Dakinis One (referencia)

Definidos en Billing platform · Stripe Live · Dakinis One `/precios` (repo `core`).

| Plan | Rol |
|------|-----|
| Starter / Free | Entrada · límites |
| Growth | Primer cliente de pago objetivo |
| Pro | Módulos avanzados · WhatsApp · más seats |

Precios concretos: Stripe Dashboard + `docs/supabase/seeds/billing.sql` · no duplicar cifras aquí (cambian en Stripe).

## Reglas

1. **Un plan claro en landing** — Growth como ancla, no tabla infinita.
2. **Trial o piloto** — primer cliente puede ser precio especial documentado (no código).
3. **Degraded** — impago baja `access_state` sin borrar datos ([legal/TENANT-ACCESS](../legal/TENANT-ACCESS-AND-SUSPENSION.md)).
4. **Productos separados** — LifeFlow/SA pueden tener pricing propio más adelante.

## Pendiente comercial

- [ ] Página `/precios` alineada con un solo CTA
- [ ] Primer cliente con precio piloto cerrado por escrito
- [ ] Customer Portal Stripe wired en Dakinis One (roadmap; repo `core`)

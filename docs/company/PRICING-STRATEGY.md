# Estrategia de precios

## Posicionamiento

**Valor:** plataforma + Hub, no un ERP barato ni 40 herramientas sueltas.

**Mensaje canónico:** *Un sistema operativo para empresas modernas* — [`MESSAGING.md`](./MESSAGING.md)

## Planes Dakinis One (canónico · B5)

Definidos en Billing + Stripe Live + Dakinis One `/precios` (repo `core`). Evidencia ops: worktree `tmp/B5-catalogo-planes.md`.

| Code | Nombre | Rol |
|------|--------|-----|
| `starter` | Starter | Entrada · límites |
| `growth` | Growth | **Ancla** · primer cliente de pago |
| `pro` | Pro | Módulos avanzados · WhatsApp · más seats |
| — | Enterprise | Escala / SLA · contacto (no checkout self-serve) |

Price IDs Live (no importes): ver respuesta de `GET /core/api/public/stripe/plans` o Stripe Dashboard. Seed: [`../supabase/seeds/billing.sql`](../supabase/seeds/billing.sql).

### Productos aparte (no mezclar en `/precios` One)

| Producto | Planes |
|----------|--------|
| StreamAutomator | `sa-creator-monthly`, `sa-pro-monthly`, `sa-lifetime` |
| LifeFlow | `lite` / `premium` / `pro` (tier app; no es el catálogo One) |

## Reglas

1. **Un plan claro en landing** — Growth como ancla, no tabla infinita.
2. **Trial o piloto** — primer cliente puede ser precio especial documentado (no código).
3. **Degraded** — impago baja `access_state` sin borrar datos ([legal/TENANT-ACCESS](../legal/TENANT-ACCESS-AND-SUSPENSION.md)).
4. **Productos separados** — LifeFlow/SA pricing propio; no aparecen como cards One.

## Pendiente comercial

- [ ] `/precios`: un solo CTA primario (Growth); Starter/Pro secundarios
- [ ] Primer cliente con precio piloto cerrado por escrito
- [ ] Customer Portal Stripe wired en Dakinis One (roadmap; repo `core`)

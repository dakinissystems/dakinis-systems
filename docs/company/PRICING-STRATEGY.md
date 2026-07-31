# Estrategia de precios

## Posicionamiento

**Valor:** plataforma + Hub, no un ERP barato ni 40 herramientas sueltas.

**Mensaje canónico:** *Un sistema operativo para empresas modernas* — [`MESSAGING.md`](./MESSAGING.md)

**Vender tiempo:** junto a cada plan SaaS comunicar horas ahorradas estimadas (Starter ~5 h, Growth ~15 h, Pro ~40 h+/mes).

## Planes Dakinis One (referencia comercial)

Fuente de cifras: `platform/core/shared/catalog/bos-pricing.js` · UI `/precios`.

| Plan | Rol | Precio ref. | Usuarios | Storage |
|------|-----|-------------|----------|---------|
| Starter | Entrada · “empiezo” | 39 €/mes | hasta 2 | 5 GB |
| Growth | Ancla · “ya tengo negocio” | 89 €/mes | hasta 8 | 50 GB |
| Pro | Automatizar · IA/WhatsApp | 169 €/mes | ilimitados | 200 GB |
| Enterprise | Ancla psicológica + escala | desde 299 €/mes | ilimitados | 500 GB |

Usuario adicional: **8 €/usuario/mes** (Starter/Growth).

WhatsApp se comunica en **conversaciones/mes**; IA en **respuestas IA/mes** (no “consultas”).

### Implantación (consultoría, one-time)

| Plan | Precio |
|------|--------|
| Starter | 290 € |
| Growth | 690 € |
| Pro | 1.490 € |

### Desarrollo / soporte

| Concepto | Precio |
|----------|--------|
| Hora desarrollo | 60 €/h |
| Pack MVP / Sistema / Avanzado | 600 / 1.500 / 3.000 €+ |
| Soporte básico / prioridad / premium | 29 / 79 / 149 €/mes (con horas incluidas) |

Stripe Dashboard y seeds de Billing deben alinearse cuando se activen Price IDs nuevos — no duplicar IDs aquí.

## Reglas

1. **Growth como ancla** en landing/Core — Enterprise hace que Pro parezca barato.
2. **Trial o piloto** — primer cliente puede ser precio especial documentado (no código).
3. **Degraded** — impago baja `access_state` sin borrar datos ([legal/TENANT-ACCESS](../legal/TENANT-ACCESS-AND-SUSPENSION.md)).
4. **Productos separados** — LifeFlow/SA pueden tener pricing propio más adelante.
5. **Implantación ≠ software** — siempre pago único de consultoría, no regalada.

## Pendiente comercial

- [ ] Actualizar Price IDs Stripe Live a 39/89/169 (+ Enterprise cotización)
- [ ] Enforcement real de límites de usuarios/storage en Core
- [ ] Customer Portal Stripe wired en Dakinis One (roadmap; repo `core`)
- [ ] Alinear `billing/src/plans.js` con el catálogo BOS

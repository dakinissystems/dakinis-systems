# Runbook — Circuito comercial

Un negocio tiene que poder entrar, pagar y operar sin que alguien de Dakinis esté en la llamada. Este es el único frente hasta que eso ocurra. No abre módulos, juegos ni servicios nuevos.

Relacionado: [billing E2E](./billing-e2e.md) · [STATUS](../STATUS.md) · [operaciones](../OPERATIONS.md).

## Orden

1. Invitación y permisos del piloto Copérnico (`heladeria-copernico`).
2. Billing de punta a punta, en el repo `dakinis-billing`.
3. Hub con datos reales de Core y de al menos otro producto.
4. Onboarding: empresa, empleados, productos, inventario y una venta, sin asistencia.
5. Staging mínimo y MFA de Cloudflare antes de repetir el circuito con un segundo negocio. El staging del escenario incluye Gateway, Auth, Core, Billing, Hub e Internal API, más el worker que lleve la venta hasta Hub. El detalle está en [infra del desarrollador](./infra-desarrollador.md).

Antes de un segundo negocio real, estos ocho puntos tienen que tener evidencia. Ninguno queda cerrado por este documento.

1. Una empresa no lee datos de otra.
2. Un rol que no tiene el permiso no ejecuta la operación.
3. Una sesión se puede revocar.
4. Un secreto comprometido se puede invalidar.
5. Un reintento de webhook no duplica un cobro.
6. La base de datos se recupera desde un backup en un entorno aislado.
7. Una acción administrativa sensible queda registrada.
8. Una incidencia P0 tiene un procedimiento escrito y un responsable.

Glovo, Uber, SSE, System Health, Stripe 23 y tablas fiscales por país no entran en este circuito.

## Escenario que tiene que salir entero

Para quien usa el producto es una sola operación. Por dentro pueden intervenir varios servicios.

1. Un empleado registra una venta en Core.
2. El inventario se descuenta.
3. Quien administra consulta el resultado.
4. Si falta stock, el aviso aparece en Hub con una acción, no solo un número.
5. El plan del negocio coincide con lo pagado en Stripe.

Si el paso 5 no tiene un webhook en **200**, el piloto sigue en cortesía. No se anuncia cobro.

## Billing

Seguir [billing-e2e.md](./billing-e2e.md) y comprobar también renovación, cambio de plan, cancelación e impago. Core no guarda `STRIPE_*`. El secreto del webhook vive en el servicio `dakinis-billing`.

Hecho cuando `billing.subscriptions` y `business.plan` muestran el mismo plan tras un checkout real.

## Qué no se enciende todavía

| Pieza | Condición para tocarla |
|---|---|
| Notifications con Resend | Un producto envía un aviso que alguien tiene que recibir |
| Search, Knowledge, pgvector | Un producto consulta el índice |
| Cuotas de AI y tool-calling | Hay uso medible en el piloto |
| Nómina (PR #64) | El circuito de arriba ya cobra |
| Fiscal `059` / `060` y Config → Fiscal | SQL aplicado en Supabase y revisión normativa aparte. No es un SIF certificado |
| AkoeNet Assistant | La comunidad ya se usa sin el asistente |
| Automatizaciones compartidas | Hay al menos un disparador real (venta, pago o stream) ya observado |

## Distribución del esfuerzo

Mientras no haya un cliente de pago: Dakinis One y este circuito, 60 %. Productos independientes, 20 %. Juegos, 15 %. Experimentos, 5 %.

No se construye una función nueva si la anterior no la ha usado una persona que no sea quien la programó.

## Juegos, en paralelo y sin crecer de alcance

| Proyecto | Siguiente paso | No hacer |
|---|---|---|
| Mythos | Prueba 2 con Astra, Pyrix y Luphar | Especies, regiones, jefes |
| Eclipse | Otra persona juega el combate 7.9 | Sigilo, Resonancia, misión completa |
| Aesir | Cerrar el ciclo explorar → botín → mejora | Catálogo grande |
| Settlement Directive | Seguir su ROADMAP y alinear la versión del README | Ampliar vehículos antes de que construcción, recursos y defensa se hablen |
| Ashen Path | Aparcarlo | Coop y contenido nuevo |
| Cifras y Letras | Dejarlo como está | Funciones nuevas |
| JoyMaker | Esperar a tener fuente y roadmap | Cualquier feature |
| Vault | Revisión del formato y recuperación en un dispositivo limpio | Usarlo como bóveda. Passkeys. Steam Guard |
| AI Studio | Interfaz React del pipeline ya cerrado | Más generación por IA |

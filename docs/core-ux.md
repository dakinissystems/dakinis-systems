# Dakinis One (Core) · mapa de UX

El contrato entre Hub y Core está en [DAKINIS-UX-ARCHITECTURE.md](DAKINIS-UX-ARCHITECTURE.md). Este archivo sigue siendo el inventario de pantallas.

Fuente: código de `D:\dakinis-systems\platform\core` en `origin/main` `e0d1f5c` (13 nov 2026). El commit está en GitHub. Este archivo no afirma que Railway ya sirva esa versión. No es un recorrido de producción en el navegador.

Core no es una sola aplicación. Son cuatro experiencias dentro del mismo shell (`DesAppShell`, producto `core`, layout en columna):

1. **Comercial público**: inicio, precios, legal, login.
2. **App del negocio** (`/app/*`): clientes, ventas, inventario, analítica, WhatsApp, ajustes, panel del día.
3. **Operación de hostelería** (`/sistema/:vertical`): sala, cocina, stock, delivery, caja y configuración.
4. **Plataforma** (`/admin`): negocios, usuarios, alertas y maquetas.

La barra superior es la única navegación global. No hay sidebar. Hostelería tiene además un dock propio.

## Quién ve qué

| Sesión | Entra en | Barra |
| --- | --- | --- |
| Sin sesión | `/` (inicio de producto) | Idioma, Entrar, acceso a precios |
| Negocio con token | `/app/dashboard` | Copilot, búsqueda, Panel, Clientes, WhatsApp, Mi negocio, Ajustes, nombre, Salir |
| Demo de negocio | El mismo dashboard en modo presentación | Sin Hub, sin Ajustes, sin precios |
| Admin de plataforma | `/` y `/admin`. Si abre `/sistema/` vuelve a `/admin` | Panel de plataforma, sin navegación de negocio |

En una sesión de negocio, la fila de módulos es Panel, Clientes y WhatsApp. Inventario, Ventas y Analytics no están en esa fila: en hostelería viven en el dock; fuera de hostelería no tienen todavía una serie real. El botón Hub de esa fila ya no se llama Hub. Quien no es un negocio ve «Módulos» y abre `/hub` de este repo. **El dock de sala no sale en la barra**: sale con «Mi negocio».

Verticales de hostelería que comparten la misma operación: restaurante, hamburguesería, pizzería, bar, cafetería, heladería y food truck. La clave de interfaz sigue siendo `restaurante`.

Otros sectores del catálogo (clínica, peluquería, inmobiliaria, gimnasio, academia, taller, veterinaria, hotel, retail, distribuidor, ecommerce) tienen plantilla de KPIs y onboarding, y una página genérica `/sistema/:tipo` con formulario de alta y listado. No tienen el dock de sala.

## Barra superior

Orden cuando hay sesión de negocio:

- Logo (sitio corporativo) y título **Dakinis One** (vuelve al dashboard).
- Copilot.
- Búsqueda. Abre la paleta con el evento `dakinis:open-command-palette`.
- Idioma.
- Botón de precios (tres puntos).
- Sesión de negocio, fuera de `/vista/` y `/demo/`: Panel (`/app/dashboard`), Clientes, WhatsApp.
- Sesión que no es de negocio: «Módulos», que abre `/hub` de este repo. No es `hub.dakinissystems.com`.
- **Mi negocio**: en hostelería abre `/sistema/{tipo}?task=sala`. En otro vertical abre `/sistema/{tipo}`.
- Maqueta (`/vista/{tipo}`) si el vertical existe en el registro y no es demo.
- Ajustes.
- Nombre del negocio.
- Salir.

Un invitado solo ve idioma, Entrar y precios.

En una vista `/sistema/`, `/vista/` o `/demo/` la barra se marca como vista demo y esconde precios y Ajustes.

Debajo de la barra, si el acceso de facturación está limitado, aparece `BillingAccessBanner`.

En páginas públicas que no son la app, puede flotar un botón de WhatsApp arrastrable.

## Rutas

### Público

| Ruta | Qué es |
| --- | --- |
| `/` | Inicio de producto. Si ya hay sesión de negocio, redirige al dashboard. Si hay sesión de plataforma, redirige a `/hub`. |
| `/precios` | Precios y contacto (`#contact`). |
| `/login` | Email, contraseña, TOTP si hace falta, slug del tenant, enlace a olvidé la contraseña, atajo al demo de restaurante, términos y privacidad. |
| `/forgot-password`, `/reset-password` | Recuperación. |
| `/faq`, `/privacy`, `/terms`, `/legal`, `/security`, `/cookies`, `/refunds`, `/sla` | Información estática. |
| `/success` | Vuelta de checkout. |
| `/portal/:slug` | Portal del cliente del negocio. |
| `/alergenos/:token` | Carta pública de alérgenos. |
| `/demo/:vertical` | Demo comercial del vertical. |
| `/vista/:vertical` | Maqueta visual. El texto dice que no son datos reales. |
| `/ecosystem/launch/:productId` | Lanzamiento a otro producto. |
| `/__des`, `/__des/motion`, `/__des/patterns`, `/__des/theme` | Sistema de diseño. Solo en desarrollo. |

El inicio de producto apila: héroe con demo y login, calculadora, confianza, vitrina, vídeo, demos por sector, qué incluye, prueba social y llamada a precios.

### App del negocio

Todas pasan por `AppGuard`. Sin token, cada página pide entrar.

| Ruta | Título que ve el negocio | Qué hace de verdad |
| --- | --- | --- |
| `/app/dashboard` | Panel del día | Con token real llama, cada una por su cuenta, a salud, crecimiento, finanzas a 30 días, KPIs del sector, sugerencias de IA y recomendaciones. El benchmark sectorial no se pinta: la media no tiene fuente, periodo ni muestra. El panel se lee en tres grupos: rendimiento, operación y atención. La salud se parte en configuración, salud operativa, actividad comercial y adopción, sin un 6/100 que mezcle todo. El crecimiento no se pinta si no hay factores medidos. Ingresos y ventas de hoy, sin un total real, dicen «Datos no disponibles». Un KPI de hostelería con clave conocida abre Sala, Cocina, Inventario o Caja. Si un módulo falla, los demás se quedan, el fallo se nombra y hay reintento. |
| `/app/crm` | Cartera de clientes | Lista, búsqueda, ficha y línea de tiempo con nota. El formulario de alta (nombre, apellido, teléfono, email) se abre al pulsar Nuevo cliente. El recorrido Cliente → Reserva → Pedido → Factura → WhatsApp → Seguimiento es el orden de trabajo: un paso solo abre el módulo que ya existe. |
| `/app/ventas` | Embudo comercial | La demo sigue con el tablero de etapas y la etiqueta DEMO. Una sesión real muestra el vacío y un enlace a Clientes. En hostelería, también a Caja. No lista pedidos ni facturas. |
| `/app/inventario` | Productos y stock | En hostelería con sesión real redirige a `/sistema/{tipo}?task=inventario&sub=scan`. En otro negocio real solo muestra el aviso de activar el inventario del vertical. La tabla de stock de la demo no se pinta en una sesión real. |
| `/app/reportes` | Analítica | La demo pinta la serie de `businessDemoContent` y la etiqueta DEMO. Una sesión real, si el benchmark trae comparaciones, muestra solo esas filas. Si no, el vacío. La serie de demostración no se pinta en una sesión real. |
| `/app/whatsapp/conversations` | Conversaciones | Pestaña por defecto. |
| `/app/whatsapp/contacts` | Contactos | |
| `/app/whatsapp/templates` | Plantillas | Oculta en demo. |
| `/app/whatsapp/automations` | Automatizaciones | Oculta en demo. |
| `/app/whatsapp/ai` | IA | Oculta en demo. |
| `/app/messages` y `/app/whatsapp` | — | Redirigen a conversaciones. |
| `/app/settings` | Ajustes | Cuenta, onboarding, ficha del negocio, facturación y uso de IA, adopción, portal, marketplace, sucursales. En hostelería, bloque extra con enlace a la operación y a la URL pública de alérgenos. |
| `/hub` | Lanzador de módulos de Core | Título «Tu espacio de trabajo». Distinto del Hub de productos. La paleta «Ir al Hub» abre `DAKINIS_URL_HUB`. |

En el dashboard y en varias páginas de app hay un héroe de mosaicos (Clientes, Inventario, Ventas, Analytics, WhatsApp) que repite la barra. En el dashboard el héroe incluye «Pregúntale a Dakinis». En el resto va compacto, sin la pregunta.

### Admin de plataforma

`/admin` exige rol de plataforma. Si no, manda a `/`.

Bloques, de arriba abajo: maquetas por vertical, alta de negocio, listado de negocios, alertas de operación, telemetría del piloto y usuarios.

## Hostelería: la operación real

Ruta: `/sistema/{vertical}?task={tarea}&sub={sub}`.

La tarea se guarda en `localStorage` (`dakinis-restaurant-task`). Alt+1…6 cambia de módulo si el foco no está en un campo.

Cabecera de operación: punto de abierto/cerrado, nombre del negocio, miga, estadísticas (comandas, alertas, caja), estado de API / delivery / caja, y atajos si hay cola (ir a cocina, resolver stock, ver delivery).

### Dock

| Atajo | Tarea | Pantalla |
| --- | --- | --- |
| Alt+1 | Sala | Comandas con rol camarero. La subnavegación solo deja **Mesas**. El pedido y el cobro viven en el modal de la mesa, no como pestañas. |
| Alt+2 | Cocina | Comandas con rol cocina. Solo **Activas**. |
| Alt+3 | Inventario | Escanear, Stock, Lotes, Producción, Recetas, Alertas. El campo de lectura va primero. La cámara aparece al pulsar iniciar. |
| Alt+4 | Delivery | Operación y configuración. Canales en tarjetas: Conectado, Desconectado, No configurado, Configuración pendiente, con el texto del estado. «Simular pedido» está en un bloque aparte y no es un pedido de canal. |
| Alt+5 | Caja | Rol admin de comandas: **Cierre día** y **Facturas**. El resumen (fondo, cobros, efectivo esperado) solo se pinta si la carga llegó. Un 429 dice que no se han podido cargar los datos y ofrece reintentar. No pinta un total de 0,00 € en ese fallo. |
| Alt+6 | Config | Plano, Carta, Compras, Fiscal, Seguridad (alérgenos), Integraciones. |

Integraciones no configura canales: explica que viven en Delivery y ofrece el botón para abrirlos.

Fiscal titula «Facturación fiscal (VERI*FACTU)». El propio texto dice que es base técnica y que no sustituye la declaración responsable del software. La UX no debe presentarlo como un sistema certificado.

Alias de URL que ya entiende el parser: `floor` y `mesas` → sala; `kitchen` → cocina; `stock` → inventario con sub escáner; `lots` → lotes; `allergens` y `menu` → config; `cash` y `cierre` → caja.

El catálogo de capacidades de Core (`shared/catalog/product-capabilities.js`, en `e0d1f5c`) apunta a `/sistema/restaurante?task=`. El parser sigue aceptando alias (`floor`, `kitchen`, `stock`, `cash`). La palabra inglesa `restaurant` no está en esa lista de alias.

Paleta (Ctrl+K), solo si el negocio es de hostelería: Sala, Cocina, Inventario, Lotes, Delivery, Caja, Carta, Alérgenos. También resuelve consultas del tipo «mesa N» o un canal de delivery.

## Ajustes, en el orden en que se leen

1. Cuenta.
2. Onboarding, con acción de marcarlo completo.
3. Ficha del negocio. Guardar muestra «Configuración guardada» o el error.
4. Facturación y uso de IA.
5. Adopción y valor de negocio.
6. Portal del cliente.
7. Marketplace.
8. Sucursales.
9. Bloque de restaurante, si aplica.
10. Volver al dashboard y salir. Salir también está en la barra.

## Dónde duele

Esto sale del código de `e0d1f5c`, no de un recorrido en el navegador.

1. **Ventas y analítica de una sesión real están vacías a propósito.** Ya no rellenan con la demo. Tampoco listan los cobros de Caja. El dinero del día sigue en Caja.

2. **Inventario fuera de hostelería no tiene tabla.** En hostelería la barra ya no lo ofrece: está en el dock.

3. **La barra de negocio sigue larga.** Copilot, búsqueda, idioma, precios, Panel, Clientes, WhatsApp, Mi negocio, Ajustes, el nombre y Salir. El dock no se marca en esa fila.

4. **Un módulo del panel puede fallar solo.** Finanzas puede no llegar y Operación sigue. El error nombra el módulo y ofrece reintentar. Un fallo de red no enseña Railway ni `API_UPSTREAM`. La producción no se confirma si el stock no alcanza. Una recomendación dice de qué señal sale y que no calcula un importe.

5. **Sala concentra el pedido en la mesa.** El camarero ve Mesas y no puede arrastrarlas. Diseño solo aparece donde el plano ya era editable, y empieza en operación. El plano dice Libre o Cuenta, con texto claro. No muestra camarero, tiempo ni capacidad: esos campos no están en la sesión de la mesa.

6. **Config y Ajustes siguen siendo dos sitios.** Plano, carta, compras y fiscal viven en el dock. Cuenta, plan, portal y sucursales viven en `/app/settings`. Fiscal de ticket no es un sistema certificado.

7. **Carga.** La app perezosa dice «Cargando…». No hay esqueleto común.

8. **`/hub` de Core sigue existiendo** para quien no es un negocio, con el rótulo «Módulos». La paleta «Ir al Hub» sale al Hub del ecosistema. CRM sigue ofreciendo el Hub interno en un enlace.

9. **El cierre de caja, en `9920c03`, compara efectivo contado y esperado.** Un fondo vacío no se guarda como 0 €. El botón se llama «Confirmar cierre» y queda bloqueado si falta el fondo. Si la diferencia no es cero, pide un motivo. El cierre se audita. No se ha pulsado en una sesión real. El coste de una producción sigue sin calcularse. Comensales en la ficha de mesa sigue en «Sin registro».

10. **El panel titula con el nombre comercial.** Las alertas de stock no se repiten. Entrada/Salida aparece al elegir producto. El modal de mesa tiene un solo scroll. WhatsApp se titula «Enviar mensaje». Un canal sin cobros no aparece a 0 €.

## Orden que queda

Sin añadir secciones nuevas.

**Hecho en `e0d1f5c`, pendiente de ver en el sitio.** Sesión real sin cifras de demo. Barra de negocio sin Ventas, Inventario, Analytics ni un botón llamado Hub. `?task=` en el catálogo de Core. Panel agrupado y con destino en los KPI de hostelería. 429 legible. Alta de cliente al pulsar. Escáner, delivery y plano como arriba.

**Después.** Que Ventas y analítica, fuera de hostelería, enseñen cobros reales o sigan en el vacío sin prometer una serie. Skeletons. Recomendaciones que se puedan aceptar solo cuando haya un destino y un registro de esa decisión. El coste de producción, cuando los ingredientes tengan un coste guardado.

La revisión del 13 nov 2026 añade al contrato, en `DAKINIS-UX-ARCHITECTURE.md`, que una recomendación no puede afirmar lo que los datos no demuestran, que las incidencias de carga no son alertas de mercadería, que el movimiento de inventario es un solo flujo y que Próximamente no se configura. Ese código está en `origin/main` de Core como `9920c03`. No está verificado en el navegador ni se da por desplegado en Railway.

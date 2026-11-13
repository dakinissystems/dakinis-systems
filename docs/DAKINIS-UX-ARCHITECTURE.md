# Dakinis · arquitectura de experiencia

Contrato entre el Hub del ecosistema y los productos. El inventario de pantallas de Core está en [core-ux.md](core-ux.md).

Hub y Core no compiten por ser el dashboard. El Hub dice qué ocurre en el ecosistema. Core opera un negocio. LifeFlow, StreamAutomator, AkoeNet y Tabletop siguen siendo productos propios, unidos por identidad, sesión y notificaciones.

## Responsabilidad

| | Dakinis Hub | Dakinis One (Core) |
| --- | --- | --- |
| Para qué | Control del ecosistema | Gestión y operación del negocio |
| Entrada | Mi día | Panel, y en hostelería el dock |
| Navegación | Sidebar: Trabajo, Inteligencia, Ecosistema, Administración | Barra corta y, si hay vertical, navegación de esa operación |
| Inteligencia | Capa transversal: IA, negocio, finanzas personales, progreso | IA del negocio, dentro del panel |
| Avisos | Todos los productos | Los del negocio |
| Workspace | Herramientas y aplicaciones | No se duplica |
| Administración | Plataforma y ecosistema | Cuenta y configuración del tenant |
| Búsqueda | Ctrl+K global | La misma paleta, con destinos de Core y del vertical |

LifeFlow lleva las finanzas. StreamAutomator, publicaciones y directos. AkoeNet, comunidad. Tabletop, juego. Ninguno reemplaza al Hub ni a Core.

## Regla de datos

Una sesión real no se rellena con cifras de demostración.

| Situación | Qué se muestra |
| --- | --- |
| Hay datos del negocio | Esos datos, con el producto de origen |
| No hay registros | Estado vacío y, si existe, una acción real |
| El módulo no está contratado | Cómo activarlo |
| La integración está cortada | La incidencia y reintentar, si el reintento existe |
| Es una demo | Etiqueta DEMO |
| La API falla | Error con una salida, no un cero ni una serie inventada |

Un campo ausente no se pinta como 0. «Sin alertas» no significa que el servicio esté comprobado.

## Hub

Se conserva el sidebar (Trabajo, Inteligencia, Ecosistema, Administración), Mi día como entrada, Ctrl+K, Workspace por categorías, tarjetas de producto, Disponible / Beta / Próximamente y las chinchetas.

Mi día, en `4ef4a6e`, se lee en este orden y solo con datos que existan:

1. ¿Hay algo cortado? El canal de eventos y las incidencias reales. Un canal cortado no se tapa con una bandeja vacía.
2. ¿Qué necesita una acción? La tarjeta de atención, con un destino.
3. Agenda, y después la actividad de productos (pedidos, publicaciones).
4. Recomendaciones, después de lo anterior.
5. Centro de actividad: línea temporal a lo ancho, con filtro por producto si hay más de un origen. La bandeja vacía dice «Sin avisos pendientes».

Las acciones rápidas van en el encabezado, como chips. Cada tarjeta de operación separa título, producto, periodo, cifra y acción.

Operaciones es la vista transversal. Cada tarjeta lleva el producto (Dakinis One, LifeFlow, StreamAutomator, AkoeNet) y el periodo (hoy, esta semana, este mes). No es un segundo panel de Core.

Inteligencia se queda en una sección y se lee en cuatro grupos, sin pantallas nuevas: Dakinis AI, negocio, LifeFlow y progreso de AkoeNet.

Workspace no lista aplicaciones sueltas. Siguiente paso funcional, no hecho aún: vista lista, orden, última utilización, ocultar categorías y ficha antes de abrir. Lo que se muestra tiene que respetar permiso, licencia y fase real. Próximamente no se abre.

No se inventa un «4 de 5 productos operativos» ni una última comprobación. Eso solo entra cuando haya una sonda de verdad.

## Core

La barra de un negocio es Panel, Clientes, WhatsApp, Mi negocio y Ajustes. Ventas, Inventario y Analytics salen de esa fila: en hostelería viven en el dock; fuera de hostelería no tienen todavía una serie real.

`/hub` dentro de Core es el lanzador de módulos del negocio, no el Hub del ecosistema. En la barra de un negocio ya no se llama Hub. La paleta «Ir al Hub» abre el Hub del ecosistema (`DAKINIS_URL_HUB`).

Hostelería usa una sola tarea en la URL: `?task=sala|cocina|inventario|delivery|caja|config`. El dock, la miga y la paleta leen esa query. Los enlaces `#kitchen` y `#delivery` del catálogo quedan sustituidos por `?task=`. Si la URL no trae tarea, se escribe la que ya está activa.

El panel, cuando el KPI es de hostelería y trae clave conocida, abre Sala, Cocina, Inventario o Caja. No abre una pantalla de demostración.

Fiscal de ticket sigue siendo base técnica VERI*FACTU. No se presenta como un sistema certificado.

El panel agrupa rendimiento, operación y atención. Un módulo que falla no esconde a los demás: el error nombra el módulo, conserva lo ya cargado y ofrece reintentar. La salud no se resume en un solo 6/100. Se lee en configuración, salud operativa, actividad comercial y adopción. Un negocio sin configurar no se presenta como incidencia. El benchmark sectorial no se muestra: no hay fuente, periodo ni tamaño de muestra. El crecimiento no se pinta hasta que existan factores medidos. Ingresos de 30 días y ventas de hoy, si no hay un total real, dicen «Datos no disponibles». La fórmula que ponía un mínimo de 420 € y la que multiplicaba comandas por 85 ya no está en el código. La hora del panel es la de la última consulta de ese lote, no una actualización simultánea de todos los módulos.

## En origin el 13 nov 2026

| Repo | Commit en `origin/main` | Qué entra |
| --- | --- | --- |
| `dakinis-hub` | `d521b9a` | Mi día ordenado. Si el actor interno falla, la sesión no se cierra. Un 503 del canal deja de reintentarse solo. |
| `dakinis-core` | `049b6dc` | Cifras reales, 429 legible, movimiento único de inventario, recomendaciones acotadas a los datos, acciones de delivery según el estado, arqueo de caja, ficha de mesa con los campos que la sesión trae, y el propietario deja de quedar como miembro cuando el IdP dice `user`. |

Esos commits están en GitHub. Este archivo no afirma que Railway ya los sirva. Una sesión real del navegador no se ha recorrido después de `049b6dc`. El 403 del plano se vio en el sitio cuando la pantalla aún decía «Diseño activo».

## Patrones de interacción

Una acción, un contexto, un resultado. Desde el Hub se abre el destino de Core que corresponde (Caja, Inventario, Sala) y la pantalla de origen no se rellena con una cifra inventada.

El alta de cliente tiene una sola acción, Nuevo cliente. CRM no repite la barra principal. Inventario, ventas, analítica y WhatsApp no vuelven como mosaico dentro de Clientes. La entrada y la salida de stock son un solo movimiento, con identificación manual, lector o cámara, y un botón de confirmación que dice entrada o salida según lo elegido. Detectar un código no registra el movimiento. Una integración Próximamente no ofrece configurarla: la acción es «No disponible aún». Pendiente de acceso muestra requisitos. Conectado gestiona. Error diagnostica solo si hay un fallo real de esa conexión. No configurado se configura. La simulación sigue en un bloque aparte. En el plano hay dos modos visibles, Operación y Diseño. Diseño solo aparece si el rol ya podía editar. Un camarero no arrastra mesas. Un error de límite (429) se lee como «no hemos podido cargar estos datos» y ofrece reintentar. No se muestra un total de caja si esa carga no llegó. El arqueo de efectivo contado sigue pendiente: no hay un campo de efectivo contado.

## Estados de datos

| Estado | Qué comunica |
| --- | --- |
| Con datos | La cifra y, si existe, de dónde sale |
| Sin registros | Vacío y la acción real, si la hay |
| Datos no disponibles | El campo no se ha medido. No es un cero |
| Desconectado | Solo si esa integración llegó a estar conectada y ahora falla. Un stub o un acceso de partner pendiente no es una desconexión |
| Error | La operación no se ha confirmado |
| Procesando | La acción sigue en curso |
| DEMO | Sesión de demostración, etiquetada |

«Sin avisos pendientes» es la bandeja. No significa que el ecosistema esté comprobado. «Sin alertas» en un producto cuenta avisos de ese día, no una sonda de salud.

## Responsive

Escritorio: sidebar y varias columnas. Tablet y móvil de hostelería: el control frecuente (mesa, lector, reintentar) tiene al menos 44 px de alto. El plano de mesas dice Libre o Cuenta con texto, no solo con color.

## Accesibilidad

El estado no depende solo del color. Los filtros de actividad y de Workspace se marcan con `aria-selected`. El canal de Mi día se abre con un botón y se cierra con Escape.

## Por rol

En hostelería, camarero, cocina y caja no ven el mismo dock. El propietario ve el panel del negocio. No se añade una segunda navegación para el mismo rol. Un paso del recorrido Cliente → Reserva → Pedido → Factura → WhatsApp → Seguimiento solo abre el módulo que ya existe.

## Reglas de esta pasada

P0. La interfaz no muestra URLs internas, variables de entorno ni instrucciones de despliegue. Un módulo que falla no esconde a los que respondieron. Producción e inventario comprueban el stock antes de confirmar; si falta, no hay un atajo. Una operación de stock o de dinero que se registra deja el movimiento que el sistema ya guarda.

P1. Cada tarea tiene una acción principal. Una integración sin API no se presenta como desconectada ni se puede marcar activa. El formulario de un movimiento enseña el stock resultante antes de confirmar. El estado vacío dice el siguiente paso que existe. Un cero medido no se escribe igual que un dato que no llegó. Carga, error y confirmación usan el mismo lenguaje.

P2. Una recepción parcial que actualice el stock, un cierre de caja con efectivo contado y una ficha de mesa con capacidad, tiempo e importe quedan pendientes: esas pantallas no tienen todavía el dato o el registro. Una recomendación de IA dice de qué señal sale y que no calcula un importe.

## Reglas de la revisión del 13 nov 2026

Ningún componente comunica un estado más favorable o más avanzado que el estado real del sistema. Guardar unas credenciales no es «Conectado». Detectar una alerta de falta no es una recomendación calculada.

| Área | Regla |
| --- | --- |
| Dashboard | Cada métrica lleva contexto. La hora es la de la última consulta del panel, no de todos los módulos a la vez. Atención usa borde ámbar o rojo solo en una incidencia operativa. Configuración, actividad y adopción se quedan neutras. |
| Inteligencia | Una recomendación solo propone una acción que los datos pueden justificar. Una alerta de stock mínimo es escasez. «¿Qué platos debería promocionar?» solo se activa si llega una lista `promoDishes`. Contar recetas o un stock por encima del mínimo no fabrica esa lista. |
| CRM | Una sola acción principal por tarea. Sin navegación duplicada de la barra. Sin importar Excel mientras esa función no exista. |
| Inventario | Un único flujo de movimiento, manual o con escáner. El botón de confirmación cambia con la dirección. El stock resultante se enseña antes de confirmar. |
| Producción | No se registra si el inventario no cubre los ingredientes. No hay un atajo de excepción. |
| Delivery | La acción depende de la disponibilidad: ver requisitos, configurar, gestionar, diagnosticar, no disponible aún, o crear pedido de prueba en la simulación. Un volumen vacío explica si no hay pedidos, si no se pudo consultar o si no hay canales conectados. |
| Alertas | Las incidencias de carga no van en la lista de mercadería. No se descartan como si fueran un aviso de stock: primero se reintenta. Mientras no haya motor de reglas, el formulario se llama aviso manual. |
| Compras | Una entrega prevista no entra mercancía. Recibido y recepción parcial crean un lote con la cantidad indicada y no modifican el stock de cocina. La agenda lista las entregas ya guardadas. |
| Caja | El cierre pide el efectivo contado. Si la diferencia no es cero, exige un motivo. La instantánea guarda importe, diferencia, quién y cuándo en la auditoría. Sin fondo de inicio no se cierra, porque el esperado no está calculado. |
| Carta | Un precio vacío no se guarda como 0 €. Un 0 real se etiqueta como precio cero. Un campo sin valor es «Sin precio». |
| Plano | Operación y Diseño son dos controles con el modo actual marcado. Al seleccionar una mesa se ve la capacidad (`seats`), el tiempo si hay `openedAt`, el estado de la cuenta y el importe del carrito. Comensales dice «Sin registro»: la sesión no guarda ese dato. |
| Fiscal | La activación queda al final y no se habilita sin nombre y NIF/CIF. El aviso de base técnica VERI*FACTU sigue visible. No es una certificación. El IVA por defecto es del emisor, no de cada producto. |

Estas reglas describen el contrato. El código de Core que las aplica está en `origin/main` como `049b6dc`. Este archivo no afirma que Railway ya lo sirva, ni que un recorrido de aceptación lo haya verificado.

## Qué queda para después

- Vista lista y ficha de Workspace.
- Skeletons compartidos en lugar de «Cargando…».
- Densidad compacta / normal / cómoda en el DES, sin un segundo AppShell.
- Inteligencia que cruce productos solo con datos autorizados.
- Widgets del Hub que el usuario pueda reordenar.

Esos puntos no se improvisan con cifras de relleno.

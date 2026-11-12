# Infra del desarrollador — Supabase, Railway, Cloudflare y el resto

Trabajo de consolas y de configuración. No abre un servicio nuevo de seguridad. Auth sigue siendo la identidad, Internal API la política entre servicios, PostgreSQL el aislamiento, Railway y Cloudflare la infraestructura, y el CI la cadena de suministro.

Fecha: 11 nov 2026, segunda pasada de la misma noche. Responsable de las ocho condiciones: el operador. Suplente para las condiciones 4, 6 y 8: sin nombrar. Antes del segundo negocio hay que nombrar a alguien que ejecute el runbook sin decidir producto. Un control tiene cuatro estados. Marcarlo en este archivo no lo pasa de uno a otro. El artefacto vive en [docs/evidence/](../evidence/README.md), con fecha en el nombre. Mientras ese archivo no exista, el estado no es verificado.

| Estado | Significa |
|---|---|
| Código | Está en el repositorio |
| Desplegado | Esa versión corre en el entorno que dice la fila |
| Verificado | Se probó en ese entorno y quedó la evidencia |
| Revalidación | Se vuelve a comprobar tras un cambio gordo o en el plazo anotado |

Relacionado: [SECURITY.md](../SECURITY.md) · [OPERATIONS.md](../OPERATIONS.md) · [circuito comercial](./circuito-comercial.md) · [STATUS](../STATUS.md).

## Orden

El circuito comercial (Copérnico, Billing, Hub) sigue siendo el frente de producto. Este runbook lo acompaña. El staging tiene que poder reproducir venta en Core, inventario, evento, Internal API y Hub.

| Orden | Bloque | Prioridad |
|---|---|---|
| 0 | CSV de Vault: buscar copias, Gitleaks en el historial, rotar y solo después limpiar Git | P0, manual, hoy |
| 1 | Cloudflare: MFA de la cuenta. Access cuando exista el hostname de staging | P0 |
| 2 | Railway: staging del circuito, `request_id`, `/health/live` y `/health/ready`, origen canónico | P0 |
| 3 | Secretos: inventario sin valores y una rotación ensayada | P0 |
| 4 | Supabase: RLS en staging, con el rol real de la aplicación | P0 |
| 5 | Auth: revocación de sesión. Billing: `UNIQUE` en la base viva y las tres pruebas de webhook | P0 |
| 6 | Redis: no público, colas y workers con cupo, persistencia decidida. HMAC solo si hay una frontera que lo justifique | P1 |
| 7 | Restauración contra los RPO y RTO de abajo, con la ficha de evidencia | P1 |
| 8 | CI: Gitleaks, lockfile, `npm ci`, y confirmar que los forks no reciben secretos | P1 |
| 9 | OpenTelemetry, cuando `request_id` ya cruce Core, Billing y Hub | Después del circuito |

## Acción inmediata — CSV de Vault

Dueño: el operador. No depende de un despliegue. No se ha hecho. No se abre el archivo desde el repositorio ni desde el agente.

1. Busca el nombre en el disco del proyecto, en carpetas sincronizadas, en la papelera y en copias de seguridad.
2. En cada repo donde pudo estar la carpeta: `git log --all --full-history -- <ruta>` y Gitleaks sobre todo el historial y todas las ramas.
3. Rota todas las credenciales que contenga, haya salido o no en Git.
4. Si el historial lo contiene, la limpieza del remoto va después de rotar, y es un rewrite coordinado. No se hace con un commit que solo borre el archivo.
5. Cuando las contraseñas estén en un gestor y rotadas, borra las copias en claro, incluida la papelera y lo sincronizado.

## Controles que están en el árbol

Ninguna fila de «verificado» está cerrada. El orden de despliegue de `iss` y `aud` está más abajo: desplegar la validación estricta antes de que los tokens en circulación la traigan corta el login.

| Control | Código | Desplegado | Verificado | Evidencia que falta |
|---|---|---|---|---|
| Auth no arranca sin `JWT_SECRET` | Sí, `platform/auth` | No | No | Arranque en producción sin la variable: el proceso termina |
| `JWT_LEGACY_LONG_TTL=true` tumba el arranque en producción | Sí, `assertProductionJwtPolicy` | No | No | Variable en true y `NODE_ENV=production`: no escucha |
| Gateway exige `iss` y `aud` en producción | Sí. `JWT_STRICT_ISS_AUD=false` lo relaja | No | No | Token sin `aud` → 401. Tokens viejos de 7 días: ver el orden de despliegue |
| Estado OAuth fail-closed | Sí. En producción, sin `JWT_SECRET`, lanza. No cae a `dev-oauth-state` | No | No | `NODE_ENV=production` y secreto vacío: el inicio OAuth no firma el state |
| Core exige secreto fuerte | Sí, `server.js` | Hay que ver qué commit corre | No | El placeholder no arranca |
| Core verifica algoritmo, emisor y audiencia | Sí, en producción | Hay que ver el commit | No | Token de otro emisor → 401 |
| Stripe firma con cuerpo crudo | Sí, `constructWebhookEvent` | Hay que ver el commit de Billing | No | Firma inválida → rechazo, sin escribir el evento |
| `ON CONFLICT (stripe_event_id)` | Sí, en el repo. El `UNIQUE` está en la migración `004` | ? | No | `\d billing.stripe_webhook_events` en la base viva. Si hay duplicados previos, decidirlos antes de fiarse |
| Límites de login, registro y recuperación | Sí. Nginx 10/min, 5/min y 5/min. Auth: 5/min y 20/h por cuenta, 429 de registro, 3/h de recuperación | No | No | Salida de `scripts/verify-auth-rate-limit.ps1` en `docs/evidence/` |
| Nginx no junta origen `*` y credenciales en `/auth/` | Sí, en `default.conf` | No | No | Cabeceras de la respuesta del gateway |
| CORS de Auth en producción | Lista blanca si `NODE_ENV=production` o si hay `CORS_ORIGINS`. `origin: true` solo fuera de producción y sin esa variable | ? | No | `Origin: https://evil.example` contra Auth en producción no se refleja. Confirmar que Railway pone `NODE_ENV=production` |
| LifeFlow: secreto propio y HS256 | `FINANZAS_JWT_SECRET`. En producción el arranque falla si falta, es corto o es el de desarrollo. `jwt.verify` fija `HS256`. No hay `aud` | No | No | No comparte el nombre del secreto con Auth. La audiencia queda pendiente, con periodo de convivencia |

## Orden de despliegue de `iss` y `aud`

1. Confirma que producción no tiene `JWT_LEGACY_LONG_TTL=true`. Si lo tiene, quítalo y espera a que caduquen los tokens de 7 días, o fuerza un nuevo login.
2. Confirma que los tokens que Auth y Core emiten ya llevan `iss` y `aud`. Ese código ya está en el árbol.
3. Despliega la validación estricta de Auth y, después, la de Core.
4. `JWT_STRICT_ISS_AUD=false` solo durante esa convivencia. No lo dejes como ajuste permanente.

Desplegar la validación estricta mientras circulan tokens sin `aud` deja a esos usuarios fuera hasta que vuelvan a entrar.

## Cloudflare

La MFA del panel protege la cuenta. No protege staging. Access protege el hostname de staging y los paneles internos. No lo pongas delante de la API pública ni de un callback OAuth o de un webhook.

1. MFA FIDO2 o WebAuthn en el perfil. La casilla de [SECURITY.md](../SECURITY.md) sigue abierta. Anota la fecha cuando lo actives.
2. Miembros: solo el operador.
3. API Tokens por zona y permiso. Sin Global API Key en scripts ni en Railway.
4. TLS Full (strict) en la configuración efectiva, no en un recuerdo de julio.
5. WAF gestionado en bloqueo. Revalidación mensual, o un chequeo contra la API. Una mirada única vuelve a «solo registro» sin que se note.
6. El rate limit de julio (20 req / 10 s en `/auth/` y `/api/`) se comprueba otra vez. El de login del gateway es adicional y aún no está desplegado.
7. Lista de hostnames públicos: landing, gateway, auth, hub y los productos que abre un cliente. Knowledge, Internal y los paneles de operaciones no necesitan dominio público si la red privada de Railway llega.
8. Access en el hostname de staging, cuando exista: permitir al operador, denegar al resto, sesión corta, MFA. Inventario de paneles, no una categoría: Cloudflare (MFA de cuenta), Railway (MFA), Supabase (MFA), Stripe (MFA), staging (Access).

Cómo se comprueba: captura del perfil con MFA, una petición anónima al hostname de staging que reciba el muro, y la regla WAF en modo bloqueo el día de la revisión.

## Railway y staging

No se migra de plataforma.

El staging mínimo del escenario «venta → inventario → evento → Internal → Hub»:

| Pieza | En staging |
|---|---|
| Gateway, Auth, Core, Billing, Hub, Internal API | Sí |
| PostgreSQL | Base independiente |
| Redis | Instancia independiente |
| Worker que publique el evento de esa venta | Sí, si el escenario lo usa |
| Notifications | Solo si el escenario envía un aviso |
| Workspace, Studio, Fitness, juegos | No |

1. Secretos, base, Redis y webhooks de staging distintos de producción. Las variables selladas no se copian al duplicar el entorno: se definen de nuevo.
2. Dos tenants sintéticos, con nombres de recurso parecidos e identificadores en rangos cercanos. Un dataset aleatorio no prueba una política mal escrita.
3. `request_id` en el log JSON de Core, Billing, Internal y Hub en este paso. Sin eso no se depura staging. OpenTelemetry espera a que ese identificador cruce los tres primeros.
4. `/health/live` dice si el proceso responde. No falla porque PostgreSQL esté caído. `/health/ready` dice si puede atender la operación y mira la dependencia esencial, con timeout. Railway no debe mandar tráfico al contenedor nuevo hasta que `ready` responda. Un proveedor externo caído no reinicia en bucle un servicio que puede seguir con el resto.
5. Un solo origen por servicio. La tabla de abajo sale de [OPERATIONS.md](../OPERATIONS.md). Donde dice «sin confirmar», el dashboard de Railway manda. Hasta entonces, un PR de Dependabot sobre la carpeta puede no ser el código que corre.

| Servicio | Fuente que OPERATIONS nombra | Staging del circuito |
|---|---|---|
| Gateway | Carpeta `gateway/` del repo `dakinis-systems` | Sí |
| Auth | Repo `dakinis-auth` | Sí |
| Core | Repo `dakinis-core` | Sí |
| Hub | Repo `dakinis-hub` | Sí |
| Billing | «platform repos». Carpeta `billing/` y repo `dakinis-billing` conviven. Sin confirmar en el dashboard | Sí |
| Internal | Igual: carpeta `internal/` y repo privado. Sin confirmar | Sí |
| Notifications, Search, Knowledge | Igual. Sin confirmar | No, salvo que el escenario E2E los use |
| AI | Repo `dakinis-ai`. En disco hay dos checkouts con commits distintos. Sin confirmar cuál despliega Railway | No |

6. Servicios que solo habla otro servicio: sin dominio público.
7. Anota en cada servicio el commit desplegado y la migración de base. Sin eso no hay rollback.

Cómo se comprueba: staging no abre la base de producción, el escenario de la venta se ve en Hub, y un tenant sintético no lee al otro.

## Supabase y PostgreSQL

No actives `FORCE ROW LEVEL SECURITY` en producción de una vez. La decisión es por tabla, después de las pruebas, según el rol que ejecuta.

Comprueba, en staging, para cada tabla con datos de un negocio:

- Qué rol ejecuta la consulta de la aplicación.
- Si ese rol es propietario de la tabla.
- Si tiene `BYPASSRLS`.
- Si la conexión es `service_role`.
- Si una función `SECURITY DEFINER` se sale del tenant.
- Si el tenant se fija dentro de la transacción y no llega como `x-tenant-id` del navegador.

La conexión ordinaria de la aplicación no usa un rol propietario ni un rol con `BYPASSRLS`. `service_role` no entra en Hub ni en ningún front.

Las pruebas de permitir y denegar cubren lectura, escritura, cambio de tenant en la petición, exportación, búsqueda y el worker. Si la aplicación de staging deja de leer sus propias filas, se corrige la política ahí.

No copies datos personales de producción. El dataset es el de los dos tenants sintéticos.

Migraciones aditivas cuando se pueda: agregar, desplegar el código que lee lo nuevo, migrar, y en un despliegue posterior quitar lo viejo.

## Auth, más allá del límite por IP

Los números por IP y por cuenta están en la segunda pasada y en el código. No están desplegados. Captcha no está: el registro responde 429.

En el código, sin evidencia de despliegue: límite por cuenta, políticas distintas, respuesta igual en la recuperación y retraso a partir del tercer fallo. La prueba de tiempos de enumeración no está hecha. El límite es por proceso: varias réplicas no comparten el contador.

En el código, sin desplegar: `GET /auth/sessions`, `POST /auth/sessions/revoke` y `POST /auth/sessions/revoke-others`. El cambio de contraseña ya marca `revoked_at`. El access token corto sigue válido hasta `exp`. La evidencia de la condición 3 es un refresh revocado que responde 401. MFA de usuario y la pantalla de Hub van después.

Sigue sin implementar:

- La prueba de que un refresh reutilizado revoca la familia, guardada en `docs/evidence/`.
- Reautenticación antes de exportar, borrar una organización o generar una clave API. Es condición de «antes del segundo negocio», con nombre propio, no una de las ocho.

El corte del WebSocket de AkoeNet al revocar una sesión depende de esta revocación. No se implementa contra un Auth que todavía no revoca.

## Billing

Firma y `ON CONFLICT` están en el repo. Falta ver el `UNIQUE` en la base viva.

Tres pruebas, en staging, con la clave de webhook de prueba:

1. El mismo `event.id` dos veces a la vez: un solo efecto.
2. Un evento viejo que llega después de uno nuevo sobre la misma suscripción: no restaura el estado anterior.
3. El evento queda registrado y falla un paso posterior: el reintento no cobra ni activa el plan otra vez, y la reconciliación lo ve.

La reconciliación periódica con Stripe es la segunda barrera. Core no declara pagada una suscripción.

## Secretos

Railway Variables es el almacén de ejecución. El inventario no guarda el valor: identificador, servicio, entorno, alta, última rotación, permiso y cómo se revoca.

| Secreto | Regla |
|---|---|
| `JWT_SECRET` | Distinto por entorno. Mínimo 32 caracteres en producción. `JWT_LEGACY_LONG_TTL` no es `true` |
| Stripe | Solo en el servicio Billing que Railway despliega |
| `service_role` | Solo servidores autorizados |
| Postgres y Redis | Por servicio y por entorno |
| Resend | Solo quien envía correo |
| OAuth | Solo el servicio que hace el intercambio |
| Cifrado de tokens de StreamAutomator | Versión de clave. Rotar implica re-cifrar o leer claves anteriores. Sin eso, la rotación deja los tokens ilegibles |

`QUEUE_HMAC_SECRET` no se crea hasta que el apartado de Redis diga que HMAC hace falta.

Si un valor llegó a Git, se rota aunque el commit siguiente lo borre.

## Redis y BullMQ

Redis no es el libro de cobros. La primera protección es de infraestructura, no una firma en cada job.

1. Redis no tiene puerto público. Credencial restringida. TLS si el proveedor lo ofrece en ese entorno.
2. Colas distintas y workers distintos: billing, notifications, internal, search, knowledge. Límite de concurrencia por tipo. Una ingesta no ocupa el cupo del webhook.
3. Dos colas en el mismo Redis comparten memoria, CPU, conexiones y latencia. Redis aparte para Billing solo si las métricas muestran contención.
4. Esquema del job, idempotencia y reintentos con tope. Cola de fallidos con un procedimiento de reproceso.
5. El correo valida destinatario y plantilla.
6. Persistencia, decisión explícita y aún abierta: sin AOF, un reinicio pierde jobs; con AOF, el disco puede guardar datos personales y hace falta cifrado en reposo. El cobro no depende de esa elección.
7. HMAC solo si un job cruza una frontera menos fiable que la red privada de Railway. Si se hace, lleva caducidad, clave con rotación y protección contra reenviar un mensaje válido. No es el siguiente cambio.

Métricas mínimas, sin un dashboard nuevo: trabajos pendientes, antigüedad del más viejo, fallos.

## Health

| Ruta | Qué afirma | Qué no afirma |
|---|---|---|
| `/health/live` | El proceso responde | Que Postgres o Redis estén bien |
| `/health/ready` | Puede hacer la operación que depende de esa pieza | Que un proveedor externo opcional esté arriba |

Las dos comprobaciones tienen timeout. Un healthcheck no puede generar más carga de la que intenta mirar.

## Datos, logs y RGPD

Cuatro niveles: público, interno, confidencial, crítico.

Los logs no llevan `Authorization`, cookies, `code`, `state`, contraseñas ni el cuerpo de un pago. La regla vale en el gateway y en cada servicio, no solo en el texto del correo.

Exportar y borrar la cuenta entra antes del segundo negocio, no en las ocho condiciones. Borrar la cuenta no borra la factura que hay que conservar.

El audit log no es el log de Railway. Dueños:

| Ámbito | Dueño | Qué registra |
|---|---|---|
| Login, contraseña, MFA, revocación | Auth | actor, tenant, acción, resultado, `request_id`, timestamp |
| Rol, exportación, inventario, organización | Core | lo mismo, más recurso y antes/después |
| Suscripción y cobro | Billing | lo mismo |

La IP, si se guarda, no se enseña a un administrador de otra empresa. El registro no lo puede reescribir el servicio que lo emite.

## Backups

Objetivos iniciales. La prueba falla si no los cumple. No son medidas hechas.

| Producto | RPO | RTO |
|---|---|---|
| Billing | 15 min | 4 h |
| Auth | 24 h | 8 h |
| Core | 24 h | 24 h |

Cada restauración guarda: fecha, base, origen del backup, entorno de destino, tiempo, integridad, versión de migraciones, pruebas funcionales, incidencias, y dónde están las claves y la configuración para levantar el servicio. Un backup sin esas claves no es una recuperación.

La de julio de 2026 no se da por vigente. Billing, además, reconcilia con Stripe después de restaurar.

PostgreSQL: backup del proveedor y esta ficha. SQLite de LifeFlow y Tabletop: una copia restaurada. Ficheros: bucket por entorno cuando haya volumen; no se abre R2 ni S3 en este ciclo.

## CI y cadena de suministro

StreamAutomator: rúbrica fija. Directa, en runtime y alcanzable desde fuera: P0. Transitiva y solo de desarrollo: P3. Sin esa rúbrica el backlog no baja.

En este árbol no hay workflows `pull_request_target`. Confirmar lo mismo en los repos privados. Un workflow `pull_request` no entrega secretos de producción al fork. `pull_request_target` sí puede.

Lockfile y `npm ci` en el circuito comercial. Imágenes pinneadas por digest cuando se consolide el pipeline, no en este paso. SBOM en ese mismo momento.

## Después del circuito, no ahora

OpenTelemetry. Métricas de conexiones, bloqueos y consultas lentas de PostgreSQL. Circuit breaker en Search, Knowledge y el proveedor de IA cuando esas llamadas existan. Prueba de carga de Core, Auth y Billing antes de escalar. Coste por servicio. Infraestructura como código cuando staging ya esté estable. El tope de 200 peticiones de AI por tenant y día está decidido y sin implementar. `security.txt` ya está en el árbol de la landing.

## Puerta antes del segundo negocio

Las ocho también están en [STATUS](../STATUS.md). Siguen abiertas. Dueño: el operador.

| # | Condición | Evidencia |
|---|---|---|
| 1 | Una empresa no lee datos de otra | Dos tenants sintéticos. Falla la lectura, la escritura, la exportación, la búsqueda y el worker |
| 2 | Un rol sin permiso no ejecuta la operación | Sigue pendiente. Hay comprobaciones en el código y no hay evidencia |
| 3 | Una sesión se puede revocar | Cerrar una sesión y el refresh deja de valer. P0 de Auth. El MFA de usuario no sustituye esta prueba |
| 4 | Un secreto comprometido se puede invalidar | Una rotación real en staging y el procedimiento de cada familia. `JWT_SECRET` solo no cubre Stripe, `service_role`, OAuth, Redis ni Railway |
| 5 | Un reintento no duplica un cobro | `UNIQUE` en la base viva y las tres pruebas de Billing |
| 6 | La base se recupera aislada | Ficha de restauración dentro del RPO y el RTO |
| 7 | Una acción administrativa queda registrada | Fila en el audit log del dueño, no una línea de Railway |
| 8 | Una incidencia P0 tiene procedimiento | Niveles P0–P3 y el plazo de 72 h si hay datos personales |

## Segunda pasada — decisiones que dejan de estar abiertas

Ninguna está verificada. El artefacto, cuando exista, va a `docs/evidence/` con la fecha.

### Paso 2.0, antes de duplicar staging

Para cada servicio en el dashboard de Railway anota commit, rama, tag de imagen y root directory en la tabla de origen. Sin esa captura el staging se copia de una suposición. Los dos checkouts de AI no se archivan hasta comparar los dos commits: ninguno contiene al otro, y borrar uno pierde historia. La comparación es parte de este paso, no un «después».

### Familias de secretos

Se ensaya una rotación real (la de `JWT_SECRET` en staging vale como ensayo). El procedimiento escrito, aunque no se rote cada una ahora, cubre: Stripe API y secreto de webhook (coordinar Billing y el dashboard, con ventana), `service_role` (redesplegar todos los servicios que la usan en el mismo cambio), OAuth, Redis, cifrado versionado de StreamAutomator, y tokens de Railway. Si un servicio se queda con el valor viejo, el ensayo no cuenta.

### LifeFlow — opción B

No se integra en Auth en este ciclo. Sigue con `FINANZAS_JWT_SECRET`, caducidad de 7 días y sin `aud`. Decisión: no entra información financiera nueva de clientes hasta tener sesión revocable y audiencia. Lo que ya está en producción no se apaga por este documento.

Cuando se levante ese límite, el plan es concreto: desde el día X los tokens salen con `aud=finanzas`; desde X+7 la verificación exige esa audiencia; un token sin `aud` en staging falla. Hasta X, no se declara el control hecho.

### RPO y RTO

Las cifras de Billing, Auth y Core siguen siendo objetivos no medidos, y hay que revisarlos con el impacto real antes de darlos por buenos. Un RPO de 24 h en Core puede perder un día de ventas. Un RTO de 8 h en Auth deja a varios productos sin login. LifeFlow entra en la matriz: objetivo provisional 24 h / 24 h, porque es SQLite y no está medido. Las claves de cifrado y de configuración no se guardan dentro del backup. La ficha añade «claves verificadas» (fecha y método: el secreto se leyó del gestor y Auth de staging arrancó) y «quién restaura si el operador no está».

### Health y monitorización

Railway usa el healthcheck para decidir si el despliegue nuevo recibe tráfico. No vuelve a preguntar ese endpoint después. Por eso:

| Uso | Ruta |
|---|---|
| Despliegue | `/health/ready` |
| Proceso | `/health/live` (en Auth, `/health` sigue siendo el proceso, para no romper el monitor actual) |
| Después del despliegue | UptimeRobot u otra sonda externa. No se construye un monitor propio |

`/health/ready` en el árbol, sin desplegar y sin probar:

| Servicio | Ruta | Mira | No tumba `ready` si falla |
|---|---|---|---|
| Auth | `/health/ready` | PostgreSQL, 800 ms | El correo |
| Core | `/api/health/ready` | `SELECT 1`, 800 ms | Redis. El bus no entra en esta comprobación |
| Billing | `/health/ready` | PostgreSQL y, si hay `REDIS_URL`, Redis. 800 ms | Stripe. `/health` sigue en 200 para el script que lee `database=connected` |
| Internal | `/health/ready` | PostgreSQL y, si hay `REDIS_URL`, Redis | |
| Hub | `/health/ready` | Auth en `AUTH_READY_URL` o `https://auth.dakinissystems.com/health/live`, 800 ms. En el árbol, sin desplegar | Internal y Core |
| Search | `/health/ready` | Redis si hay `REDIS_URL`, 800 ms. En el árbol, sin desplegar | |
| Notifications | `/health/ready` | PostgreSQL si hay `DATABASE_URL` y Redis si hay `REDIS_URL`, 800 ms. En el árbol, sin desplegar | Resend |

`/health/live` en Auth, Billing e Internal no toca la base. En Core es `/api/health/live`. `/health` de Billing e Internal conserva el cuerpo anterior para no romper los smoke.

### Límites de Auth

En el árbol, sin desplegar. El script `scripts/verify-auth-rate-limit.ps1` imprime códigos; la salida guardada en `docs/evidence/` es la evidencia.

| Ruta | Por IP, en Nginx | Por cuenta, en Auth |
|---|---|---|
| `POST /auth/login` | 10/min | 5/min y 20/h. A partir del tercer fallo, espera de 1 s, tope 5 s |
| `POST /auth/register` | 5/min | 429 a la cuarta petición de la misma IP en 10 min. Captcha no está |
| `POST /auth/password-reset/start` | 5/min | 3/h. La respuesta es `{sent:true}` exista o no el correo, y el camino rápido espera al menos 400 ms |

La prueba de enumeración todavía no está hecha: hay que medir el tiempo de un correo que existe y de uno que no, y guardar los dos números. El relleno de 400 ms no iguala un envío de correo lento.

### Condición 1, pruebas que faltan por nombrar

Exportación: desde el tenant A, la exportación de Core no incluye ninguna fila del tenant B. Artefacto `docs/evidence/isolation-export-YYYYMMDD.txt`. Si Core aún no exporta, la prueba no se puede marcar y el hueco queda escrito.

Workers que tocan datos de negocio, uno por uno: el de Internal no procesa un evento de otro tenant; el de Search no devuelve un documento ajeno; el de Knowledge respeta la clasificación; el de Notifications no escribe a un destinatario de otro tenant. Cada uno con su archivo de evidencia.

En el código, sin desplegar y sin evidencia: en Search, los ámbitos `clients`, `invoices`, `messages`, `events` y `chats` solo salen si el documento y la consulta traen el mismo `tenantId` o `businessId`. Un documento de esos ámbitos sin tenant no sale. Los mensajes de AkoeNet indexados sin tenant dejan de aparecer en este índice; la búsqueda SQL de AkoeNet no pasa por Search. Knowledge, documentation y global sin tenant siguen saliendo. Internal, en `POST /search`, usa el tenant del JWT y rechaza otro. Search ignora el tenant de la query si no llega `X-Dakinis-Actor`. Sin ese JWT los ámbitos privados no salen. El alta del índice sigue aceptando el tenant que ponga la clave de servicio. Search necesita el mismo `JWT_SECRET` que Auth. Internal reenvía el JWT en `POST /search`. Notifications manda un solo correo, ignora `html` salvo `NOTIFICATION_ALLOW_HTML=true` y no envía si el payload trae una clave con password, token o secret, también dentro de un objeto anidado. El envío, el inbox, marcar leído, las preferencias y el stream exigen `X-Dakinis-Actor`, y el `userId` tiene que ser el `sub`. Internal y Hub reenvían ese JWT. Hace falta el mismo `JWT_SECRET` que Auth. En local, sin secreto y fuera de Railway, el cuerpo sigue eligiendo el destinatario. En Railway, Search y Notifications exigen `DAKINIS_INTERNAL_SERVICE_KEY` en la ruta de datos. `/health` sigue abierto. Antes de desplegar esos dos servicios, la misma clave tiene que estar en Internal, Knowledge, AkoeNet y StreamAutomator. No va en el gateway ni en el frontend. Eso no cierra la condición 1.

Internal, en las rutas de una persona (dashboard, perfil, inbox, `workspaces/me`, aceptar invitación y contexto de organización), exige además `X-Dakinis-Actor`: el JWT del IdP, con `sub` igual al `userId`. Hub reenvía el Bearer que ya verificó. En Railway, Internal sin `JWT_SECRET` responde 503 en esas rutas. Hay que poner el mismo secreto que Auth y desplegar Hub a la vez: si Internal sale antes, el dashboard responde 401. `JWT_STRICT_ISS_AUD=false` relaja emisor y audiencia, igual que en Auth. El gateway vacía `X-Dakinis-Actor`, `X-Dakinis-Akoenet-Member` y `X-Dakinis-Worker` en `/internal/`. Hub y AkoeNet hablan con Internal por la red privada, no por ese borde. El JWT sin `exp` no vale. El portal de Billing exige que ese `sub` sea el `userId` del cuerpo. La suscripción que pide Hub tiene que coincidir con el tenant del JWT. Invitar, cambiar un rol, quitar un miembro, editar el workspace, ver el uso y cambiar productos miran en `meta.workspace_members` que el actor sea owner, admin, dueño del workspace o admin de plataforma. Ver el workspace, los miembros, los ventures, los productos y los addons exige ser miembro activo, viewer incluido. El listado de invitaciones es de administración y ya no incluye el token; el token sale solo al crearla. Las feature flags exigen el mismo JWT. Si la query trae `userId` o `tenantId`, tienen que coincidir con el token. Si trae `workspaceId`, el actor tiene que ser miembro. En local, sin `JWT_SECRET` y fuera de Railway, esa comprobación no corre. `/admin/v1`, el listado de la cola y la DLQ exigen `is_super_admin` o el rol `platform_admin` en `dakinis_auth.users`. Suspender, activar y cambiar una feature usan el `sub` verificado, no el `actorId` del cuerpo. Cambiar qué productos ve un tenant en el Hub es de plataforma; leerlos también vale si el slug es el del JWT. El aviso sale al `sub`, no a un `userId` distinto. La suscripción de otro tenant solo la lee un admin de plataforma. Activar addons del workspace exige owner o admin. Si `POST /events` trae `X-Dakinis-Actor`, el `userId` y el tenant quedan los del JWT. Sin esa cabecera hace falta `DAKINIS_WORKER_KEY`, distinta de la clave de servicio, en `X-Dakinis-Worker`. Copiar la clave de servicio no vale. Con esa clave el evento no puede traer `userId`, `tenantId` ni `platformUserId`. En local, sin la clave y fuera de Railway, sí puede. En Railway, sin esa clave, la ruta responde 503. En local, sin la clave y fuera de Railway, la clave de servicio sigue publicando. La misma clave va en Internal y en el proceso que publica, no en el gateway ni en el frontend. El SDK la envía cuando está definida. En AkoeNet, el alta de módulo, el comando, el evento del assistant y el reflejo de XP miran `akoenet.server_members` o `owner_id`: el UUID de plataforma tiene que ser miembro, owner o admin de plataforma. Si llega el JWT, el cuerpo no puede nombrar a otra persona. Sin JWT, hace falta `AKOENET_MEMBER_KEY`, distinta de la clave de servicio, en `X-Dakinis-Akoenet-Member`; el id local de AkoeNet no basta. La clave compartida ya no nombra a un miembro. Quien tiene la clave de AkoeNet sigue pudiendo nombrar a otro. En Railway, sin esa clave, esas cuatro rutas responden 503. En local, sin la clave y fuera de Railway, el respaldo anterior se mantiene. La misma clave va en Internal y en akoenet-backend, no en el gateway ni en el frontend. El catálogo y `GET` de módulos del servidor exigen `AKOENET_MEMBER_KEY`. Niveles y automod los leen desde el proceso de AkoeNet. La clave de servicio compartida ya no basta. Eso no cierra la condición 2. Hub ya no acepta un JWT cuya firma falle cuando el secreto está definido.

### Redis por cola

Billing: AOF activo, retención 24–48 h, cifrado en reposo si el proveedor lo tiene. Perder un job de cobro no es aceptable. Notifications, Search y Knowledge: AOF apagado o `everysec` con retención corta. Perder un aviso se acepta. No es una decisión para todo Redis a la vez. HMAC sigue fuera.

### Arranque, CORS y Sentry

En Railway, Auth no arranca si `NODE_ENV` no es `production`. El nombre de entorno que contenga `stag` exige `JWT_SECRET_PROD_SHA256` y `DATABASE_URL_PROD_SHA256`; si el sha256 coincide, no arranca. Esos hashes son de referencia, no el secreto.

CORS: con `NODE_ENV=production` y sin lista, orígenes fijos. Con `CORS_ORIGINS` vacío, no arranca. Fuera de Railway, en development, test o sin `NODE_ENV`, refleja el Origin. Cualquier otro caso sin lista no arranca.

Sentry en Auth y Core sigue con `sendDefaultPii: false` y ahora `beforeSend` tapa authorization, cookie, code, state, password y token. Falta el error de prueba en producción. `/health` de Auth ya no devuelve el prefijo de la clave de Resend.

### Audit log

`docs/supabase/migrations/062_audit_logs_append_only.sql` crea un trigger que rechaza `UPDATE` y `DELETE` en `meta.audit_logs`, y revoca esos permisos a `PUBLIC`. No está aplicado. El número no debe chocar con `061` de la rama de nómina. El dueño de la tabla puede desactivar el trigger. La hoja de cambios de Railway, Cloudflare, Supabase, Stripe y GitHub sigue vacía.

### request_id

El gateway reenvía `X-Request-Id` con `$request_id` de Nginx. No está redesplegado. Core lo copia a `meta.requestId`, a la cabecera de respuesta y al evento del bus. Billing e Internal lo copian a la respuesta y al evento que encolan. Falta la prueba de que el mismo valor sale en el log de los tres. Hub no lo propaga todavía.

### RGPD

Las 72 horas no se aplican a cualquier incidencia con datos personales. La notificación a la autoridad es cuando la violación puede suponer un riesgo para los derechos y libertades de las personas, salvo que ese riesgo sea improbable. El plazo corre desde que el responsable tiene constancia. Quien trata por encargo avisa al responsable sin dilación indebida.

### Otros cierres de esta pasada

- `059` y `060` no tienen migración inversa. Son aditivas. Un `DROP` de la fiscal rompería la cadena. El retroceso es el backup.
- Tabletop: la copia cifrada es la que ya hace el usuario en el producto. No hay backup de servidor del SQLite hasta que pase a Postgres. Decisión explícita, no un olvido.
- `security.txt` está en `apps/landing/public/.well-known/security.txt`. Cuenta cuando la landing desplegada lo sirva.
- La imagen de producción del gateway queda fijada por digest en `gateway/Dockerfile`. El compose local puede seguir con el tag.
- El WAF en bloqueo se revalida cada mes. Todavía no hay un workflow que falle si la regla pasa a «solo registro». Hasta entonces, la fecha se anota en `docs/evidence/` el día que se mire.
- Tope de AI antes del piloto: 200 peticiones por tenant y día, 429 al pasarlo, aviso al 80 %. No está implementado. No se implementa en los dos checkouts a la vez.
- OpenTelemetry, métricas finas de Postgres, carga, SBOM, Terraform y coste siguen después del circuito.

## Qué no se hace en este ciclo

No se monta Kubernetes ni se migra a AWS. No se crea un microservicio «Dakinis Security». No se activa `FORCE ROW LEVEL SECURITY` en producción sin la prueba de esa tabla. No se copian datos reales a staging. No se trata Vault como bóveda. No se firma cada job con HMAC por defecto. No se marca hecho un control de dashboard desde el repositorio.

## Revisión después de estos cambios

Nada de esta pasada está desplegado ni verificado. Recorrer esta lista antes de dar el árbol por bueno. El resultado, cuando exista, se guarda en `docs/evidence/` con la fecha en el nombre. Escribir la lista no cierra ninguna condición.

### Secretos que tienen que coincidir

| Variable | Dónde | Qué mirar |
|---|---|---|
| `JWT_SECRET` o `DAKINIS_JWT_SECRET` | Auth, Internal, Hub, Search, Notifications | El mismo valor. En Search y Notifications es nuevo: sin él, en Railway el envío responde 503 y la consulta privada queda vacía |
| `DAKINIS_INTERNAL_SERVICE_KEY` | Internal, Knowledge, AkoeNet, StreamAutomator, Hub, Search, Notifications | La misma. No va en el gateway ni en un frontend |
| `AKOENET_MEMBER_KEY` | Internal y akoenet-backend | Distinta de la clave de servicio. Las dos a la vez. Sin ella, en Railway las rutas de módulos de AkoeNet responden 503 y niveles y automod dejan de ver la config del servidor |
| `DAKINIS_WORKER_KEY` | Internal y cada proceso que publique en `POST /events` | Distinta de la clave de servicio. El SDK la envía si está definida. Sin ella, en Railway publicar sin JWT responde 503 |

`JWT_STRICT_ISS_AUD=false` relaja emisor y audiencia en los tres sitios que verifican el JWT de persona: Internal, Search y Notifications. Tiene que decir lo mismo en los tres.

### Orden, cuando se despliegue

No desplegar todavía. Cuando se haga, este orden:

1. Anotar en Railway el commit, la rama y el root directory de cada servicio antes de cambiar nada.
2. Poner `JWT_SECRET` en Search y Notifications, el mismo de Auth, antes de publicar esas imágenes.
3. Poner `DAKINIS_WORKER_KEY` en Internal y en el proceso que publica, en la misma ventana. Si Internal sale antes, `POST /events` sin JWT responde 503.
4. Poner `AKOENET_MEMBER_KEY` en Internal y en akoenet-backend, en la misma ventana. Si Internal sale antes, módulos, comandos, eventos del assistant, XP y la lectura de módulos responden 503.
5. Publicar Hub en la misma ventana que Internal. El dashboard, el inbox y el stream de eventos reenvían el JWT. Si Internal sale antes, responden 401.
6. Recargar el gateway. `/internal/` vacía `X-Dakinis-Actor`, `X-Dakinis-Akoenet-Member` y `X-Dakinis-Worker`. Hub, AkoeNet, Search y Notifications se hablan por la red privada, no por ese borde.
7. No aplicar `059`, `060` ni `062`. No activar `FORCE ROW LEVEL SECURITY`. No rotar `service_role` ni el webhook de Stripe en el mismo cambio.

### Qué probar en cuanto haya un entorno

- Dos tenants parecidos: búsqueda, exportación y un worker. Artefacto `docs/evidence/isolation-export-YYYYMMDD.txt` y uno por worker. Hoy no hay exportación que probar si Core aún no exporta: el hueco se escribe, no se marca hecho.
- `POST /events` con la clave de worker y un `userId` en el cuerpo responde 403. Con el JWT, el `userId` y el tenant quedan los del token.
- Search: una query de `invoices` con la clave de servicio y el tenant de otro no devuelve filas. La misma query con el JWT de ese tenant sí, si el documento está etiquetado. El `POST /v1/index` con la clave de servicio todavía puede escribir el tenant que quiera: mirar si un documento envenenado aparece luego en la consulta del JWT.
- Notifications: `POST /v1/send` y el stream con un `userId` distinto del `sub` responden 403. El inbox de otra persona también.
- AkoeNet: cambiar un módulo sin `AKOENET_MEMBER_KEY` responde 503 en Railway. Con la clave, el UUID tiene que ser miembro. Un UUID de otro miembro, presentado por esa clave, hoy entra: anotarlo, no darlo por cerrado.
- El dashboard de Hub con el JWT correcto abre. Con el `userId` de otra persona, 403. El stream igual, también si el UUID cambia de mayúsculas.
- El mismo `X-Request-Id` en el log de Core, Billing e Internal. Hub lo reenvía en el proxy y en el stream; falta verlo en el log.
- Un refresh revocado responde 401. El access token sigue válido hasta `exp`: la condición 3 no se cierra con esta pasada.
- Tres pruebas de Stripe cuando la base viva tenga el `UNIQUE`: el mismo evento dos veces, uno viejo que no pise un estado nuevo, un fallo a medias que no cobre otra vez.

### Qué agregar antes de fiarse del despliegue

- Las llamadas de workspace de AkoeNet (`feature-flags`, `workspaces/me`, addons, escritorio y el dashboard interno) siguen yendo solo con la clave de servicio. En producción esas rutas de persona responden 401. No se fabrica un JWT en el backend de AkoeNet. Hay que reenviar el JWT del IdP desde la petición del usuario, o dejar esas pantallas apagadas hasta entonces.
- Quien tiene `AKOENET_MEMBER_KEY` sigue pudiendo nombrar el UUID de otro miembro en el alta de módulo, el comando, el evento y el reflejo de XP. Cerrarlo exige el JWT de esa persona en la petición, no otra clave compartida.
- El alta de Search sigue eligiendo el tenant del documento. La consulta ya no.
- El access token no se revoca antes de `exp`. El corte del WebSocket de AkoeNet espera a esa revocación.
- Suplente de las condiciones 4, 6 y 8: sigue sin nombrar.
- Hoja de cambios de Railway, Cloudflare, Supabase, Stripe y GitHub: sigue vacía. MFA y Access de Cloudflare no se activan desde el repo.
- El CSV de contraseñas de Vault no se lee, no se mueve y no se borra desde aquí. Lo mueve quien tenga la copia, y rota lo que haya dentro.
- Los dos checkouts de AI se comparan antes de borrar uno y antes de poner el tope de 200 peticiones. No se implementa el tope en los dos a la vez.
- `059` y `060` no tienen migración inversa. `062` está escrita y no aplicada. El número no debe chocar con `061` de nómina.
- Comparar las copias de `actor.js` en Internal, Search y Notifications si se cambia la verificación del JWT. Tienen que seguir iguales.

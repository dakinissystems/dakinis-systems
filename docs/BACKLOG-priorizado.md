# Dakinis — Backlog priorizado

Consolidado de la revisión de plataforma, Core, StreamAutomator, AkoeNet, LifeFlow, Tabletop, Messenger y AETHER. **Fecha de la revisión: 2026-11-14.** Origen: documentación empaquetada (ZIP UX/funcionamiento). **Basado solo en la documentación recibida: verifica cada ítem contra el código antes de darlo por válido o por hecho.**

Copia de trabajo local (gitignore): `.tmp-readmes/BACKLOG-priorizado.md` en `D:\dakinis-systems`. El detalle de producto/UX sigue en [DAKINIS-UX-ARCHITECTURE.md](./DAKINIS-UX-ARCHITECTURE.md) y [core-ux.md](./core-ux.md). Circuito → [RUNBOOKS/circuito-comercial.md](./RUNBOOKS/circuito-comercial.md). Puerta de seguridad → [RUNBOOKS/infra-desarrollador.md](./RUNBOOKS/infra-desarrollador.md). Evidencias → `docs/evidence/` (en el checkout de producto; vacío de pruebas = no verificado).

## Cómo usarlo

Un ítem está **hecho** cuando tiene los cuatro estados, igual que la puerta de seguridad:

1. Código en `main`
2. Desplegado (commit anotado en Railway)
3. Verificado (prueba repetible)
4. Evidencia fechada en `docs/evidence/` (sin secretos)

Tamaños: **S** &lt; 1 día · **M** 1–3 días · **L** &gt; 3 días (estimaciones orientativas para una persona).

Reparto del esfuerzo mientras haya **0 clientes de pago**: Dakinis One y circuito comercial **60 %** · productos independientes **20 %** · juegos **15 %** · experimentos **5 %**. No se construye una función nueva si la anterior no la ha usado alguien que no sea quien la programó.

**Orden de bloques:** A → B → C → (D, E, F en paralelo según 60/20) → G, H, I → J (congelado) → K (AETHER aparte).

### Estado al incorporar (2026-11-14)

Ningún ítem de este backlog se marca cerrado aquí. `docs/evidence/` solo tiene la plantilla README; no hay fichas de prueba. Los diez primeros pasos abajo están **abiertos**.

Al cerrar un ítem: cambia su fila a `hecho`, anota commit Railway si aplica, y enlaza la evidencia (`docs/evidence/…-YYYYMMDD…`).

---

## Diez primeros pasos (cola inmediata)

| # | ID | Qué | Estado | Evidencia |
|---|-----|-----|--------|-----------|
| 1 | A1 | CSV de Vault | abierto (manual operador; agente no abre el CSV) | — |
| 2 | A2 + A3 | Gateway caché/rate + deep-link SSO | A2: código · A3: Auth+Hub+Tabletop código; falta deploy/HAR | — |
| 3 | A4 | Claves por defecto / tenant Core | código + tests locales; sin Railway/evidencia | — |
| 4 | A5 | MFA FIDO2 cuentas críticas | abierto | — |
| 5 | B3 + B4 | Outbox ventas + caja en servidor | abierto | — |
| 6 | B5 + B6 | Catálogo planes + Billing E2E vivo | abierto | — |
| 7 | B1 + B2 | Copérnico real + miembros/roles | abierto | — |
| 8 | C4 | Suplente y procedimiento P0 | abierto | — |
| 9 | C1 + C2 | Sesión revocable + rotación secretos | abierto | — |
| 10 | F1 + F2 | Posicionamiento + 20 conversaciones | abierto | — |

---

## A. Esta semana (verificar y cerrar riesgos abiertos)

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| A1 | CSV de Vault con contraseñas en claro. Buscar copias en discos sincronizados, papelera y backups; ejecutar Gitleaks y `git log --all`; rotar las credenciales; si estuvo en Git, limpiar el remoto después de rotar; borrar las copias en claro | Nota en `evidence/` con fecha y lista de servicios rotados (sin valores). El CSV no existe en ningún disco | M | abierto |
| A2 | Clave de caché y rate limit del gateway (`sess:` + 48 caracteres del JWT). Comprobar si son los primeros o los últimos caracteres. Si son los primeros, son iguales para todos | Test con dos JWT de usuarios distintos: B no recibe la respuesta cacheada de A y cada sesión tiene su propio cubo. Clave = hash completo del token o `sid`/`jti` | S | código (firma JWT); falta desplegar gateway + prueba A≠B |
| A3 | Token en la URL del deep-link SSO (Hub → producto) | Sustituido por código de un solo uso con TTL corto, canjeado en backend. Un HAR del flujo no muestra ningún token en la URL | M | código Auth `/sso/handoff`+`/consume`, Hub sin JWT en URL, Tabletop canjea; falta Railway + HAR + resto de productos |
| A4 | Core: claves por defecto y tenant por cabecera. `dakinis-dev-key` y `x-business-id` como fuente de autoridad | Core no arranca en producción con claves de desarrollo. El tenant sale solo del JWT. Test que lo comprueba | S | código + tests; falta Railway + evidencia |
| A5 | MFA FIDO2 en Cloudflare, Railway, Supabase, Stripe y GitHub | Inventario con fecha de cada cuenta (sin secretos). Sin Global API Key de Cloudflare | S | abierto |
| A6 | Cuentas demo en producción (`demo@local`/`demo123` de LifeFlow con Premium, demo admin de Core) | Intento de login falla en producción; contraseñas demo solo en variables locales | S | abierto |
| A7 | Checkouts duplicados (AI, StreamAutomator, AkoeNet/AkoNet, Tabletop, shared) | Tabla en `OPERATIONS.md` con repo canónico, rama y root directory por servicio Railway; el otro archivado tras comparar historias | M | abierto |

---

## B. Circuito comercial (único frente hasta cobrar)

Meta: ¿Puede un restaurante usar Dakinis 30 días y pagar sin que intervengas?

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| B1 | Recorrer Copérnico en entorno real tras `738943b` (carta, venta, inventario, caja, CRM) | Recorrido con captura/nota fechada; fallos abiertos como incidencias | M | abierto |
| B2 | Invitar al personal (Admin → Miembros) y probar permisos por rol | Un empleado entra con su cuenta y solo hace lo que su rol permite | S | abierto |
| B3 | Outbox transaccional para eventos de venta (hoy el bus es en memoria y se pierde al reiniciar) | Reiniciar el proceso a mitad de una venta no pierde ni duplica el descuento de inventario. Consumidores idempotentes por `eventId` | L | abierto |
| B4 | Caja y turnos en servidor (hoy el fondo vive en `localStorage` por dispositivo) | Dos dispositivos ven el mismo fondo y cierre. La auditoría `restaurant.cash_close` conserva la diferencia justificada | M | abierto |
| B5 | Catálogo único de planes (hoy: Starter/Growth/Pro, Free/Creator/Pro, Lite/Premium, 4,99 € vs 9/19 €) y precio piloto por escrito | Un documento con nombres y precios; Stripe lo refleja; `/precios` con un solo CTA | M | abierto |
| B6 | Billing E2E en vivo: checkout, webhook 200, `billing.subscriptions` = `business.plan`, portal, renovación, cambio, cancelación, impago | Checklist de `billing-e2e.md` completo con un cobro real; degradar y restaurar probados | L | abierto |
| B7 | Eventos Stripe que faltan: `invoice.payment_action_required` (3DS), `customer.subscription.trial_will_end`, disputas | Webhook los recibe y actúa; prueba con Stripe CLI | S | abierto |
| B8 | Tres pruebas de webhook: mismo evento dos veces a la vez, evento viejo que no pisa estado nuevo, fallo a medias sin doble cobro. Ver el `UNIQUE` en la base viva | Suite automática en CI + captura del índice `UNIQUE` | M | abierto |
| B9 | Hub «Mi día» con datos reales de Core y al menos otro producto; verificar `d521b9a` | Una venta o stock bajo aparece en Mi día con acción («Ver inventario» abre `/app/inventario`) | M | abierto |
| B10 | Onboarding sin asistencia: empresa, empleados, carta (importar CSV), inventario, primera venta, con checklist guiado | Una persona ajena completa el flujo sin tu ayuda | L | abierto |
| B11 | Smoke E2E automático diario: venta → inventario → Hub → plan = Stripe | Job programado con resultado fechado; alerta si falla | M | abierto |
| B12 | (Opcional, paralelo) StreamAutomator como primer cliente de Dakinis Billing | Un pago de SA pasa por Billing de plataforma | M | abierto |

---

## C. Puerta antes del segundo negocio (8 condiciones + soporte)

Orden recomendado por el runbook: **3, 4, 5, 8, 7, 6, 1, 2**.

| ID | Cond. | Qué | Criterio de hecho | Tam. | Estado |
|----|-------|-----|-------------------|------|--------|
| C1 | 3 | Sesión revocable. Refresh revocado deja de valer; denylist por `jti`/`sid` en Redis para acciones sensibles; reautenticación para exportar, borrar organización o crear API key | Prueba negativa con refresh revocado; acción sensible exige reauth | L | abierto |
| C2 | 4 | Secretos invalidables. Inventario por familia (JWT, service key, Stripe y webhook, `service_role`, OAuth, Redis, cifrado de SA, Railway); ensayar rotación de `JWT_SECRET` y `DAKINIS_INTERNAL_SERVICE_KEY` en staging | Dos fichas de ensayo con fecha | L | abierto |
| C3 | 5 | Ver B8 | | | abierto |
| C4 | 8 | Procedimiento P0: niveles P0–P3, plazo de 72 h con datos personales cuando aplique, suplente nombrado y acceso de emergencia (break-glass) en el gestor de secretos | Documento firmado por ti y el suplente; simulacro de lectura | M | abierto |
| C5 | 7 | Audit log: el rol de la aplicación solo inserta (comprobar que no tiene `UPDATE`/`DELETE`); revisión mensual de audit logs nativos de Railway, Cloudflare, Supabase, Stripe y GitHub | Consulta de privilegios + primera revisión mensual archivada | M | abierto |
| C6 | 6 | Restauración en entorno aislado con ficha (fecha, origen, destino, tiempo, integridad, migración, pruebas). Confirmar plan de Supabase con recuperación a un punto en el tiempo | Una restauración dentro de los RPO/RTO provisionales (Billing 15 min/4 h, Auth 24 h/8 h, Core 24 h/24 h) | L | abierto |
| C7 | 1 | Aislamiento de tenants: suite en CI con dos tenants sintéticos parecidos (consultas, búsqueda, exportación y cada worker: Internal, Search, Knowledge, Notifications) | Archivo de evidencia; CI en verde | L | abierto |
| C8 | 2 | Permisos por rol: cerrar que quien tiene `AKOENET_MEMBER_KEY` pueda nombrar a otro miembro; Search deriva el tenant del JWT en el alta; AkoeNet reenvía el JWT del IdP en llamadas de workspace | Pruebas negativas por cada caso | L | abierto |
| C9 | — | Staging mínimo (Gateway, Auth, Core, Billing, Hub, Internal, Postgres y Redis propios, worker de venta) con Cloudflare Access; sin datos reales; Auth no arranca si el hash de `JWT_SECRET` o `DATABASE_URL` coincide con producción | Escenario B11 corre en staging | L | abierto |
| C10 | — | RLS en staging mirando el rol real (¿dueño de tabla? ¿`BYPASSRLS`? ¿`service_role`? ¿`SECURITY DEFINER`?) y decidir `FORCE RLS` por tabla | Informe por tabla | M | abierto |
| C11 | — | Despliegue de `iss`/`aud` en el orden del runbook (primero confirmar que no circulan tokens de 7 días) | Validación estricta activa; sin fallos de login | M | abierto |
| C12 | — | RGPD: exportación y borrado de cuenta (respetando lo que la factura obliga a conservar), contrato de encargado con clientes, registro de actividades de tratamiento | Flujos probados; documentos publicados | L | abierto |
| C13 | — | Observabilidad: `request_id` visible en Core, Billing y Hub (luego OpenTelemetry); sondas sobre `/health/ready`; monitor sintético (login → venta); página de estado; alertas de coste en Railway, OpenAI y Supabase | Mismo `request_id` rastreado de extremo a extremo; alerta de prueba recibida | L | abierto |
| C14 | — | Claves por servicio (en lugar de una única service key compartida por siete servicios) y plan para RS256 | Diseño escrito; primer servicio migrado | L | abierto |

---

## D. Plataforma

| ID | Sistema | Qué | Criterio de hecho | Tam. | Estado |
|----|---------|-----|-------------------|------|--------|
| D1 | Auth | Contexto de tenant activo (organización → marca → local, ADR-016); hoy el token lleva un solo `tenantId` | Cambiar de local emite token con el contexto correcto; test de aislamiento | L | abierto |
| D2 | Auth | MFA de usuario y pantalla Configuración → Seguridad (sesiones, dispositivos) en Hub | Un usuario ve y cierra sus sesiones | L | abierto |
| D3 | Auth | Separar el cliente OAuth de Google de Auth del de StreamAutomator (scopes de YouTube requieren verificación) | Dos clientes en Google Cloud | S | abierto |
| D4 | Auth | Unificar `VITE_DAKINIS_AUTH_URL` (con/sin `/auth`) y añadir test de contrato; actualizar README (refresh, sesiones, OAuth) | Un solo formato; test falla si se mezcla | S | abierto |
| D5 | Gateway | Fijar imagen de nginx por digest; resolver correcto fuera de Compose; CORS con orígenes explícitos | Config revisada y desplegada | S | abierto |
| D6 | AI | Topes antes del piloto: 200 peticiones/tenant/día, aviso al 80 %, tokens, concurrencia, presupuesto diario; coste por tenant | 429 al pasar el tope; panel de coste | M | abierto |
| D7 | AI | Validar herramientas en backend (tenant, permiso, herramienta); confirmación antes de actuar; reautenticación para devoluciones y cancelaciones; evaluaciones con casos de hostelería; transparencia de chatbot | Pruebas de inyección de prompt; set de evaluación versionado | L | abierto |
| D8 | Notifications | SPF, DKIM y DMARC en `dakinissystems.com`; Resend en vivo; separar transaccional de marketing; baja; dead-letter documentado | Correo de prueba pasa las tres comprobaciones | M | abierto |
| D9 | Search/Knowledge | Empezar con búsqueda de texto de Postgres; pgvector solo cuando un producto lo use; RLS en embeddings; borrar la fuente borra el índice | Prueba negativa entre tenants; borrado propaga | L | abierto |
| D10 | DES | Retirar `--nexora-*` y los `.dark` duplicados; publicar `@dakinis/design-system` versionado en registro privado en vez de scripts de sincronización | Hub, Core, SA y AkoeNet consumen el paquete; CI de diseño en verde | L | abierto |
| D11 | Docs | `STATUS.md` generado con fecha real; un único ADR por decisión (hoy copiados en 3 carpetas); dividir `infra-desarrollador.md` (54 KB) por temas; renombrar el TEMP- | Enlaces revisados por CI; STATUS fechado al generarse | M | abierto |
| D12 | Docs | Reescribir `API_READY.md` y la arquitectura de Core (hablan de clínica/peluquería/inmobiliaria y SQLite; el producto es hostelería sobre Postgres) | Docs coinciden con el código | M | abierto |
| D13 | Coste | Panel de costes mensual por servicio y alertas de presupuesto | Alerta de prueba | S | abierto |

---

## E. Dakinis One (Core) — producto de hostelería

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| E1 | TPV offline (cobrar sin conexión y sincronizar) | Cobro sin red y reconciliación sin duplicar | L | abierto |
| E2 | Impresión de comandas y tickets (ESC/POS): el módulo de impresión existe; verificar con impresora real | Prueba con la impresora de Copérnico | M | abierto |
| E3 | KDS (pantalla de cocina) | Comanda aparece en cocina y cambia de estado | L | abierto |
| E4 | Escandallo y margen por plato (hoy «sin calcular») | Margen visible por plato y por día | L | abierto |
| E5 | Alérgenos en carta y ticket | Campo por plato y listado imprimible | M | abierto |
| E6 | Roles con PIN rápido (camarero, cocina, caja) sobre permisos por conjuntos (`sales.read`, `inventory.adjust`, `billing.manage`) | Cada rol ve solo lo suyo | L | abierto |
| E7 | Cuenta dividida y propinas | Dividir y cobrar en dos métodos | M | abierto |
| E8 | Informe diario al dueño (ventas, caja, stock bajo) por email o WhatsApp | Llega a la hora configurada | M | abierto |
| E9 | VERI\*FACTU: decidir proveedor certificado conectado por el adaptador frente a certificación propia; no presentarlo como certificado hasta la revisión normativa; verificar fechas de exigibilidad con tu gestor | Decisión escrita; texto comercial alineado | M | abierto |
| E10 | Delivery: priorizar agregador o importación por email/CSV antes que acuerdos directos con Glovo/Uber | Un pedido externo entra sin acuerdo de partner | L | abierto |
| E11 | Claves de API de Core con hash en base de datos, alcance y rotación (hoy un archivo `.dakinis-keys.json`) | Rotar sin reiniciar y con auditoría | M | abierto |
| E12 | Importar carta desde CSV o foto | Carta cargada sin ayuda | M | abierto |

---

## F. Comercial y mensaje

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| F1 | Elegir un posicionamiento (hoy: «sistema operativo para empresas», «ERP con IA para restaurantes» y un ICP cuyo Tier 1 es retail). Alinear ICP, landing, MESSAGING y precios | Un documento canónico; los otros lo enlazan | S | abierto |
| F2 | 20 conversaciones con dueños de restaurante; rellenar `ANALYSIS.md` y la tabla de objeciones | Hoja con 20 filas y patrones | L | abierto |
| F3 | Landing: Golden Path en ≤ 30 s, captura real del Hub, enlace correcto de AkoeNet (hoy apunta a un 503), WhatsApp real | Persona ajena explica qué es en 30 s | M | abierto |
| F4 | Precio piloto por escrito (por local, no inventado) y comparación con TPV de restauración locales (revisar Revo, Last.app, Ágora) | Documento con precio y diferencias | S | abierto |
| F5 | Textos legales de `dakinissystems.com` (aviso legal, privacidad, cookies); `security.txt` servido | Páginas publicadas | M | abierto |

---

## G. StreamAutomator

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| G1 | Alinear promesas legales: T&C dicen «publicación multiplataforma» pero el README la da en desarrollo; privacidad no lista Instagram; guía no lista Kick; planes distintos entre guía y FAQ | Los cuatro documentos coinciden con lo que la app hace | M | abierto |
| G2 | Doble opt-in en «Avísame» (emails de espectadores), enlace de baja y mención en privacidad | Flujo con confirmación y baja | M | abierto |
| G3 | Latido del scheduler («último ciclo hace X min») con alerta si se detiene; aviso al usuario cuando una publicación falla | Detener el scheduler dispara la alerta | M | abierto |
| G4 | API key de Nightbot: claves de solo lectura, botón de rotar, visibles una vez, límite de peticiones | Rotar invalida la anterior | M | abierto |
| G5 | Webhook a AkoeNet con HMAC, marca de tiempo, protección contra repetición e idempotencia; actualizar el contrato compartido en ambos repos | Evento reenviado se rechaza | M | abierto |
| G6 | Rúbrica de dependencias: P0 (directa, runtime, alcanzable) frente a P3; revisión humana y lockfile; sin actualización masiva | 10 críticas y 145 altas clasificadas | L | abierto |
| G7 | T&C: desistimiento de 14 días en servicios digitales, cancelación, reembolsos, precios e IVA | Cláusulas publicadas | S | abierto |
| G8 | Health público o heartbeat para worker y scheduler | Endpoint o monitor activos | S | abierto |
| G9 | Verificar requisitos reales de plataformas antes de prometerlas: API de X de pago, Instagram (cuenta profesional y revisión), auditoría de YouTube | Tabla por plataforma con coste y requisitos | M | abierto |
| G10 | Detección de directo con Twitch EventSub | Aviso al empezar el stream | M | abierto |
| G11 | Flujo posterior al stream (clip a Discord, agradecimiento) y streams recurrentes, `.ics` y hora local en la página pública | Probado con un usuario real | L | abierto |
| G12 | Migrar licencias al Billing de plataforma | SA cobra vía Dakinis Billing | L | abierto |

---

## H. AkoeNet

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| H1 | Reportes y apelaciones dentro de la app (mecanismo de notificación y reclamación; revisar con abogado qué obligaciones te aplican) | Un usuario reporta y apela sin email | L | abierto |
| H2 | DMs de desconocidos limitados por defecto (solo amigos o miembros del mismo servidor) | Ajuste por defecto activo | M | abierto |
| H3 | Privacidad: identificar al responsable de forma consistente, plazos de conservación concretos, aclarar que los DMs no van cifrados de extremo a extremo | Política revisada | S | abierto |
| H4 | Actualizar el informe de transparencia con fecha | Fecha de la última revisión actual | S | abierto |
| H5 | Servidor TURN para voz (hoy solo STUN de Google) | Llamada entre dos redes restrictivas conecta | M | abierto |
| H6 | Instaladores fuera de Git (el `.exe` y el `.sig` se commitean en `main`): usar Releases o un bucket; `latest.json` apunta allí | Repo sin binarios nuevos | M | abierto |
| H7 | Firma Authenticode de Windows | Instalador sin aviso de SmartScreen | M | abierto |
| H8 | Copia cifrada fuera de línea de la clave del updater; canales estable/beta; poder retirar una versión mala | Restaurar la clave en una máquina limpia | M | abierto |
| H9 | Android: Play App Signing activo, keystore fuera de git, comprobar requisitos de cuenta personal nueva (pruebas cerradas) | Ficha de Play aprobada | M | abierto |
| H10 | Notificaciones de escritorio y web push | Llegan con la app cerrada | M | abierto |
| H11 | Comunidad: roles granulares, hilos, búsqueda, invitaciones con caducidad, registro de moderación, cola de reportes, niveles de verificación | Cada pieza usada en una comunidad real | L | abierto |
| H12 | Assistant: cola de revisión humana para moderación con IA, cuotas de coste por servidor, sincronizar roles de suscriptores de Twitch, aviso de directo (requiere G5) | Un streamer usa el aviso en directo | L | abierto |

---

## I. LifeFlow y Tabletop

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| I1 | Resolver contradicciones de documentación de LifeFlow: «standalone, no se integra» frente a SSO en Hub; precio 4,99 € frente a 9/19 €; nombre definitivo pendiente | Una fuente de verdad | S | abierto |
| I2 | Validar con 5–10 personas reales antes de PSD2 o IA | Retención a una semana medida | M | abierto |
| I3 | Privacidad, términos y aviso de «no es asesoramiento financiero» | Publicados | M | abierto |
| I4 | Cifrado en reposo y borrado de originales tras el OCR (nóminas y tickets) | Original no persiste más de lo necesario | M | abierto |
| I5 | Backups continuos de SQLite (p. ej. Litestream) antes de migrar a Postgres | Restauración probada | M | abierto |
| I6 | Tabletop: revisar atribución SRD 5.1 (OGL y CC-BY 4.0) | Aviso en la app | S | abierto |

---

## J. Congelado o aparcado (hasta que el circuito cobre)

| Ítem | Qué hacer |
|------|-----------|
| Messenger | Pausar. Si sigue: valorarlo como modo de AkoeNet; renombrar «Dakinis Studio» (choca con el Developer OS) y «Together» (choca con el Media Player); edad mínima y reporte/bloqueo en la app si apunta a familias |
| Media Player de AkoeNet | Congelado: 0 casillas hechas; no copiar nombre ni skins de Winamp; revisar términos de cualquier SDK de terceros |
| Workspace (26 addons), Studio, Fitness | Mover a `labs/`; no arrancar en el dev diario |
| Nómina (PR #64), Glovo/Uber directos, SSE/WS, System Health propio | Después de cobrar |
| Stripe 23, Kubernetes, AWS, HMAC en colas | No |
| Juegos (Mythos, Eclipse, Aesir, etc.) | 15 % del esfuerzo, sin contenido ni sistemas nuevos |
| Vault | Solo revisión del formato y recuperación en dispositivo limpio; no usarlo como bóveda aún |

---

## K. AETHER (navegador) — aparte del reparto anterior

Detalle en `docs/ROADMAP.md` y `docs/CURRENT-STATUS.md` del propio AETHER. Resumen de bloqueantes antes de una beta pública en Windows:

| ID | Qué | Criterio de hecho | Tam. | Estado |
|----|-----|-------------------|------|--------|
| K1 | Canal de actualizaciones firmadas (claves, feed, verificador, rollback) | Update sin firma rechazado en test | L | abierto |
| K2 | SQLite en el host y migración en arranque | Datos sobreviven a una actualización | L | abierto |
| K3 | Revisión independiente del vault o retirada del keyring | Informe de revisión | L | abierto |
| K4 | Verificar códecs (H.264/AAC) y DRM (Widevine) | Vídeo de un servicio habitual reproduce | M | abierto |
| K5 | Tests automáticos: contenido no puede llamar IPC, storage, update sin firma | CI en verde | M | abierto |
| K6 | Buscador por defecto configurable, UI de permisos, pop-ups, importación | Usable a diario | L | abierto |

---

*Actualiza este archivo al cerrar cada ítem y enlaza su evidencia.*

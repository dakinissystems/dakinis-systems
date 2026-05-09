    # Variables `docker/.env.dev` — referencia temporal (estructura SaaS)

    > **Propósito:** documentar qué debe ir en `docker/.env.dev` (o equivalente cargado por `compose.full.yml` vía `env_file: .env.${ENV:-dev}`), **de dónde sale cada valor** y qué servicio lo consume.  
    > **Borrar o archivar** este archivo cuando la documentación oficial del repo lo sustituya.

    ## JWT — `iss` / `aud` y claims (Fase 1)

    | Variable | Default | Uso |
    | --- | --- | --- |
    | `JWT_ISSUER` | `platform-auth` | Claim `iss` de los access tokens emitidos por **`platform/auth`**. Los consumidores deben usar el mismo valor al verificar el IdP. |
    | `JWT_AUDIENCE` | `dakinis-platform` | Claim `aud` del IdP. |
    | `JWT_CORE_ISSUER` / `JWT_CORE_AUDIENCE` | `dakinis-core` / `dakinis-core-api` | Tokens de sesión del **core** tras `POST /api/auth/login`. |
    | `JWT_STREAMAUTOMATOR_ISSUER` / `JWT_STREAMAUTOMATOR_AUDIENCE` | `streamautomator-api` / `streamautomator` | Login local StreamAutomator (`authUtils.generateToken`). |
    | `JWT_AKOENET_ISSUER` / `JWT_AKOENET_AUDIENCE` | `akoenet-api` / `akoenet` | Access tokens AkoeNet. |
    | `JWT_STRICT_ISS_AUD` | (vacío = off) | Si es `true`, no se aceptan JWT **sin** `iss` (re-login obligatorio en todos los productos). |

    Cada servicio valida con `jwt.verify` usando **lista cerrada** de pares `issuer`+`audience` permitidos para ese binario, además de `algorithms: ['HS256']`. Así se evita que un token pensado para AkoeNet sea aceptado en StreamAutomator aunque compartan `JWT_SECRET`. Mientras `JWT_STRICT_ISS_AUD` no esté en `true`, se mantiene un **fallback** que acepta tokens antiguos sin `iss` para no cortar sesiones abiertas.

    ### Política recomendada: cierre del modo legacy

    Definir en release notes / calendario interno un **deadline** para dejar de aceptar JWT sin `iss`/`aud`:

    - **Mientras dure la transición:** `JWT_STRICT_ISS_AUD` vacío o `false` (comportamiento actual).
    - **Versión objetivo (ej. v1.0):** `JWT_STRICT_ISS_AUD=true` **obligatorio** en todos los entornos no locales; documentar ventana de rotación y re-login si hace falta.

    Sin fecha fijada, el fallback “JWT sin `iss`” tiende a quedarse años y vuelve ambigua la confianza entre productos.

    ## Fase 2 — identidad global (`platform_user_id`)

    | Pieza | Comportamiento objetivo |
    | --- | --- |
    | **IdP** (`platform/auth`) | JWT representa **identidad global**: `sub` estable, `email`, `tenant`/`tenantId` (slug), `permissions`, etc. |
    | **Productos** (core, AkoeNet, StreamAutomator) | Mantienen usuario **interno** con columna `platform_user_id` enlazada al `sub` (o UUID equivalente del IdP); **auto-provisioning / JIT** la primera vez que llega un Bearer del IdP válido. |
    | **Login SPA** | Ideal: `POST /auth/login` en el IdP → con el access token del IdP, **exchange** al producto (ej. `POST /api/auth/exchange` en core con `businessId` o `businessSlug`) para obtener JWT de sesión del producto donde aún haga falta. |

    **Semántica del exchange (importante):** el exchange debe ser **contextualización** (tenant/negocio, `iss`/`aud` del producto, claims locales), **no** un segundo acto de “login” que regenere identidad. Convención recomendada: el JWT emitido por el producto conserva **`sub` igual al del IdP** (identidad global) y diferencia el contexto con `iss`/`aud`/`scope` (ej. alcance tipo `core`) u otros claims acotados. Evitar tokens de producto cuyo `sub` sea solo el **id interno** del producto: rompe correlación auditoría/logs y SSO.

    **Provisioning / vínculo:** `platform_user_id` y enlaces JIT deben estar keyed por el **`sub` del IdP** (fuente de verdad). `email` solo como ayuda UX, búsquedas secundarias o migración — puede cambiar en el tiempo.

    **Checklist post-pull (Fase 2):** migraciones que añaden `platform_user_id` en cada producto; `npm run migrate` en AkoeNet/StreamAutomator según corresponda; mismo `JWT_SECRET` + `JWT_ISSUER`/`JWT_AUDIENCE` del IdP en servicios que acepten tokens del IdP.

    ### Fase 3 (tras Fase 2) — SaaS operativo serio

    Dirección prevista cuando la identidad esté alineada: **sesiones centralizadas** (tabla `sessions`, device/IP, revoked, TTL), **refresh únicamente en auth**, **revocation** real (logout global), **RS256 + JWKS** (solo auth firma; productos verifican con clave pública), y a la larga **OIDC** (`/.well-known/openid-configuration`).

    ### Normalización de claims (prioridad media, post-Fase 2)

    Objetivo: converger hacia **`tenant` como slug único** y retirar progresivamente duplicados (`tenantId`, `bid`, `business_id`) cuando el stack deje de depender de ellos, para simplificar gateways y políticas.

    ### Migración core a Postgres

    Planificar **antes** de carga fuerte multi-tenant: SQLite en core empieza a doler cuando hay muchos tenants, backup/HA y concurrencia; cuanto antes haya roadmap, menos dolor cuando ya hay clientes.

    ## Cómo encaja el modelo SaaS en el stack

    | Pieza | Rol multi-tenant |
    | --- | --- |
    | **Gateway** (`gateway/`) | Para `/core/` y la mayor parte de `/streamautomator/`: `auth_request` → `GET /auth/verify`; reenvía `X-User-Id`, `X-Tenant-Id`, `X-User-Role`. CORS permite `X-Tenant-Id`. |
    | **platform/auth** | **IdP central**: JWT con `iss`/`aud` configurables, `sub` (UUID), `tenant` + `tenantId` (slug), `role`, `email`, `permissions`. Postgres `dakinis_auth.users.tenant_id` es slug/texto (ej. `default`). `GET /auth/me` exige token del IdP; **`GET /auth/verify`** acepta también JWT **core** o **StreamAutomator** para el gateway. |
    | **platform/core** | Emite JWT propios (`iss`/`aud` core) con `tenant`/`tenantId`/`bid` = id de negocio SQLite. Verifica solo **IdP + core**. |
    | **StreamAutomator API** | Emite JWT locales (`streamautomator-api`/`streamautomator`). Verifica **IdP + local**; bridge JIT desde el IdP; `X-Tenant-Id` puede ser id o slug con `TRUST_GATEWAY_IDENTITY_HEADERS=true`. |
    | **AkoeNet** | Emite JWT (`akoenet-api`/`akoenet`). Con Fase 2, el middleware puede aceptar además JWT del **IdP** y resolver/JIT usuario interno vía `platform_user_id`; sigue siendo “isla” respecto al gateway salvo que se integre `auth_request` explícitamente. |

    ## Variables obligatorias mínimas (stack local)

    | Variable | Dónde se define / origen | Servicios | Notas |
    | --- | --- | --- | --- |
    | `NODE_ENV` | Valor local `development` | Todos los Node | — |
    | `JWT_SECRET` | Genera localmente (`openssl rand -base64 32`) y **reutiliza el mismo valor** en auth, StreamAutomator, AkoeNet y core si deben aceptar el mismo emisor | auth, core-api, streamautomator-api, akoenet-backend | En **auth** es obligatorio (error si falta). En StreamAutomator hay fallback débil en dev; no uses eso fuera de pruebas aisladas. |
    | `JWT_ISSUER` / `JWT_AUDIENCE` | Fijar a `platform-auth` / `dakinis-platform` (recomendado) en todos los servicios que validan el IdP | auth (firma), demás (verificación de tokens del IdP) | Ver sección JWT arriba. |
    | `DATABASE_URL` | **Compose** sobrescribe por servicio para Postgres interno; en `.env.dev` la línea documentada apunta a `dakinis` para **auth** | auth | Dentro del contenedor auth: `postgres://dakinis:dakinis@postgres:5432/dakinis` (ver `compose.full.yml`). |
    | `BACKEND_URL` | Tu URL pública del API StreamAutomator tal como la ve el navegador | streamautomator-api | Con stack Docker típico: `http://localhost:4002`. Importante para **OAuth redirect_uri** y URLs absolutas en callbacks. |
    | `ENV` | Opcional en `docker/.env`; si no se define, Compose usa `dev` y carga `.env.dev` | docker compose interpolación | `env_file: .env.${ENV:-dev}` |

    ## Variables fijadas por Compose (no hace falta duplicar salvo override)

    | Variable | Valor típico (contenedor) | Servicio |
    | --- | --- | --- |
    | `PORT` | 4000 / 4001 / 4002 / 4003 | auth / core / streamautomator / akoenet |
    | `DATABASE_URL` | `postgres://...@postgres:5432/dakinis_stream` | streamautomator-api |
    | `DATABASE_URL` | `postgres://...@postgres:5432/akoenet` | akoenet-backend |
    | `REDIS_URL` | `redis://redis:6379` | streamautomator-api, akoenet-backend |
    | `SQLITE_PATH` | `/app/data/dakinis.db` | core-api |
    | `TRUST_GATEWAY_IDENTITY_HEADERS` | `true` | streamautomator-api |

    ## StreamAutomator API — variables frecuentes (además de las mínimas)

    | Variable | Origen típico | Sensibilidad |
    | --- | --- | --- |
    | `FRONTEND_URL` / `PUBLIC_FRONTEND_URL` | URL del CRA/Vite (ej. `http://localhost:3000`) | Pública |
    | `SUPABASE_URL` | Dashboard Supabase → Project Settings → API | Pública |
    | `SUPABASE_SERVICE_KEY` | Supabase → **service_role** (nunca en front) | **Secreta** |
    | `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | [Twitch Developer Console](https://dev.twitch.tv/console/apps) | ID / secreto |
    | `TWITCH_OAUTH_REDIRECT_BASE_URL` | Igual criterio que `BACKEND_URL` si usas path distinto | Pública |
    | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth | ID / secreto |
    | `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` / `DISCORD_BOT_TOKEN` | Discord Developer Portal | Secretos |
    | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard | **Secretos**. Aplican **solo** a Dakinis StreamAutomator (Scheduler). |
    | `TOKEN_ENCRYPTION_KEY` | Generar y fijar (idealmente 32+ bytes); si falta se deriva de `JWT_SECRET` | **Secreta** |
    | `REDIS_URL` | Ya en compose; override solo si Redis externo | Cadena de conexión |
    | `ENABLE_*` workers, `LOG_LEVEL`, `DATABASE_SSL`, `DB_POOL_*` | Operación / tuning | — |

    ## platform/core — opcionales útiles en dev

    | Variable | Default / notas |
    | --- | --- |
    | `JWT_SECRET` | Mismo que auth si validáis tokens compartidos |
    | `DAKINIS_MASTER_API_KEY` | Default código: `dakinis-dev-key` |
    | `DAKINIS_RATE_LIMIT_WINDOW_MS` / `DAKINIS_RATE_LIMIT_MAX_REQUESTS` | Rate limit HTTP |
    | `CORS_ORIGIN` / `FRONTEND_URL` | CORS del core API |

    ### Front del core (Vite), si el SPA llama al IdP y hace exchange

    Definir en el `.env` del front del core (no en `docker/.env.dev` salvo build estático):

    - `VITE_AUTH_BASE_URL` — URL base del IdP tal como la ve el navegador (ej. `http://localhost:4000` o `http://localhost/auth` detrás del gateway).
    - `VITE_DEFAULT_BUSINESS_SLUG` — slug de negocio por defecto para `POST /api/auth/exchange` cuando el flujo no elige tenant en UI.

    ## AkoeNet — además de `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `PORT`

    | Variable | Uso |
    | --- | --- |
    | `FRONTEND_URL`, `CORS_ORIGINS`, `CORS_CREDENTIALS` | CORS |
    | `SCHEDULER_API_BASE_URL` | Integración StreamAutomator / scheduler (URL base del API scheduler) |
    | `TWITCH_CLIENT_ID` | Features Twitch |
    | `TRUST_PROXY` | Tras proxy / gateway |
    | `ADMIN_BOOTSTRAP_*` / `SKIP_ADMIN_BOOTSTRAP` | Migración bootstrap admin |

    ## Front StreamAutomator (no entra en `docker/.env.dev` salvo que empaquetéis el front en Docker)

    Definir en `apps/streamautomator/apps/web/.env` (o `.env.local`):

    - `REACT_APP_BACKEND_URL` — si el navegador usa el gateway: `http://localhost/streamautomator` o API directo `http://localhost:4002` según diseño.
    - `REACT_APP_TWITCH_OAUTH_BASE_URL` — coherente con redirects del backend.
    - Claves **anon** de Supabase para el cliente, si aplica.

    ## Checklist rápido post-pull (SaaS)

    1. `docker/.env.dev` con `JWT_SECRET` fuerte y `BACKEND_URL=http://localhost:4002`.
    2. Primera vez Postgres: init crea `dakinis_auth`, bases `dakinis_stream` y `akoenet`.
    3. Migraciones StreamAutomator: `npm run migrate` en contenedor `streamautomator-api`.
    4. AkoeNet: `docker compose ... run --rm akoenet-backend npm run migrate` (ver `docker/README.md`).
    5. Probar login unificado: `POST http://localhost/auth/login` con el mismo `JWT_SECRET` que StreamAutomator; las peticiones a `/streamautomator/...` con `Authorization: Bearer` deben crear/ enlazar usuario y workspace `default` tras `npm run migrate`.
    6. Fase 2: aplicar migraciones `platform_user_id` en core y AkoeNet; probar `POST /api/auth/exchange` (core) con Bearer del IdP; comprobar que el JWT de producto **reutiliza `sub` del IdP** y que el exchange **no** inventa identidad ni tenants; fijar fechas reales para `JWT_STRICT_ISS_AUD=true` en **staging** y **producción**.
    7. AkoeNet (cuando se integre IdP): revisar **orden** `verifyAkoenetAccessToken → IdP`, fallbacks y claims mínimos para evitar spoofing o aceptación equivocada.

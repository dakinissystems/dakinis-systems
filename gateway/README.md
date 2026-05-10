# Gateway (borde HTTP)

Punto único de entrada del stack local: Nginx delante de **auth**, **core-api**, **streamautomator-api**, **akoenet-backend** y **fitness-platform-api** (`/fitness/`).

| Ruta | Rol |
|------|-----|
| [`nginx.conf`](./nginx.conf) | Config principal (montada en `/etc/nginx/nginx.conf`) |
| [`routes/default.conf`](./routes/default.conf) | Reglas: **`/core/`** y el **resto de** `/streamautomator/` (no cubierto por excepciones) con `auth_request` + `limit_req` + CORS. Lista de **rutas StreamAutomator sin JWT** en el mismo archivo (health, integración, webhooks, OAuth, streamer público, …). **AkoeNet** sin `auth_request` (auth en Node). |
| [`middleware/`](./middleware/) | Apuntes futuros (WAF, snippets); rate limit activo en [`nginx.conf`](./nginx.conf). |

Logs de acceso → **stdout**, errores → **stderr** (adecuado para `docker logs`).

**502** hacia StreamAutomator/AkoeNet vía `:80` suele ser upstream inalcanzable o IP antigua tras recrear solo los servicios de aplicación. Este repo usa **`resolver 127.0.0.11`** y **`proxy_pass` con variables** para que Nginx vuelva a resolver los hostnames Docker en cada petición (tras cambios recarga el gateway: `docker compose up -d --force-recreate gateway` o `docker exec dakinis-gateway nginx -s reload`).

**Rate limiting:** zona `api_limit` (`10r/s`, burst 20); clave **`$sess_or_anon_key`** (huella `sess:` + 48 caracteres del JWT, o `anon:` + IP sin Bearer). Cuenta intentos **antes** de `auth_request` (incluye fallos). No sustituye cuotas por tenant en aplicación.

**CORS:** `Access-Control-*` en `/auth/`, `/core/`, `/streamautomator/` (preflight `OPTIONS`), más `Allow-Credentials` (ver nota abajo).

**AkoeNet:** sin `auth_request` en el borde (Socket.IO + modelo de rutas); auth en el proceso Node.

El servicio `gateway` en [`docker/compose.full.yml`](../docker/compose.full.yml) monta este árbol en el contenedor.

### Imagen Docker (Railway y similares)

- [`Dockerfile`](./Dockerfile) — copia `nginx.conf` y `routes/` a `/etc/nginx/`. Compatible con Railway cuando el **Root directory** del servicio es `gateway/`.
- **`resolver 127.0.0.11`** en [`routes/default.conf`](./routes/default.conf) es el DNS embebido de **Docker Compose**. Si despliegas **solo** el gateway fuera de Compose (Railway standalone), ese resolver no existe → las peticiones con `proxy_pass` por variable pueden fallar al resolver upstreams (`auth`, `core-api`, etc.). Opciones coherentes:
  - apuntar Nginx a hostnames DNS reales (`*.railway.internal`, dominios públicos de cada backend) mediante un override de config o templating (`envsubst`);
  - o usar un resolver alcanzable en esa red (`resolver` público sólo como último recurso; mejor DNS interno del proveedor).
- Los **`set $u_auth` / `$u_core` / …** son nombres de servicio Compose; en Railway deben coincidir con los **hosts** donde expongas auth/core/streamautomator/… (red privada o URLs).
- Contrucción local de la misma imagen: `docker build -t dakinis-gateway ./gateway` (desde la raíz del repo).

**Contratos** (rutas y prefijos): [`../docs/contracts/`](../docs/contracts/). Reglas de cambio: [`../docs/rules.md`](../docs/rules.md).

El subrequest **`/_auth_check`** usa **`proxy_cache`** con clave **`$sess_or_anon_key`** (no el JWT completo). TTL 15s para 200 — alinear con **access tokens cortos**; ver [`docs/rules.md`](../docs/rules.md).

En Compose, `gateway` usa **`tmpfs`** en `/var/cache/nginx/auth` para `proxy_cache`.

**CORS:** `Access-Control-Allow-Credentials` está activado; con `Allow-Origin: *` los navegadores no aplican credenciales — en producción con cookies, usa orígenes explícitos (ver [`docs/rules.md`](../docs/rules.md)).

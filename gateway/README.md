# Gateway (borde HTTP)

Punto único de entrada del stack local: Nginx delante de **auth**, **core-api**, **streamautomator-api** y **akoenet-backend**.

| Ruta | Rol |
|------|-----|
| [`nginx.conf`](./nginx.conf) | Config principal (montada en `/etc/nginx/nginx.conf`) |
| [`routes/`](./routes/) | `location` por prefijo (`/auth/`, `/core/`, …) |
| [`middleware/`](./middleware/) | Placeholder para rate limit, cabeceras, `auth_request`, etc. |

El servicio `gateway` en [`docker/compose.full.yml`](../docker/compose.full.yml) monta este árbol en el contenedor.

**Contratos de rutas públicas** (para no romper integraciones al cambiar servicios): [`../docs/contracts/`](../docs/contracts/).

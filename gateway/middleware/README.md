# Gateway middleware (futuro)

Aquí irán fragmentos reutilizables para el borde HTTP, por ejemplo:

- Zonas `limit_req` / `limit_conn` (rate limiting por IP o por tenant)
- Cabeceras de seguridad comunes
- Comprobaciones previas (validación de JWT en Nginx con `auth_request`, módulos OpenResty, o delegación a un sidecar)

Hoy el enrutado vive en [`../routes/`](../routes/); la configuración principal en [`../nginx.conf`](../nginx.conf).

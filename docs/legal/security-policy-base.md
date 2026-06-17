# Política de seguridad (ecosistema Dakinis)

**Última actualización:** 19 mayo 2026 · **Ámbito:** Dakinis Systems, Dakinis One, AkoeNet, StreamAutomator e infraestructura compartida

## 1. Seguridad técnica

| Área | Práctica |
|------|----------|
| **Transporte** | HTTPS/TLS obligatorio en producción |
| **Contraseñas** | Almacenamiento con hash seguro (bcrypt u equivalente); nunca en texto plano |
| **Control de acceso** | Roles y permisos (usuario, admin de tenant/servidor, platform admin) |
| **Multi-tenant** | Aislamiento por `business_id` / tenant en API y base de datos (Dakinis One) |
| **Backups** | Copias periódicas de PostgreSQL según procedimiento operativo |
| **Monitorización** | Registro estructurado, revisión de incidentes y alertas operativas |
| **Claves API** | Almacenamiento con hash cuando aplica |

## 2. Medidas organizativas

- Acceso a producción limitado al operador
- Rotación de secretos si hay filtración
- Revisión de incidentes documentada

## 3. Vulnerabilidades e incidentes

Reportar vulnerabilidades o incidentes de seguridad:

- **security@dakinis-systems.com**
- **legal@dakinis-systems.com**

Para clientes B2B con contrato marco, aplican plazos de notificación acordados.

## 4. Limitación

Ningún sistema es 100 % seguro. Esta política describe medidas razonables, no una garantía absoluta.

## 5. Productos

Cada producto puede publicar detalles adicionales en su dominio (p. ej. `/legal/seguridad` en AkoeNet, `/security` en Dakinis One).

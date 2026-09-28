# ADR-016 — Organization → Venture → Location

## Contexto

Clientes hospitality (p. ej. **La Calle Brava Group** + marca **Ármala**) necesitan:

1. Una **empresa matriz** (facturación, socios, finanzas).
2. Uno o más **emprendimientos/marcas** (tipo restaurant, ecommerce, …).
3. Uno o más **locales** operativos (donde corre Core / TPV).

Hoy Hub usa `meta.workspaces` ≈ un tenant de facturación, y Core usa `business` ≈ un negocio ERP. Mezclar “empresa” y “local” en el mismo nivel obliga a migrar cuando crezcan.

Dominios de correo (`lacallebravagroup.es`, `armala.es`) y Google Workspace son **identidad digital del cliente**, no de Dakinis (`dakinissystems.com`).

## Decisión

| Capa | Nombre | Persistencia | Ejemplo |
|------|--------|--------------|---------|
| **Organization** | Empresa matriz (billing boundary) | `meta.workspaces` (sin renombrar aún) | La Calle Brava Group |
| **Venture** | Emprendimiento / marca | `meta.ventures` | Ármala |
| **Location** | Local operativo | `meta.venture_locations` → `core_business_slug` / Core `business` | Málaga Centro |
| **Domains** | Dominios + aliases de correo | `meta.organization_domains` | armala.es, hola@… |

Reglas:

- El **tipo de negocio** (`restaurant`, …) vive en el **venture**, no en la organization.
- Core `business` = **location** (unidad operativa). Un venture puede tener N locations / N businesses.
- Socios inician sesión en Hub con cuentas IdP individuales (cuando existan dominios corporativos), no con buzones compartidos.
- Alias funcionales (`hola@`, `pedidos@`) se documentan en `organization_domains` **solo tras verificar/comprar** el dominio; el envío real lo hace Google Workspace (fuera de Dakinis).
- No insertar dominios en seed por defecto: ver runbook §0 (disponibilidad).

## Consecuencias

- Hub gana selector de contexto: Organización → Venture → Location.
- Migración `058` crea tablas; workspaces existentes siguen válidos (0 ventures = UI actual).
- Seed/provision para Calle Brava + Ármala es opcional y no sustituye Copérnico.
- No se mezclan correos `@dakinissystems.com` con los del cliente.

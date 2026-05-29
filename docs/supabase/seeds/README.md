# Seeds Supabase (tenants manuales)

Con `CORE_SEED_DEMO=false` los demos no se insertan al arrancar Core. Los tenants reales se cargan con SQL o script Node.

## Dumpling House

| Campo | Valor |
|-------|--------|
| Slug | `dumpling-house` |
| Login | `admin@dumpling-house.local` / `demo123` |
| QR alérgenos | `/alergenos/dumplinghouseqr2026` |
| Fuente menú | Fotos en `C:\Users\Christian\Downloads\Dumplings` |
| Fuente alérgenos | `ALERGENO DUMPLING HOSUE.pdf` |

### Producción (Supabase SQL Editor)

1. Comprobar prerequisitos: [`00-prereq-check.sql`](./00-prereq-check.sql) — `prod_business` debe ser `dakinis_core_prod.business`, no `NULL`.
2. Si falta, en el **proyecto Supabase de Dakinis Core** (no AkoeNet) que usa Railway (`POSTGRES_SCHEMA=dakinis_core_prod`):
   - [`../schemas/00-bootstrap-schemas.sql`](../schemas/00-bootstrap-schemas.sql)
   - [`../schemas/02-dakinis-core-prod.sql`](../schemas/02-dakinis-core-prod.sql) (Run completo, sin seleccionar solo una línea)
3. Ejecutar [`04-tenant-dumpling-house.sql`](./04-tenant-dumpling-house.sql).

**Ya existe el tenant y solo cambian hongos/alérgenos:** ejecutar **por separado** (evita aviso de Supabase por `;` en el JSON):
1. [`05a-dumpling-house-config-update.sql`](./05a-dumpling-house-config-update.sql)
2. [`05b-dumpling-house-allergies-update.sql`](./05b-dumpling-house-allergies-update.sql)

Índice: [`05-dumpling-house-mushrooms-update.sql`](./05-dumpling-house-mushrooms-update.sql) (solo instrucciones, no Run).

### Alternativa (Node + pooler)

```bash
cd platform/core/api
set DB_DRIVER=postgres
set POSTGRES_SCHEMA=dakinis_core_prod
set DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
node scripts/seed-dumpling-house.mjs
```

### Regenerar SQL tras editar datos

```bash
cd platform/core/api
node scripts/gen-dumpling-sql-json.mjs
node scripts/gen-dumpling-sql.mjs
```

Datos editables: [`dumpling-house-data.js`](./dumpling-house-data.js).

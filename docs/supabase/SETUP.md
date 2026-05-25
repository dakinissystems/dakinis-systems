# Supabase + Railway — configuración real

**Arquitectura:** Railway (compute) + **Supabase PostgreSQL** (datos) + Railway Redis (eventos/cache).

No uses el plugin Postgres de Railway como base principal si ya tienes Supabase.

---

## 1. Obtener connection string (pooler)

Supabase → **Project Settings** → **Database** → **Connection string** → **URI** → modo **Transaction** (puerto **6543**).

Ejemplo:

```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Opcional (recomendado para `pg`):

```
?pgbouncer=true
```

**No uses** Supabase Auth ni tablas `auth.users` de Supabase — solo PostgreSQL. Tu IdP es `dakinis-auth`.

---

## 2. Ejecutar schemas (orden)

En **SQL Editor** de Supabase, ejecuta en orden:

| # | Archivo |
|---|---------|
| 1 | [`schemas/00-bootstrap-schemas.sql`](./schemas/00-bootstrap-schemas.sql) |
| 2 | [`schemas/01-dakinis-auth.sql`](./schemas/01-dakinis-auth.sql) |
| 3 | [`schemas/02-dakinis-core-prod.sql`](./schemas/02-dakinis-core-prod.sql) |

Staging: copia `02-dakinis-core-prod.sql` cambiando `dakinis_core_prod` → `dakinis_core_dev` y ejecuta.

---

## 3. Variables Railway — proyecto `dakinis-platform`

### Servicio **Core Back** (`dakinis-core-api`)

```env
NODE_ENV=production
PORT=4001
DB_DRIVER=postgres
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DATABASE_SSL=true
POSTGRES_SCHEMA=dakinis_core_prod
CORE_SEED_DEMO=false
JWT_SECRET=<mismo que dakinis-auth>
CORS_ORIGIN=https://core.dakinissystems.com
REDIS_URL=${{Redis.REDIS_URL}}
DAKINIS_EVENT_BUS=redis
TRUST_PROXY=true
```

### Servicio **dakinis-auth**

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<misma URI Supabase pooler 6543>
DATABASE_SSL=true
AUTH_SCHEMA=dakinis_auth
JWT_SECRET=<secreto largo>
JWT_ACCESS_TTL=15m
JWT_REFRESH_DAYS=30
JWT_LEGACY_LONG_TTL=false
REDIS_URL=${{Redis.REDIS_URL}}
CORS_ORIGINS=https://core.dakinissystems.com,https://akoenet.dakinissystems.com,https://streamautomator.com,https://www.streamautomator.com
AUTH_ISSUER=https://auth.dakinissystems.com
```

### Servicio **Redis** (ya en Railway)

Referencia `${{Redis.REDIS_URL}}` en Core y Auth.

### **dakinis-gateway**

Upstream interno a servicios Railway (no expongas Core directo a largo plazo).

---

## 4. Verificación

```bash
curl https://core.dakinissystems.com/api/health
```

Esperado:

```json
{
  "data": {
    "status": "up",
    "db": "postgres",
    "postgresSchema": "dakinis_core_prod",
    "databaseHost": "pooler.supabase.com"
  }
}
```

Logs Core Back al arrancar:

```
[db] PostgreSQL connected schema=dakinis_core_prod pooler=true
```

---

## 5. Backups

- Supabase: snapshots + PITR (según plan).
- Además: GitHub secret `BACKUP_DATABASE_URL` = **misma URI** (preferir conexión directa 5432 para `pg_dump` si Supabase lo permite en Database → Connection string → Direct).

---

## 6. AkoeNet (proyecto separado Railway)

AkoeNet suele tener **su propio** Supabase/proyecto. No mezcles tablas `public.Users` con Core.

Variables Client:

```env
VITE_DAKINIS_AUTH_URL=https://auth.dakinissystems.com/auth
```

(o URL del gateway: `https://api.dakinissystems.com/auth` cuando esté configurado)

---

## Mapa schemas

| Lógico | Schema físico | Servicio |
|--------|---------------|----------|
| auth | `dakinis_auth` | dakinis-auth |
| core prod | `dakinis_core_prod` | Core Back |
| core dev | `dakinis_core_dev` | staging |
| docker local | `dakinis_core` | compose |

---

Ver paso a paso Railway: [`../RAILWAY-PRODUCTION.md`](../RAILWAY-PRODUCTION.md)

# Migrar AkoeNet → dakinis-platform (Supabase)

Guía para mover **datos y esquema** del proyecto Supabase **AkoeNet** al proyecto **dakinis-platform**, y dejar de pagar el proyecto independiente.

## Resumen

| Origen | Destino |
|--------|---------|
| Supabase **AkoeNet** (`public.users`, `servers`, `messages`…) | Supabase **dakinis-platform** |
| Esquema `public` solo AkoeNet | Esquema `akoenet.*` + `dakinis_auth.users` |

**No copies** el dump entero sobre `public` en dakinis-platform: ahí viven también StreamAutomator (`"Users"`, `"Contents"`…). Usamos staging `legacy_akoenet`.

## Requisitos

- [PostgreSQL client](https://www.postgresql.org/download/) (`psql`, `pg_dump`) en PATH
- Connection strings **directos** (puerto `5432`, no pooler) para `pg_dump`/`COPY`
- En dakinis-platform: migraciones `000`–`006` ya aplicadas (`akoenet` schema existe)
- Backup del proyecto AkoeNet antes de borrarlo

## Paso 1 — Variables

```powershell
# Origen: Supabase AkoeNet → Settings → Database → URI (Session mode, 5432)
$env:AKOENET_DATABASE_URL = "postgresql://postgres.[ref]:[pass]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Destino: Supabase dakinis-platform (misma región eu-west-1 recomendada)
$env:PLATFORM_DATABASE_URL = "postgresql://postgres.[ref]:[pass]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

> Usa la contraseña de **Database password**, no la anon key.

## Paso 2 — Staging en destino

En el SQL Editor de **dakinis-platform**, **New query** (no Snippets guardados), pega y ejecuta en orden:

1. `docs/supabase/scripts/legacy_akoenet_staging.sql`

### Mismo proyecto Supabase (origen = destino)

Si `AKOENET_DATABASE_URL` y `PLATFORM_DATABASE_URL` tienen el **mismo** `postgres.[ref]` (ej. `omdosutakaefpowscagp`), los datos ya están en `public.users`, `public.servers`… No uses `pg_dump` entre URLs.

2. `docs/supabase/scripts/copy_public_akoenet_to_staging.sql`

### Proyectos Supabase distintos

Usa el script PowerShell (Paso 3) con **origen** = AkoeNet y **destino** = dakinis-platform.

> **Puerto:** migraciones DDL/COPY siempre con **`:5432`** (session). **No** uses `:6543?pgbouncer=true` (solo apps en runtime).

Crea el schema `legacy_akoenet` con la misma forma que AkoeNet standalone.

## Paso 3 — Exportar datos desde AkoeNet

```powershell
cd d:\dakinis-systems
.\scripts\migrate-akoenet-to-platform.ps1 `
  -SourceDatabaseUrl $env:AKOENET_DATABASE_URL `
  -DestDatabaseUrl $env:PLATFORM_DATABASE_URL
```

El script:

1. Comprueba `psql` / `pg_dump`
2. Ejecuta staging en destino (si `-SkipStaging` no está)
3. Por cada tabla AkoeNet, hace `pg_dump --data-only` y reescribe `public.` → `legacy_akoenet.`
4. Muestra conteos en staging

**Tablas exportadas:** users, servers, members, roles, channels, messages, DMs, reacciones, invites, emojis, social, legal, etc.  
**No se exportan:** `pgmigrations`, `refresh_tokens` (los usuarios vuelven a iniciar sesión vía SSO).

## Paso 4 — Backfill a esquema unificado

En SQL Editor de **dakinis-platform**, en orden:

| # | Archivo | Qué hace |
|---|---------|----------|
| 14a | `014a_auth_nullable_password.sql` | Solo si 014 falla |
| 14 | `014_backfill_legacy_map.sql` | Usuarios Stream (si aplica) |
| **15b** | **`015b_backfill_akoenet_data.sql`** | **legacy_akoenet → akoenet.*** |

Al final verás filas de verificación (users, servers, messages…).

## Paso 5 — Cutover backend AkoeNet

1. Railway **akoenet-backend** → `DATABASE_URL` = URI de **dakinis-platform** (pooler `:6543` para app)
2. Añadir `search_path=akoenet,dakinis_auth,public` o actualizar ORM a tablas `akoenet.*`
3. Redeploy y probar login + mensajes + servidores
4. `.\scripts\smoke-hub-sso-products.ps1 -Product akoenet`

## Paso 6 — Apagar AkoeNet

Solo cuando:

- [ ] Conteos origen ≈ destino (`legacy_akoenet` vs `akoenet.*`)
- [ ] App prod funciona 24–48 h
- [ ] Backup `.sql` guardado en lugar seguro

Entonces pausa o elimina el proyecto Supabase **AkoeNet**.

## Conflictos de email

Si un usuario existe en StreamAutomator y AkoeNet con el mismo email, `014` hace `ON CONFLICT (email) DO NOTHING` en `dakinis_auth.users`. El perfil AkoeNet se enlaza al usuario ya existente por email.

## Archivos relacionados

| Archivo | Rol |
|---------|-----|
| `docs/supabase/migrations/006_akoenet.sql` | DDL destino |
| `docs/supabase/migrations/015b_backfill_akoenet_data.sql` | Migración datos |
| `docs/supabase/scripts/legacy_akoenet_staging.sql` | Tablas staging |
| `scripts/migrate-akoenet-to-platform.ps1` | Export automático |
| `docs/supabase/migrations/RUN-ORDER.md` | Orden global |

## Rollback

- Staging: `DROP SCHEMA legacy_akoenet CASCADE;`
- Datos migrados: truncar `akoenet.*` (cuidado en prod) y re-ejecutar 015b
- No toca `stream.*` ni `"Users"` de StreamAutomator

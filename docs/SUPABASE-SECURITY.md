# Supabase — alertas de seguridad (dakinis-platform)

Correo del **17 May 2026**: `rls_disabled_in_public` y `sensitive_columns_exposed` en el proyecto **dakinis-platform** (`omdosutakaefpowscagp`).

## Qué significa

Con la **anon key** (o sin RLS), cualquiera que tenga la URL del proyecto puede usar la REST API de Supabase para **leer, insertar, modificar y borrar** filas en tablas expuestas. Si hay columnas como `password_hash`, quedan en riesgo crítico.

## Arquitectura Dakinis (correcta)

| Componente | Clave Supabase | Acceso DB |
|------------|----------------|-----------|
| Frontend (React, etc.) | **No** usar `service_role` | Llama a **tu API** (Railway), no a PostgREST directo |
| Backend (Node auth, core, AkoeNet) | `SUPABASE_SECRET_KEY` / **service_role** | Bypass RLS; solo en servidor |
| Navegador / app móvil | Como mucho **anon** + RLS estricto | Solo si usas Supabase Auth en cliente |

Si hoy el front **no** usa `supabase-js` contra tablas de negocio, la solución más segura es: **RLS activado + sin políticas para `anon`/`authenticated` + revocar GRANTs**.

## Pasos en el dashboard (orden recomendado)

1. **SQL Editor** → ejecuta [`docs/supabase/001-audit-rls-and-exposure.sql`](supabase/001-audit-rls-and-exposure.sql) y guarda el resultado.
2. Ejecuta [`docs/supabase/002-enable-rls-lockdown.sql`](supabase/002-enable-rls-lockdown.sql).
3. **Project Settings → API → Exposed schemas**: deja solo lo necesario (`public` y, si aplica, `dakinis_auth`). Quita esquemas que no deban ser públicos.
4. **Advisors → Security** → confirma que desaparecen los avisos (puede tardar unas horas).
5. **Settings → API → Rotate keys** si la anon key pudo filtrarse (repos, logs, front build).
6. Revisa que en GitHub/Railway **no** esté commiteada la `service_role` / `SUPABASE_SECRET_KEY`.

## Comprobar que el backend sigue funcionando

Tras el lockdown, prueba login y operaciones que usen Postgres vía **service_role**:

- `platform/auth` (usuarios en `dakinis_auth.users`)
- Cualquier servicio con `SUPABASE_SECRET_KEY` en Railway

Si algo falla con error de permisos en PostgREST, la app está usando **anon** donde debería usar **service_role** en servidor.

## Si necesitas acceso desde el cliente (futuro)

1. Tabla **sin** `password_hash` (perfiles en `public.profiles`, credenciales solo en servidor).
2. RLS con `auth.uid()` para `SELECT`/`UPDATE` propios.
3. Nunca políticas `USING (true)` en tablas con datos de todos los tenants.

## Referencias

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Hardening the Data API](https://supabase.com/docs/guides/database/hardening-data-api)

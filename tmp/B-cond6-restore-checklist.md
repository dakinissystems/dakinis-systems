# Condición 6 — Restore backup

**Estado:** 🟢 PASS (dump local) · 2026-11-27  
**Script:** `scripts/restore-postgres-test.ps1` (Windows: gzip vía .NET; `docker rm` tolerante)

## Ficha

| Campo | Valor |
|-------|-------|
| Fecha | 2026-11-27 |
| Origen backup | `backups/postgres/dakinis-restore-test-2026-07-22T21-36-57.sql.gz` |
| Destino | contenedor efímero `postgres:15` (`dakinis-postgres-restore-test`) |
| Tiempo restore | ~39 s |
| Migraciones tras restore | n/a (dump completo) |
| Smoke post-restore | `\dn` → 21 schemas (`billing`, `hub`, `core`, `dakinis_auth`, …) |
| Incidencias | Known: `supabase_vault`, `vector` / `extensions.vector` no disponibles en imagen vanilla; `transaction_timeout` unrecognized. Schemas comerciales OK. |
| Claves usadas | solo Docker local |

## No hacer

- Restore sobre producción  
- Copiar `DATABASE_URL` de prod a un dump y apuntar servicios prod  

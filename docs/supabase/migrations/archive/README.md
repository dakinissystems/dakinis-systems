# Archive — migraciones históricas

Cuando el número de migración lineal llegue a **050**, mover aquí los scripts ya aplicados en **todos** los entornos (prod + staging):

```
archive/
├── 000-020/     ← bootstrap + backfill inicial
└── README.md
```

**Reglas:**

1. Nunca borrar del archive — es historial auditable.
2. `migrations/RUN-ORDER.md` solo lista scripts **activos** (>020).
3. Nuevos entornos: ejecutar archive en orden + migraciones activas, o un `bootstrap-full.sql` generado.

**Estado actual:** 000–015 siguen en `migrations/` (prod Supabase ya ejecutó 000–015).

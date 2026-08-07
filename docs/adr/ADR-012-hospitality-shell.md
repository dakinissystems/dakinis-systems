# ADR-012 — Hospitality Shell separado del dominio

## Contexto

El vertical de hostelería mezclaba navegación operativa (dock, header, pulse, deep-links) con módulos de negocio (Sala, Cocina, Delivery…). Eso impedía reutilizar el mismo “escritorio operativo” en retail, clínica u otros verticales, y acoplaba nombres `Restaurant*` al producto.

## Decisión

Separar **HospitalityShell** (infraestructura de UI operativa) de los **módulos de dominio**:

```
HospitalityShell
  → Task Dock · Header · Pulse · Deep Links · Command Palette
  → Modules (Delivery · Inventory · Kitchen · Cash · Config)
```

- Navegación por **tareas**, no por roles visuales.
- Migración gradual `Restaurant*` → `Hospitality*`, dejando aliases de compatibilidad.
- Command Palette se trata como infraestructura de **Core Platform**, no feature aislada de restaurante.

## Consecuencias

- El Shell puede montar otros módulos (Appointments, Billing clínico, Inventory retail) sin reescribir el dock.
- Docs de dominio UX: [`domains/hospitality/ux.md`](../domains/hospitality/ux.md).
- Rename completo de componentes es trabajo incremental; no bloquea el ADR.

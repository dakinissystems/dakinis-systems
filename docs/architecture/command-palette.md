# Command Palette — infraestructura de plataforma

> Ctrl+K como superficie transversal · ago 2026  
> No es “una mejora UX de restaurante”.

---

## Posición en la plataforma

```
Core Platform
  └── Command Palette
        ├── Hospitality (mesas, delivery, caja, lotes…)
        ├── CRM (contactos, empresas)
        ├── Inventory / Settings
        └── futuros verticales
```

Cada capacidad nueva debe preguntarse: **¿también en Ctrl+K?**

---

## Hospitality (hoy)

- Código: `hospitalityCommandPalette.js` + `DakinisCommandPaletteProvider`
- Comandos de navegación por tarea + hits sintéticos
- Pendiente alta: hits con datos reales (producto / stock / factura API)

---

## Métricas UX (objetivos)

| Acción | Objetivo |
|--------|----------|
| Abrir mesa | &lt; 2 s |
| Cobrar | &lt; 15 s |
| Escaneo | &lt; 1 s |
| Cerrar caja | &lt; 30 s |

La telemetría UX mide si un cambio mejora o empeora estas cifras — independiente de la telemetría técnica de Connectors.

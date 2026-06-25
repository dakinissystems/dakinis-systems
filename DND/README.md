# D&D 5e — Gestor de Personajes

Aplicación web para manejar personajes de **Dungeons & Dragons 5ª edición**, basada en la estructura de `DnDHojaPersonaje.xlsx`.

## Características

- **Ficha completa**: atributos, clase, raza, rasgos y dotes (fórmulas 5e del Excel)
- **Armas**: plantillas SRD + armas personalizadas de campaña (ej. Rencorosa, Cegadora)
- **Hechizos**: lista SRD, preparación con límite por CAR/INT/SAB, hechizos custom
- **Inventario**: objetos por categoría (herrería, magia, curación, etc.)
- **Combate**: PV, slots, Lay on Hands, acciones especiales
- **Combos inteligentes**: sugerencias tácticas según tus decisiones (clase, armas activas, hechizos, dotes, inventario)

## Arranque

```powershell
cd DND
npm install
npm run dev
```

Abre la URL en el móvil (misma red) o en el navegador. La UI está optimizada para **pantallas ≤480px**: navegación inferior, asistente de creación y áreas táctiles de 48px.

### Flujo móvil

1. **Mis personajes** — lista con tarjetas; botón flotante **+** para crear
2. **Asistente** (5 pasos) — Nombre → Raza → Clase → Atributos → Resumen
3. **Ficha** — navegación inferior: Ficha · Combate · Magia · Arsenal · Más

En **Más** están Inventario, Combos, Compendio y editar raza/clase.

## Base de datos SRD 5e

Datos en `src/data/srd/`:

| Archivo | Contenido |
|---------|-----------|
| `races.ts` | 9 razas PHB/SRD con subrazas |
| `classes.ts` | 12 clases con subclases, dado de golpe y conjuros |
| `spells.ts` | Catálogo unificado (~280+ hechizos) |
| `spells-srd-extra.ts` | Mago/clérigo SRD ampliado |
| `spells-xge.ts` | Xanathar's Guide to Everything |
| `spells-tce.ts` | Tasha's Cauldron of Everything |

Subclases XGE/TCE añadidas en `classes.ts` (Gloria, Vigilantes, Paz, Crepúsculo, Genio, Escribas, etc.).

Pestaña **Compendio SRD** para consultar todo. Filtros por fuente (SRD / XGE / TCE), clase y nivel.


| Hoja | Uso en la app |
|------|----------------|
| `datos_basicos` | Ficha, inventario, dotes sugeridas |
| `acciones_en_combate` | Panel Combate |
| `spells_list` | Panel Hechizos |
| `status` | Recursos y equipamiento activo |
| `Hoja1` | Fórmulas 5e en `src/engine/formulas.ts` |

## Motor de combos

Las reglas en `src/engine/combo-suggester.ts` evalúan el estado del personaje y proponen secuencias de turno (ej. Vow of Enmity + Extra Attack, Bless + múltiples ataques, armas custom con Atlatl).

Los datos se guardan en `localStorage` del navegador.

## Legal

Privacidad, términos, aviso legal y atribución OGL/SRD desde la lista de personajes o menú **Más → Legal**. Sin servidor: no hay cookies de terceros.

## Build producción

```powershell
npm run build
npm run preview
```

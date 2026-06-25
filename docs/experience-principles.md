# Dakinis Experience — principios de producto

> Guía para diseñar e implementar cualquier app del ecosistema.  
> Complementa tokens (`packages/shared-brand`) y patrones (`packages/shared-ux`).

---

## 1. Principios

| Principio | Significa | Ejemplo |
|-----------|-----------|---------|
| **Rápido** | Respuesta inmediata o feedback de carga claro | Skeleton en &lt;100 ms; acciones optimistas |
| **Claro** | Una idea por pantalla; jerarquía visual obvia | Título → valor → acción |
| **Positivo** | Refuerza progreso, no culpa | «Has ahorrado 120 € este mes» vs «Gastaste de más» |
| **Proactivo** | Anticipa necesidades | Hint IA: «Este cliente lleva 60 días sin comprar» |
| **Humano** | Lenguaje conversacional, no técnico | Ver reglas de copy abajo |
| **Sin sobrecargar** | Modo Focus, progressive disclosure | TPV Core: solo pedidos |

---

## 2. Copy emocional

### Nunca → Siempre

| ❌ Evitar | ✅ Preferir |
|-----------|-------------|
| Error | No hemos podido completar esta acción. [Reintentar] |
| No hay datos | Empieza subiendo tu primera nómina. [Subir nómina] |
| Meta completada | 🎉 Has conseguido ahorrar 1.000 € — estás un 14 % más cerca de tu objetivo |
| Pedido enviado | Pedido enviado. Tiempo medio de preparación reducido un 18 % |
| Sin resultados | Prueba otros filtros o [restablecer búsqueda] |
| 401 / 403 | Tu sesión ha expirado. [Iniciar sesión de nuevo] |

### Tono por producto

- **Core:** profesional, operativo, accionable («Revisar 3 SKU bajo mínimo»).
- **LifeFlow:** cercano, motivador, sin jerga financiera agresiva.
- **Hub:** resumen ejecutivo del día («Buenos días, Christian»).
- **IA:** siempre morado `#7C3AED`; primera persona plural suave («Podemos revisar el stock juntos»).

---

## 3. Estados vacíos

Cada vacío debe incluir: **ilustración** + **título positivo** + **hint** + **CTA primario** + **CTA secundario opcional**.

Ver catálogo: `packages/shared-ux/src/empty-states.js`.

---

## 4. Hub Navigation Language

En **todas** las apps (aunque el resto de la nav cambie):

| Slot | Icono (Lucide) | Atajo |
|------|----------------|-------|
| Inicio | `home` | — |
| Buscar | `search` | `Ctrl+K` |
| Notificaciones | `bell` | — |
| Perfil | `user` | — |
| Ayuda | `help-circle` | — |

Implementación: `packages/shared-ux/src/hub-nav.js`.

---

## 5. Búsqueda global y Command Palette

**Atajo universal:** `Ctrl+K` (Mac: `Cmd+K`).

Capas:

1. **Buscar** — clientes, documentos, chats, configuración.
2. **Comandos** — crear cliente, abrir LifeFlow, preguntar IA, cambiar producto.
3. **IA** — última acción: «Preguntar a Dakinis AI».

Definiciones: `packages/shared-ux/src/command-palette.js`.

---

## 6. Dashboard cards

Toda tarjeta Hub/producto incluye (cuando aplique):

- Título · Valor · Icono · Sparkline · Estado · Acción · Hint IA · Hover · Loading · Error

Componente: `packages/shared-ux/src/DashboardCard.jsx`.

---

## 7. IA contextual (sin preguntar)

Patrones **Hint AI** — banner inline morado, no modal:

- CRM: «Este cliente lleva 60 días sin comprar. [Enviar promoción]»
- LifeFlow: «Has reducido gastos un 12 %. Buen trabajo.»
- Inventario: «3 lotes caducan esta semana. [Ver inventario]»

Helpers: `packages/shared-ux/src/contextual-ai.js`.

---

## 8. Modo Focus

| Producto | Focus mode | Oculta |
|----------|------------|--------|
| LifeFlow | Objetivo + Coach + Progreso | Nav secundaria |
| Core TPV | Solo pedidos | Sidebar, marketing |
| Stream | Stream mode | Ya existe |

---

## 9. Accesibilidad mínima

- Contraste WCAG AA en texto principal.
- `prefers-reduced-motion`: desactivar scale/hover animado.
- Focus ring visible (`--dakinis-focus-ring`).
- Atajos documentados en Ayuda.

Auditoría CI: `packages/design-audit`.

---

## 10. Referencias

- Tokens: [`packages/shared-brand`](../packages/shared-brand/)
- Patrones UX: [`packages/shared-ux`](../packages/shared-ux/)
- Skeletons: [`packages/shared-loading`](../packages/shared-loading/)
- Iconos: [`packages/shared-icons`](../packages/shared-icons/) — **Lucide** única librería
- Ilustraciones: [`packages/shared-illustrations`](../packages/shared-illustrations/)
- Knowledge Hub: [`docs/knowledge/README.md`](./knowledge/README.md)

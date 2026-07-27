# Dakinis — Roadmap 2026

> Actualizado **27 jul 2026 · 04:58** · **Estado hoy** → [`STATUS.md`](./STATUS.md) · **Negocio** → [`company/STRATEGY.md`](./company/STRATEGY.md)

**Pregunta guía (corto plazo):** *¿Qué necesita un cliente para pagar por Dakinis este mes?*  
**Dirección de producto:** *sistema operativo del negocio* (orquestación + agentes), **no** otro CRM/ERP genérico saturado.

---

## Cerca (validación comercial)

| Mes | Objetivo clave |
|-----|----------------|
| **Jul** | Billing E2E · SSO E2E · **primer piloto** Hub+Core |
| **Ago** | Hub como escritorio · screenshot real en landing · **primer cliente de pago** |
| **Sep** | Workspace Admin validado · LifeFlow → PostgreSQL · AkoeNet `@AI` prod |
| **Q4** | Automatizaciones Hub · hire Full Stack · Marketplace **solo si clientes lo piden** |

**Riesgo principal:** más features antes de validación comercial.

**No iniciar (hasta validar pago):** Marketplace público · nuevos servicios Railway vacíos · features sin cliente.

Migraciones Supabase y métricas técnicas → [`STATUS.md`](./STATUS.md) / Issues — no aquí.

---

## Regla de ownership (Hub vs apps)

> **El Hub administra el ecosistema. Cada app administra su negocio.**

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| **Hub** | Todo lo cross-app | Usuario, perfil, 2FA, sesiones, API keys, org/miembros/roles, facturación, créditos IA, launcher, notificaciones, buscador global, Copilot global, marketplace, automatizaciones **entre** productos |
| **Core** | Operación del negocio | CRM, inventario, restaurante, agenda, compras, ventas, caja, empleados, reportes |
| **AkoeNet** | Comunidad | Canales, roles, bots, moderación, gamificación, eventos |
| **StreamAutomator** | Contenido | Redes, publicaciones, horarios, analytics, automatizaciones de contenido |
| **LifeFlow** | Finanzas personales | Cuentas, presupuestos, patrimonio, metas, inversiones, **suscripciones** |

**Nunca duplicar en apps lo que vive en Hub:** email/password, suscripción del ecosistema, invite a la org, compra de módulos.

**UX objetivo (tipo M365 / Workspace):** misma sensación de ecosistema; barra común futura (búsqueda global, Copilot, notificaciones, pendientes, actividad, Ctrl+K) aunque el usuario esté dentro de Core/AkoeNet/SA/LifeFlow.

Ejemplo de automatización **Hub** (no Core): compra en Core → canal en AkoeNet → anuncio en StreamAutomator.

---

## Tesis de producto

No competir con otro CRM/ERP/tareas genérico. Priorizar **módulos verticales + IA** sobre la plataforma (Core + Hub + AkoeNet + SA), orientados a pymes y flujos concretos.

**Diferenciador a largo plazo — Digital Twin del negocio:** gemelo que conoce empleados, ventas, caja, clientes, stock, reservas y productividad; responde *“¿cómo estará el negocio en 90 días?”* o *“¿qué pasa si duplico marketing?”* (operación + simulación + IA integrada).

---

## Prioridad de módulos (post-pago)

Orden recomendado cuando el piloto esté validado:

| # | Módulo | Dónde | Idea |
|---|--------|-------|------|
| 1 | **Business Copilot** | Hub (global) + Core (acciones) | Empleado virtual operativo: APIs, presupuestos, pedidos, citas, WhatsApp, incidencias, informes — no un chatbot |
| 2 | **Automatizaciones nativas** | Hub (cross-app) + Core | “Si X → Y → WhatsApp → CRM → factura” sin depender de Zapier |
| 3 | **Inspector IA** | Core | Anomalías continuas (inventario, reservas, caja, pedidos): *“imposible 120 cafés con 2 kg”* |
| 4 | **Digital Twin** | Core (+ LifeFlow datos) | Simulación y proyección del negocio |
| 5 | **Marketplace** | Hub | Módulos, plantillas, automatizaciones, dashboards, integraciones (App Store Dakinis) — **gate: demanda real** |
| 6 | **Dakinis University** | Hub / add-on | Academia por empresa: procesos, exámenes, certificados con IA |
| 7 | **Reputación online** | Core (vertical local) | Google / TripAdvisor / redes / Booking: negativos, caídas, VIP, respuestas asistidas |

### Backlog (visión, sin fecha)

| Idea | Notas |
|------|--------|
| **Dakinis OS / centro de mando** | Estado del negocio “como videojuego”; IA detecta, sugiere y automatiza (*ventas −18% los martes 15–17 → promo*) |
| **Simulador financiero** | Escenarios: contratar, subir precios 8%, cerrar lunes |
| **Manual inteligente** | Docs vivos + Q&A interno (*¿cómo cierro caja?*) |
| **Fidelización gamificada** | Misiones, logros, niveles (restaurantes, gyms, comercios) — sinergia AkoeNet |

---

## LifeFlow — Suscripciones (SaaS / herramientas)

Objetivo: gastos reales (Cursor, Railway, Cloudflare, OpenAI, etc.) sin pedir todo a mano. Reutilizable luego en **Hub** para suscripciones SaaS de la empresa.

| Fase | Qué | Esfuerzo |
|------|-----|----------|
| **1** | CRUD manual (`subscriptions` + `subscription_payments`): coste mes/año, próximas renovaciones — **hecho** (UI `/finanzas/suscripciones`) | ✅ |
| **2** | Catálogo `providers` (logo/web/categoría/ciclo) — **hecho** (`FINANZAS_SUBSCRIPTION_PROVIDERS` + picker) | ✅ |
| **3** | Recordatorios (30 / 7 / 1 día) → notificaciones in-app — **hecho** (cron horario + `POST /reminders/run`) | ✅ |
| **4** | Import Gmail OAuth (facturas / receipts) — **hecho** (`/api/gmail/*` + mock sin credenciales + UI aceptar propuestas) | ✅ |
| **5** | Open Banking: cargos recurrentes → “¿añadir suscripción?” | regulatorio |
| **6** | APIs oficiales solo donde aporten (Cloudflare, GitHub, Stripe, cloud…) | selectivo |
| **7** | IA: patrones, duplicados, infrautilización, ahorro sugerido | encima de datos |

**Orden de build:** manual → catálogo → recordatorios → Gmail → Open Banking → APIs puntuales. No 20 integraciones el día 1.

---

*Revisar semanalmente con [`STATUS.md`](./STATUS.md). Lo de arriba es dirección; el near-term manda hasta el primer pago.*

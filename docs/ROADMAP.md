# Dakinis — Roadmap 2026

> Julio 2026 · **Estado hoy** → [`STATUS.md`](./STATUS.md) · **Negocio** → [`company/STRATEGY.md`](./company/STRATEGY.md)  
> Narrativa / pitch (TEMP) → [`DAKINIS-SISTEMA-ACTUAL-TEMP.md`](./DAKINIS-SISTEMA-ACTUAL-TEMP.md)

**Pregunta guía:** *¿Qué necesita un cliente para pagar por Dakinis este mes?*

**Definición corta (canónica de mensaje):**  
*Dakinis es una plataforma operativa modular para empresas y profesionales.* El “ecosistema” es cómo viven los productos encima; “sistema operativo” es solo analogía.

**Propuesta de valor (una línea):**  
*No reemplaza una aplicación concreta. Reemplaza la necesidad de gestionar muchas aplicaciones desconectadas.*

---

## Calendario

| Mes | Objetivo clave |
|-----|----------------|
| **Jul** | Billing E2E · SSO E2E · **primer piloto** Hub+Core · landing Hub-first + screenshot ✅ |
| **Ago** | Demo Copérnico · **primer cliente de pago** · Hub como escritorio (refinar) |
| **Sep** | Workspace Admin · **LifeFlow → PostgreSQL** · AkoeNet `@AI` prod · contratos de integración (inicio) |
| **Q4** | Event bus / sync profunda · automatizaciones Hub · hire Full Stack · Marketplace **solo si clientes lo piden** |

**Riesgo principal:** más features antes de validación comercial.  
**No iniciar (hasta validar pago):** Marketplace · Railway vacíos · features sin cliente.

---

## Opinión: documento TEMP de explicación (28 jul)

El TEMP [`DAKINIS-SISTEMA-ACTUAL-TEMP.md`](./DAKINIS-SISTEMA-ACTUAL-TEMP.md) es una **evolución clara**: de “colección de apps” a **plataforma + productos**. Notas internas/onboarding ~9.5–9.8; comercial ~8.5 (falta más dolor/resultado y Hub como héroe).

**Mantener:** problema primero · 3 audiencias · analogía del teléfono · Core ≠ plataforma · honestidad (0 pagos, sync parcial) · eslogan ecosistema.

**Mejorar antes de canónico:**
1. Separar **doc comercial** vs **Architecture Guide** vs TEMP interno.
2. Definición única: *plataforma operativa modular* (ecosistema = cómo se conecta; SO = metáfora).
3. Sección **¿Qué gana el cliente?** arriba (menos herramientas, menos errores, un acceso, más automatización).
4. **Hub** en primera línea de valor comercial (“escritorio; el resto son apps”).
5. IA como **capacidad de plataforma**, no como producto tardío.
6. Casos con **antes/después** (+ cifras ilustrativas).
7. Pitch 60s listo para copiar (empresario + técnico).
8. Diagrama oficial Platform → productos → audiencias (web/README/deck).

**Orden de acción (mensaje):**  
comercial corto → landing/pitch con Hub + resultados + honestidad → TEMP como fuente interna.

---

## Prioridad comercial (desbloquea dinero)

| # | Ítem | Por qué | Estado |
|---|------|---------|--------|
| 1 | Invite + demo **Copérnico** | Valida Hub+Core con usuario real | Bridge prod · falta ops invite/demo |
| 2 | **Billing E2E live** (Stripe) | Primer cobro de plataforma | Código listo · falta pago real |
| 3 | Screenshot Hub + widgets ≥2 productos | Credibilidad visual en landing | ✅ prod 28 jul (`hub.png`) |
| 4 | Landing / pitch Hub-first | Mensaje escritorio + resultados | ✅ prod 28 jul |

---

## Prioridad técnica (impacto real)

Orden realista tras (o en paralelo a) piloto/pago:

| Prioridad | Qué | Por qué |
|-----------|-----|---------|
| **Alta** | LifeFlow (+ Tabletop si vive) → **Postgres/Supabase** | Deuda de datos; backups; multi-tenant; futuro cruzado/pgvector |
| **Alta** | Billing E2E + modelo org ↔ suscripción ↔ productos | Desbloquea negocio; Billing = servicio de plataforma |
| **Alta** | **Contratos / eventos** de integración (`organization.*`, `member.*`, `subscription.*`…) | Pasa de SSO+links a ecosistema de datos |
| **Media** | TS estricto en **packages compartidos** (auth client, API types, widgets) | Menos fricción entre repos |
| **Media** | Hub: **sistema de widgets** registrables por producto + cache Redis | Hub como desktop de verdad |
| **Media** | MFA perfil + permisos org consistentes + scopes Gateway | Seguridad / tenant isolation |
| **Baja** | Observabilidad (OTel básico, DLQ workers) · design system compartido | Escala futura |

**Principios de arquitectura** (añadir a Architecture Guide cuando se separe el TEMP):  
Platform First · API First · Shared Identity · Event-driven cuando aporte valor · Observabilidad desde el diseño · Seguridad por defecto · Tenant isolation.

**Diagnóstico técnico del TEMP:** la plataforma (Auth/Hub/Billing/Gateway) está **más madura** que la **integración profunda** entre productos. Ese es el salto para que “ecosistema” sea verdad completa, no solo SSO + varios frontales.

---

## Notas

- Migraciones Supabase detalladas y KPIs densos → [`STATUS.md`](./STATUS.md) / Issues.  
- Detalle de pitch y audiencias → TEMP (hasta split comercial/técnico).

*Revisar semanalmente con [`STATUS.md`](./STATUS.md).* · *Actualizado 28 jul 2026 (landing/Hub screenshot + invite bridge en prod; foco = demo Copérnico + Billing E2E).*

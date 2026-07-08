# Ciclo de vida del Workspace

> **Julio 2026** · Cómo un workspace nace, crece y se renueva en Dakinis.  
> Admin UI → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) · SQL → migr. `031` · Journey → [`company/CUSTOMER-JOURNEY.md`](./company/CUSTOMER-JOURNEY.md)

Antes de julio 2026 el modelo mental era **Usuario → Productos**.  
Ahora es **Workspace → Hub → Productos**. Este documento describe ese ciclo completo.

---

## Flujo canónico

```
Crear workspace
      ↓
Invitar miembros
      ↓
Seleccionar productos
      ↓
Elegir plan (Billing)
      ↓
Configurar IA / Knowledge (opcional)
      ↓
Activar integraciones (roadmap)
      ↓
Usar productos (SSO desde Hub)
      ↓
Renovar / upgrade plan
      ↓
Expandir (más productos, más seats, marketplace)
```

---

## Fases detalladas

### 1. Crear workspace

| Paso | Qué pasa | Sistema |
|------|----------|---------|
| Registro Auth | Usuario `dakinis_auth` | Auth IdP |
| Primer login Hub | Se crea o enlaza workspace | `meta.workspaces` |
| Enlace tenant Core | `core_tenant_slug` hasta cutover | `meta.workspaces` + `core.tenants` |
| Provisioning | Script o signup automático | [`provision_workspace_*.sql`](./supabase/scripts/) |

**Owner** por defecto: quien crea el workspace.

### 2. Invitar miembros

| Acción | API / UI |
|--------|----------|
| Invitar por email | `POST /internal/workspaces/:id/members/invite` |
| Aceptar invitación | Token → Auth → membership |
| Roles | `owner` · `admin` · `member` · `viewer` |

Sin miembros invitados, el workspace es solo individual — insuficiente para PYME piloto.

### 3. Seleccionar productos

| Producto | Activación | Notas |
|----------|------------|-------|
| Dakinis One | `workspace_products` + plan Growth+ | Producto principal B2B |
| LifeFlow | tile Hub → SSO | Finanzas personales / equipo |
| StreamAutomator | cuenta propia o SSO roadmap | Stripe propio hoy |
| AkoeNet | servidor + IdP | Comunidad + Assistant |
| Tabletop | tile Hub | Onboarding baja fricción |

Admin: Hub `/admin/products` — activar/desactivar sin reinstalar nada.

### 4. Elegir plan

| Plan | Incluye | Bloqueo jul 2026 |
|------|---------|------------------|
| Starter | Hub + básico | — |
| Growth | Dakinis One módulos core | 🔴 Billing E2E live |
| Pro | IA avanzada, WhatsApp, etc. | 🔴 Billing E2E live |

Checkout Stripe → webhook → `billing.subscriptions` → `business.plan` en Core.

### 5. Configurar IA

| Acción | Dónde |
|--------|-------|
| Ver consumo tokens | Hub `/admin/ai-usage` (roadmap) |
| Ingest Knowledge | Knowledge service |
| Copilot Dakinis One | Tenant settings |
| AkoeNet Assistant módulos | Panel servidor AkoeNet |

### 6. Integraciones (roadmap)

Slack, Calendar, Zapier, banca (LifeFlow)… — catálogo en [`PLATFORM-INTEGRATIONS.md`](./PLATFORM-INTEGRATIONS.md).

Hub `/admin/integrations` — UI Coming Soon.

### 7. Uso diario

```
Auth → Hub (Mi día) → SSO → Producto → vuelta al Hub
```

Métrica de éxito: **DAU workspace** (no solo un producto aislado).

### 8. Renovar / upgrade

| Evento | Sistema |
|--------|---------|
| Renovación automática | Stripe subscription |
| Impago | `access_state=degraded` → restore al pagar |
| Upgrade plan | Portal Billing o checkout |
| Downgrade | Fin de periodo · gating API |

### 9. Expandir

| Expansión | Ejemplo |
|-----------|---------|
| Más productos | LifeFlow + Dakinis One mismo workspace |
| Más seats | Invitar admins y operarios |
| Marketplace | Apps y automatizaciones (futuro) |
| Enterprise | White-label, SLA — post-escala |

---

## Estados del workspace

| Estado | Significado | Acción Super Admin |
|--------|-------------|-------------------|
| `active` | Normal | — |
| `trial` | Periodo prueba | — |
| `degraded` | Impago Billing | Restringir features premium |
| `suspended` | Ops / abuso | `POST .../suspend` |
| `archived` | Cierre cuenta | Export GDPR |

---

## Pregunta guía por fase

| Fase | ¿Mejora el piloto este mes? |
|------|----------------------------|
| Crear + SSO Hub | ✅ Sí |
| Invitar miembros + Admin | ✅ Sí |
| Billing E2E | ✅ Sí — bloquea pago |
| Integraciones / Marketplace | ❌ Después del piloto |

---

*Actualizar al cerrar Billing E2E o al automatizar provisioning en signup.*

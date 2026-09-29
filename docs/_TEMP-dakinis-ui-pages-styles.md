# TEMP — Dakinis: paginas, diseno UI y vision de plataforma

> **Temporal / no SoT** · generado 28 sep 2026 · actualizado 28 sep 2026 · borrar o fusionar cuando deje de hacer falta.  
> Estado vivo → [`STATUS.md`](./STATUS.md) · mapa sistemas → [`SYSTEMS.md`](./SYSTEMS.md)  
> **Regla:** *Posibles mejoras* = backlog. Lo marcado **Hecho (scaffold)** ya esta en codigo; el resto requiere pedido explicito.

Inventario de **superficies de usuario**, deuda de diseno, y **roadmap de consolidacion** (Platform / Experience / Products).

---

## Vision — de “varias apps” a plataforma

```
                 DAKINIS SYSTEMS
                       │
               ┌───────┴───────┐
               │               │
          PLATFORM         EXPERIENCE
               │               │
      ┌────────┼────────┐      │
      │        │        │      │
    Auth     Core     Billing  DES (@dakinis/design-system)
      │        │        │      │
      └────────┼────────┘      │
               │               │
        ┌──────┼───────────────┼──────┐
        │      │               │      │
       Hub   Dakinis One   Stream   AkoeNet
                            Auto
```

| Capa | Que es |
|------|--------|
| **Platform** | Auth, tenant/org, billing, events, permissions, API client, observabilidad |
| **Experience** | DES, shells, estados UI, command palette, search, Copilot transversal |
| **Products** | Hub, Core, StreamAutomator, AkoeNet, LifeFlow, Tabletop |

**5 piezas a consolidar antes de features grandes:**

1. DES como paquete unico versionado (`@dakinis/design-system`)
2. Tenant / Org / Venture / Location
3. Permissions / RBAC por capability
4. Events + Notification Center
5. Core modular + lazy loading

---

## ADN visual compartido (DES)

| Capa | Que es |
|------|--------|
| **DES** | Dakinis Experience System — tokens, theme engine, layouts, UX |
| **Paquete versionado** | `@dakinis/design-system` **v1.0.0** (fachada sobre `shared-des` + contratos Platform UI) |
| **Paquetes base** | `shared-brand`, `shared-theme`, `shared-layouts`, `shared-ux`, `shared-foundation` (± vendored por app via sync) |
| **Tokens** | Superficies 0–4, spacing 4…64, radios, motion, tipografia |
| **Fuentes** | Inter + JetBrains Mono |
| **Superficies** | Navy `#08111d` → `#254b6e` (oscuro por defecto en Hub/Core/Landing/AkoeNet) |
| **IA** | Accent purpura `#7c3aed` |
| **Tema** | `data-theme` (dark/light/system/HC) + `data-product` (accent por producto) |
| **Platform vs Product UI** | Platform: Button, Modal, DataTable, Empty/Error/Loading… · Product: InventoryTable, KitchenBoard, DiscordChannel… |

### Accents por producto

| Producto | Accent | Default tema |
|----------|--------|--------------|
| Hub | Teal | System → dark/light (Theme Engine **v1.1**) |
| Core (Dakinis One) | Teal | Dark (CSS vars + DES) |
| Landing | Cyan `#22d3ee` | Dark fijo |
| StreamAutomator | Blue `#3b82f6` | **Light-first** |
| AkoeNet | Violet `#7c3aed` | Dark + tokens Nexora/Discord-like |
| LifeFlow | Green | (producto finance) |
| Tabletop | Gold | MVP |

---

## 1. Hub — `hub.dakinissystems.com`

**Repo:** `hub/` · **Idea:** OS del negocio (“¿que esta pasando ahora?”), no solo launcher.

### Paginas principales

| Ruta | Diseno / rol |
|------|----------------|
| `/` | **Mi dia** — saludo + **Attention Center** + widgets + timeline + launcher |
| `/login` (+ forgot/reset) | Auth centrado, sin shell completo |
| `/invite/:token` | Accept invite |
| `/ecosystem/launch/:productId` | Bridge SSO → producto |
| `/admin` | Admin home workspace |
| `/admin/members` | Miembros |
| `/admin/plan` | Plan / billing |
| `/admin/products` | Acceso a productos |
| `/admin/settings` | Settings + jerarquia org/venture/location |

### Como esta disenado

- **Shell:** sidebar + header + contenido (`HubShell` / `AppShell`).
- **Theme Engine DES v1.1** (`@dakinis/shared-theme`): dark / light / system / high-contrast.
- **Attention:** `HubAttentionPanel` + `deriveHubAttention` (prefer `dashboard.attention`, fallback `actions` + badges de apps).
- **Carga:** shell + skeletons de widgets mientras `dakinisFetchHubDashboard`.
- **Rutas:** login eager; resto lazy + Suspense.
- **Org:** OrgContextSwitcher (ADR-016); subtitulo muestra location/venture/org si viene en dashboard.

---

## 2. Core / Dakinis One — `core.dakinissystems.com`

**Repo:** `platform/core` · **Idea:** ERP + hospitality/CRM; **capabilities** multi-tenant.

### Paginas principales

| Ruta | Capacidad | Diseno / rol |
|------|-----------|----------------|
| `/` | — | Home marketing/funnel |
| `/login`, forgot/reset | — | Auth |
| `/precios`, `/success` | — | Pricing + post-checkout |
| `/app/dashboard` | hub/home | Dashboard tenant |
| `/app/crm` | `crm` | CRM |
| `/app/ventas` | `sales` | Ventas |
| `/app/inventario` | `inventory` | Inventario |
| `/app/reportes` | `reports` | Reportes |
| `/app/whatsapp/*` | `whatsapp` | WhatsApp hub |
| `/app/settings` | — | Settings |
| `/sistema/*` | `hospitality` | Hospitality (legacy paths) |

### Modularizacion (en curso)

```
web/src/modules/
├── registry.js          # capability → path
├── lazy-pages.js        # React.lazy por modulo
├── crm|sales|inventory|reports|whatsapp|settings|dashboard/
│   └── index.js         # barrel → app/<dominio>
└── (pages fisicas siguen en app/* durante migracion)
```

- **AppRouter:** `/app/*` via lazy + Suspense (O1).
- **Vite:** `manualChunks` por modulo (`mod-crm`, `mod-inventory`, …).
- **Capabilities / RBAC:** `@dakinis/shared-platform` → `product-capabilities`, `permissions`, `policy-engine`.

---

## 3. Landing — `dakinissystems.com`

Marketing / funnel. CorporateShell. SEO OG meta hecho. Hero screenshot Hub real = **D1 pendiente**.

---

## 4. StreamAutomator

Creator SaaS, light-first. Overlays + polling suggestions (O4 → eventos). Command palette local (D3 unificar).

---

## 5. AkoeNet

Discord-like. `content-visibility` en filas chat (**hecho**); windowing Virtuoso = O3 pendiente.

---

## Capas Platform compartidas (scaffold)

| Pieza | Paquete / API | Estado |
|-------|---------------|--------|
| Product capabilities + nav | `shared-platform/product-capabilities` | ✅ scaffold |
| Permissions + ROLE_PRESETS | `shared-platform/permissions` | ✅ scaffold |
| Policy engine ALLOW/DENY | `shared-platform/policy` | ✅ scaffold |
| Event catalog + createEvent | `shared-platform/events` | ✅ scaffold |
| SSE subscribe helper | `shared-platform/event-sse` | ✅ scaffold |
| UI states + normalizeUiError | `shared-platform/ui-states` | ✅ scaffold |
| DES versionado | `@dakinis/design-system` 1.0.0 | ✅ fachada + alias Vite Core |
| Hub Attention Center | `shared-ux` HubAttentionPanel | ✅ UI + derive |
| Attention datos Internal | `internal/hub-attention` → `dashboard.attention` | ✅ desde actions/stock/pedidos |
| Core lazy modules | `web/src/modules` | ✅ lazy + chunks |
| Capabilities → nav Core | `product-capabilities` + AppTopBar + auth | ✅ plan→caps→topbar |
| Event bus server + SSE | notifications `/v1/events/stream` + POST `/v1/events` | ✅ SSE in-process |
| Global Search cross-domain | search service | ⬜ |
| Copilot transversal permission-aware | shared-ai | ⬜ direccion |
| Dakinis Health interno | ops | ⬜ |
| Mobile strategy (TPV first) | Core hospitality | ⬜ |

**Transport rule:** REST ocasional · SSE server→client · WS bidireccional · Queue/BullMQ jobs · Redis cache.

---

## Donde mirar en codigo

| Que | Donde |
|-----|--------|
| Design System v1 | `packages/design-system` |
| Platform capabilities/events/policy | `packages/shared-platform/src/*` |
| Hub Attention | `packages/shared-ux/src/react/HubAttentionPanel.jsx` (+ hub vendored) |
| Core modules lazy | `platform/core/web/src/modules/` + `AppRouter.jsx` |
| Theme Engine Hub | `hub` + `@dakinis/shared-theme` v1.1 |
| Tokens | `packages/shared-brand` / `shared-foundation` |
| Sync DES → Hub | `scripts/sync-hub-des.ps1` |
| Design audit | `packages/design-audit` |

---

## Analisis A — Matriz funcional

| Capacidad | Hub | Core | Landing | StreamAutomator | AkoeNet |
|-----------|-----|------|---------|-----------------|---------|
| **Lazy routes** | ✅ | ✅ `/app/*` | ❓ SPA pequena | ✅ overlays | ✅ pages |
| **i18n** | ⚠️ ES hardcode | ✅ ES/EN | ✅ | ✅ | ✅ |
| **a11y** | Parcial | Mas fuerte ops | Parcial | Amplio chrome | Parcial |
| **Command palette** | ✅ shared-ux | ✅ | — | ✅ local | ✅ local |
| **Attention / events** | ✅ panel UI | catalogo platform | — | poll | WS chat |
| **Carga dashboard** | ✅ skeletons | Pulse | — | Widgets | Addons |
| **Org context** | ✅ ADR-016 | Tenant/location | — | — | — |
| **Capabilities nav** | — | registry + shared-platform | — | — | — |
| **PWA / mobile** | — | — | — | Manifest gated | Capacitor SDK 36 |
| **Chat listas** | — | — | — | — | ⚠️ map + content-visibility |

---

## Analisis B — Design debt

1. Temas distintos (Hub system, Core dark, Landing dark fijo, SA light-first, AkoeNet nexora) → DES 1.1 tokens unicos.
2. Hero Landing = mock, no Hub real (D1).
3. Aliases `Restaurant*` → `Hospitality*` pendientes.
4. Vendoring DES → drift; migrar apps a `@dakinis/design-system` + sync.
5. Command palette no unificado (D3 → global Ctrl+K contextual).
6. design-audit sin contraste WCAG.
7. Fuentes legacy fuera del nucleo DES.
8. Platform UI vs Product UI mezclado en sitios — usar contrato DES_PLATFORM_UI.

---

## Analisis C — Hecho recientemente (codigo)

| Item | Donde | Que |
|------|-------|-----|
| Hub lazy + skeletons | Hub | Login eager; Mi dia skeletons |
| Landing SEO | Landing | og/twitter/canonical |
| AkoeNet chat paint | Client | content-visibility |
| **DES package 1.0** | `packages/design-system` | Fachada versionada |
| **shared-platform vision** | capabilities, permissions, policy, events, ui-states, event-sse | Scaffold platform |
| **Hub Attention Center** | shared-ux + HubDashboardPage | OS “requiere atencion” |
| **Core lazy + chunks** | modules/* + AppRouter + vite manualChunks | O1 inicial |
| **Capabilities → topbar** | Core AppTopBar + auth `capabilities` | P-CAP |
| **Plan modules ERP** | plan-modules inventory/sales/reports/ai | gate por plan |
| **Attention Internal** | hub-attention.js en dashboard payload | P-ATT |
| **Notifications SSE** | GET /v1/events/stream · POST /v1/events | P-EVT |
| **Hub SSE client** | useHubLiveEvents + /api/hub/events/stream | P-EVT |
| **plan-access ERP paths** | inventory/sales/reports + capability check | P-RBAC |
| **F1 coverage flag** | internal `hub-f1-coverage` → `dashboard.f1` | F1 |
| **Core→Hub timeline** | hospitality `hub-timeline-bridge` + `seed_copernico_hub_timeline.sql` | F1 pedidos/ventas/stock → Mi día |

---

## Roadmap reorganizado (Fases)

### FASE 1 — Consolidacion (DES + UX transversal)

1. `@dakinis/design-system` versionado ✅ 1.0
2. Tokens unicos (retirar forks `--nexora-*` / dual `.dark`) 
3. Componentes Platform UI compartidos
4. Error / Loading / Empty states unificados (vocabulario ✅; componentes Permission/Offline ⬜)
5. Command Palette global contextual
6. Global Search cross-domain

**Objetivo:** todas las apps parecen Dakinis.

### FASE 2 — Platform

7. Identity  
8. Tenant / Org / Venture / Location (base ADR-016 ✅)  
9. Permissions / RBAC por capability ✅ scaffold → wire apps  
10. Event Bus + Notification Center (catalogo ✅; bus server ⬜)  
11. Global API client + error normalization ✅ helper  
12. Observability (correlation: request_id, tenant_id, product, module, action)

**Objetivo:** productos comparten plataforma.

### FASE 3 — Core

13. Lazy modules ✅  
14. Code splitting / manualChunks ✅  
15. SSE hospitality (dejar de reacoplar pulse)  
16–19. Inventory / CRM / Sales / Hospitality como capabilities reales en tenant

**Objetivo:** Dakinis One = producto principal modular.

### FASE 4 — Hub OS

20. Datos reales widgets (F1)  
21. Global notifications desde Event Bus  
22. Cross-product activity  
23. Global search en Hub  
24. Copilot transversal  
25. Command center (Attention + agenda + productos)

### FASE 5 — Performance (ex O1–O10)

26. Core chunks (hecho parcial)  
27. AkoeNet virtualization  
28. SA polling → events  
29. Hub chunks  
30. CSS splitting / images / Lighthouse CI

### FASE 6 — AI transversal

31. Copilot en CRM/Stock/Sales/Hospitality/WhatsApp  
32. Tool calling + permission-aware (nunca LLM → accion directa)  
33. Tenant context + telemetry AI

---

## Posibles mejoras (backlog)

Prioridad: **P0** bloquea demo/pago · **P1** UX/perf claro · **P2** higiene/escala.

### Prioridad plataforma (nueva)

| ID | Mejora | P | Estado |
|----|--------|---|---------|
| P-DES | Apps dependen de `@dakinis/design-system` ^1.x; sync deja de ser SoT | P1 | 1.0 + alias Core ✅; SA/AkoeNet ⬜ |
| P-CAP | Tenant.capabilities → sidebar dinamico Core | P1 | topbar + auth/me/config ✅ |
| P-EVT | Event bus + SSE Hub/Core/SA | P1 | notifications SSE ✅; Hub client + proxy ✅ |
| P-ATT | Hub Attention con datos reales (stock, reservas, facturas) | P0 | Internal `attention[]` ✅; falta más fuentes live |
| P-RBAC | Permisos `crm.contact.read` etc. en API + UI | P1 | plan-access + capabilities en rutas ERP ✅; permission keys fine-grained ⬜ |
| F1 | Widgets Mi dia datos reales ≥2 productos | P0 | Código: seed + hospitality→timeline bridge ✅; **SQL seed pendiente en Supabase prod** |
| P-SEARCH | Global Search multi-dominio | P2 | ⬜ |
| P-HEALTH | Dakinis Health interno (platform + products) | P2 | ⬜ |
| P-MOB | Mobile strategy: hospitality first / reports desktop | P2 | ⬜ |

### Funcionalidad (legado TEMP)

| ID | Mejora | Donde | P |
|----|--------|-------|---|
| F1 | Widgets Mi dia datos reales ≥2 productos | Hub + Internal | P0 | Seed Copérnico + Core→Hub bridge en código; aplicar `seed_copernico_hub_timeline.sql` en prod |
| F2 | Seed Calle Brava / Armala + OrgContext | Hub + SQL | P1 |
| F3 | Invite + demo Copernico E2E | Ops | P0 |
| F4 | Command palette hospitality hits API | Core | P2 |
| F5 | i18n Hub ES/EN | Hub | P2 |
| F6 | Assistant scaffolds → live | AkoeNet | P1 |
| F7 | Redeploy Hub/Internal org context | Railway | P1 |
| F8 | MFA Cloudflare perfil | Ops | P1 |

### Diseno

| ID | Mejora | P |
|----|--------|---|
| D1 | Screenshot Hub real en Landing | P0 |
| D2 | Contrato tema unico DES 1.1 | P1 |
| D3 | Unificar command palette shared-ux | P2 |
| D4 | Rename Restaurant* → Hospitality* | P2 |
| D5 | design-audit WCAG | P2 |
| D6–D8 | Landing brand-first / HC QA / LifeFlow-Tabletop DES | P2 |

### Optimizacion

| ID | Mejora | P | Nota |
|----|--------|---|------|
| O1 | Core React.lazy + manualChunks | P1 | ✅ scaffold |
| O2 | Core SSE/WS no reacoplar pulse | P1 | |
| O3 | AkoeNet Virtuoso | P1 | |
| O4 | SA bajar poll / events | P1 | |
| O5–O10 | Hub chunks, CSS muerto, PWA, prefetch, skeletons, split CSS | P2 | |

### Observabilidad / calidad

| ID | Mejora | P |
|----|--------|---|
| Q1 | Smoke e2e Mi dia | P1 |
| Q2 | Lighthouse CI Landing | P2 |
| Q3 | Catalogo visual DES | P2 |
| Q4 | Dependabot triage | P2 |

### Orden sugerido (actualizado)

1. ~~**P-DES + D2**~~ — design system 1.0 + alias Core (D2 tokens unicos sigue)  
2. ~~**P-CAP**~~ · ~~**P-EVT Hub client**~~ · **P-ATT** datos live amplios (parcial)  
3. ~~**P-RBAC plan gates**~~ — fine-grained `crm.contact.*` sigue  
4. **F1 en prod** — validar `f1.f1Ready` con DB real + **F3 + F7** Copernico  
5. **O2 + O3 + O4** — realtime / perf restante  
6. **P-SEARCH + D3 + Fase 6 AI**

---

## Checklist rapida

**Platform** — capabilities · permissions · events · tenant hierarchy · DES versionado  

**Funcionalidad** — job de pagina · SSO · empty/error/loading · org/admin · attention  

**Diseno** — accent/`data-product` · shell correcto · Platform UI vs Product UI  

**Optimizacion** — lazy por modulo · fetch vs poll · listas largas · LCP/SEO  

---

*Fin TEMP — no SoT. Scaffolds de vision 28 sep 2026; backlog restante no es trabajo automatico.*

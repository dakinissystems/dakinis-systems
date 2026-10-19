# Runbook — Facturación fiscal / VERI*FACTU (Dakinis One)

Módulo **independiente** en Core (`api/src/modules/fiscal`). Emite registros con huella encadenada, QR y rectificativas. **No** es la declaración responsable AEAT ni un SIF certificado.

## Decisión de arquitectura

| Opción | Qué hacemos hoy |
|--------|-----------------|
| Dakinis emite facturas fiscales | ✅ Base implementada (`tenant_fiscal_*`) |
| Conectar proveedor externo certificado | 🔜 Adaptador `aeat-adapter.js` (stub) — sustituible |
| Solo CRM/agenda sin facturar | Sin impacto: módulo desactivado por defecto |

## Calendario (vigilar AEAT)

Publicado a 2026-10: sociedades **antes del 2027-01-01**; resto **antes del 2027-07-01**. Hay anuncios de aplazamiento — no dar fechas por definitivas sin BOE.

## Provisioning

1. Aplicar migración [`060_fiscal_invoicing_verifactu.sql`](../supabase/migrations/060_fiscal_invoicing_verifactu.sql) en schemas Core.
2. Redeploy API Core.
3. En UI: **Config → Fiscal** — NIF emisor, serie, modalidad `no_verifactu` o `verifactu`, activar.

SQLite local: tablas creadas en `dakinisMigrateHospitalityTables` (mismo migrate helper).

## API

| Método | Ruta | Uso |
|--------|------|-----|
| GET/PATCH | `/api/tenant/fiscal/settings` | Ajustes (admin) |
| GET/POST | `/api/tenant/fiscal/invoices` | Listar / emitir |
| GET | `/api/tenant/fiscal/invoices/:id` | Detalle + eventos |
| POST | `/api/tenant/fiscal/invoices/:id/rectify` | Factura rectificativa |

Al crear factura de sala (`POST /api/tenant/restaurant/invoices`) con fiscal **enabled**, se intenta generar el registro fiscal automáticamente.

## Modalidades

- **no_verifactu**: cadena hash + conservación local + QR; sin remisión AEAT.
- **verifactu**: igual + llamada al adaptador (hoy stub `queued_local`).
- **disabled**: no emite.

## Cumplimiento — checklist producto

- [x] Numeración por serie
- [x] Hash SHA-256 encadenado
- [x] QR / URL verificación (plantilla AEAT)
- [x] Rectificativas sin borrar original
- [x] Eventos de auditoría
- [ ] Conector AEAT / proveedor certificado
- [ ] Declaración responsable del software
- [ ] Pruebas formales de integridad / exportación

## Relacionado

Hospitality tickets (`restaurant_invoice` en `tenant_records`) siguen existiendo para operativa de sala; el módulo fiscal es la capa legal.

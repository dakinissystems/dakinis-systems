# ADR-007 — Tabletop MVP

## Contexto

Gestor D&D 5e requiere entrega rápida offline-first con sync opcional. Nombre público **Tabletop** (repo `dakinis-tabletop`); carpeta legacy `DND/` no se usa en docs cliente.

## Decisión

MVP con SQLite en volume Railway, API `tabletop-api.dakinissystems.com`, web `tabletop.dakinissystems.com`. SSO Hub: URL directa (`sso: none`). AI GM consume AI Platform. Cutover Supabase schema `tabletop` cuando MVP estabilice.

## Consecuencias

- Lifecycle Railway: **MVP** hasta migración DB.
- Hub launcher abre URL Tabletop sin hub-sso bridge.
- SRD/compendium local; no backend pesado en v1.

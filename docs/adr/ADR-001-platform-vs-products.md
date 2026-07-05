# ADR-001 — Platform vs Products

## Contexto

El ecosistema Dakinis agrupa Business OS, finanzas, streaming, voz y tabletop. Mezclar lógica de producto con servicios transversales (auth, billing, AI) genera acoplamiento y despliegues frágiles.

## Decisión

Separar en cuatro capas: **Foundation** (DES, SDK, contracts) → **Infrastructure** (Gateway, Redis, Supabase, Railway) → **Platform** (Identity, Hub, AI, Billing, …) → **Products** (Core, LifeFlow, …). Los productos **solo consumen** platform vía Gateway o Internal API; no duplican Auth, Billing ni motores IA.

## Consecuencias

- Cada producto mantiene BD aislada (schema o SQLite hasta cutover).
- Nuevos productos se integran registrando contratos y variables Railway, no fork de Core.
- Platform evoluciona en repos dedicados (`dakinis-auth`, `dakinis-billing`, …).

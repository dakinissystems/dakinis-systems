# ADR-006 — LifeFlow Engine

## Contexto

LifeFlow Score, forecast y escenarios deben ser reproducibles y auditables. Un LLM no puede ser fuente de verdad para patrimonio o score.

## Decisión

**LifeFlow Engine** determinista (Score, Forecast, Scenario, Risk, …) como núcleo del producto. API/Web/Mobile son capas. Coach IA usa tools con números del Engine; el LLM narra, no calcula. BD hoy SQLite volume; objetivo schema `lifeflow` en Supabase.

## Consecuencias

- Repo `lifeflow` separado; dominios `finance-api` / `finance`.
- Hub widgets LifeFlow leen métricas vía Internal API / Supabase cuando cutover esté listo.
- Migración SQLite → PostgreSQL es hito de producto, no de platform.

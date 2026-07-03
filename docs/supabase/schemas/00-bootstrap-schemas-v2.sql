-- Supabase — bootstrap schemas lógicos v2 (Dakinis Platform)
-- Ejecutar en el proyecto Supabase "Dakinis Production".
-- NO mueve tablas existentes; prepara migración gradual desde dakinis_* / public.
-- Ver docs/PLATFORM-STATUS.md § Roadmap · Fase 7 LifeFlow

CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS stream;
CREATE SCHEMA IF NOT EXISTS akoenet;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS hub;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS lifeflow;
CREATE SCHEMA IF NOT EXISTS knowledge;

COMMENT ON SCHEMA auth IS 'IdP dakinis-auth — migración desde dakinis_auth';
COMMENT ON SCHEMA core IS 'Dakinis One Core — migración desde dakinis_core_prod';
COMMENT ON SCHEMA stream IS 'StreamAutomator';
COMMENT ON SCHEMA akoenet IS 'AkoeNet social + voz';
COMMENT ON SCHEMA ai IS 'Dakinis AI — RAG, embeddings, usage';
COMMENT ON SCHEMA hub IS 'Hub — preferencias widgets, launcher';
COMMENT ON SCHEMA billing IS 'Stripe — customers, subscriptions (futuro servicio billing)';
COMMENT ON SCHEMA lifeflow IS 'LifeFlow Finanzas — schema compartido o SaaS independiente';
COMMENT ON SCHEMA knowledge IS 'Dakinis Knowledge — documents, RAG, embeddings';

-- Schemas legacy (mantener hasta cutover):
-- dakinis_auth, dakinis_core_prod, dakinis_core_dev

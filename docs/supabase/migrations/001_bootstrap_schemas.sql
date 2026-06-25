-- 001 — Bootstrap schemas lógicos
-- NO mueve tablas de public ni dakinis_*; prepara destino de migración.

CREATE SCHEMA IF NOT EXISTS dakinis_auth;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS stream;
CREATE SCHEMA IF NOT EXISTS akoenet;
CREATE SCHEMA IF NOT EXISTS lifeflow;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS hub;
CREATE SCHEMA IF NOT EXISTS audit;

-- Legacy ERP (mantener hasta cutover)
CREATE SCHEMA IF NOT EXISTS dakinis_core_prod;
CREATE SCHEMA IF NOT EXISTS dakinis_core_dev;

COMMENT ON SCHEMA dakinis_auth IS 'IdP Dakinis — identidad única (NO usar schema auth de Supabase)';
COMMENT ON SCHEMA core IS 'Tenancy + catálogo compartido — sin duplicar ERP dakinis_core_prod';
COMMENT ON SCHEMA billing IS 'Stripe, suscripciones, facturación';
COMMENT ON SCHEMA stream IS 'StreamAutomator';
COMMENT ON SCHEMA akoenet IS 'AkoeNet — servidores, canales, mensajes, voz';
COMMENT ON SCHEMA lifeflow IS 'LifeFlow — finanzas personales';
COMMENT ON SCHEMA ai IS 'Dakinis AI — RAG, embeddings, agentes';
COMMENT ON SCHEMA hub IS 'Hub — launcher, widgets, preferencias';
COMMENT ON SCHEMA audit IS 'Logs append-only, seguridad, API';
COMMENT ON SCHEMA dakinis_core_prod IS 'Legacy Core ERP — migrar gradualmente a core.*';

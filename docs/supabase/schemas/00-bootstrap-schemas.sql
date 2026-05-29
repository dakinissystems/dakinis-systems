-- Supabase — ejecutar PRIMERO en SQL Editor
-- Proyecto: el de Dakinis Core/Auth (DATABASE_URL Railway), NO el de AkoeNet.
-- Crea schemas lógicos del ecosistema (NO mezclar con public de Supabase Auth/Storage)

    CREATE SCHEMA IF NOT EXISTS dakinis_auth;
    CREATE SCHEMA IF NOT EXISTS dakinis_core;
    CREATE SCHEMA IF NOT EXISTS dakinis_core_dev;
    CREATE SCHEMA IF NOT EXISTS dakinis_core_prod;
    -- Reservados para migración futura (AkoeNet / StreamAutomator en mismo proyecto Supabase):
    -- CREATE SCHEMA IF NOT EXISTS dakinis_akoenet;
    -- CREATE SCHEMA IF NOT EXISTS dakinis_streamautomator;

    COMMENT ON SCHEMA dakinis_auth IS 'IdP central platform/auth';
    COMMENT ON SCHEMA dakinis_core_prod IS 'Dakinis One Core — producción';
    COMMENT ON SCHEMA dakinis_core_dev IS 'Dakinis One Core — staging/dev';

-- Verifica enlace SA → IdP para checkout unificado (usuario test velezcampeon).
-- Ejecutar en Supabase SQL Editor (schema public = SA legacy).

SELECT
  id,
  email,
  username,
  "platformAuthSub",
  CASE
    WHEN "platformAuthSub" IS NULL OR btrim("platformAuthSub") = '' THEN 'MISSING — causa checkout LEGACY'
    WHEN "platformAuthSub" = 'a1000088-0000-4000-8000-000000000088' THEN 'OK (usuario test)'
    ELSE 'SET (otro sub)'
  END AS link_status
FROM public."Users"
WHERE email ILIKE 'velezcampeon_88@hotmail.com'
   OR id IN (17, 20)
   OR "platformAuthSub" = 'a1000088-0000-4000-8000-000000000088';

-- Smoke fallaba con JWT de Users.id = 17 (sin platformAuthSub).
-- Usuario test correcto: id = 20 con platformAuthSub = a1000088-...
-- Si link_status = MISSING en id 20:
-- UPDATE public."Users"
-- SET "platformAuthSub" = 'a1000088-0000-4000-8000-000000000088'
-- WHERE id = 20;

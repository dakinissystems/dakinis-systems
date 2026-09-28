-- Candidatos de dominio para Calle Brava / Ármala — SOLO tras verificar disponibilidad.
-- NO ejecutar si Cloudflare/Workspace aún no están listos.
--
-- Gate: rellena v_confirmed_domains solo con dominios YA comprobados libres en
-- Cloudflare Registrar / dominios.es / RDAP. Si está vacío, el script no inserta nada.

DO $$
DECLARE
  v_ws_id uuid;
  v_venture_id uuid;
  -- Ejemplo tras verificar: ARRAY['lacallebravagroup.es', 'lacallebravagroup.com']
  -- armala.com estaba OCUPADO en check RDAP (sep 2026) — no incluir salvo que cambie.
  v_confirmed_domains text[] := ARRAY[]::text[];
  d text;
BEGIN
  IF coalesce(array_length(v_confirmed_domains, 1), 0) = 0 THEN
    RAISE NOTICE 'SKIP: v_confirmed_domains vacío — verifica disponibilidad antes de insertar dominios';
    RETURN;
  END IF;

  SELECT id INTO v_ws_id FROM meta.workspaces WHERE slug = 'la-calle-brava-group';
  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'Run provision_la_calle_brava_armala.sql first';
  END IF;

  SELECT id INTO v_venture_id
  FROM meta.ventures
  WHERE workspace_id = v_ws_id AND slug = 'armala';

  FOREACH d IN ARRAY v_confirmed_domains LOOP
    d := lower(trim(d));
    IF d IN ('lacallebravagroup.es', 'lacallebravagroup.com') THEN
      INSERT INTO meta.organization_domains (
        workspace_id, venture_id, domain, kind, primary_domain, mail_provider,
        email_aliases, dns_status, notes
      )
      VALUES (
        v_ws_id, NULL, d,
        CASE WHEN d LIKE '%.es' THEN 'corporate' ELSE 'redirect' END,
        (d LIKE '%.es'),
        'google_workspace',
        '[{"local":"hola","routes_to":"owners"},{"local":"administracion","routes_to":"owners"}]'::jsonb,
        'pending',
        'Candidato confirmado libre — comprar en CF + MX Workspace'
      )
      ON CONFLICT (workspace_id, domain) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now();
    ELSIF d IN ('armala.es', 'armala.com') THEN
      IF v_venture_id IS NULL THEN
        RAISE EXCEPTION 'Venture armala missing';
      END IF;
      INSERT INTO meta.organization_domains (
        workspace_id, venture_id, domain, kind, primary_domain, mail_provider,
        email_aliases, dns_status, notes
      )
      VALUES (
        v_ws_id, v_venture_id, d,
        CASE WHEN d LIKE '%.es' THEN 'brand' ELSE 'redirect' END,
        (d LIKE '%.es'),
        'google_workspace',
        '[{"local":"hola","routes_to":"owners"},{"local":"pedidos","routes_to":"owners"},{"local":"reservas","routes_to":"owners"}]'::jsonb,
        'pending',
        'Candidato confirmado libre — comprar en CF + MX Workspace'
      )
      ON CONFLICT (workspace_id, domain) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now();

      IF d = 'armala.es' THEN
        UPDATE meta.ventures
        SET brand_domain = 'armala.es',
            settings = settings || jsonb_build_object('brand_domain_status', 'candidate_confirmed'),
            updated_at = now()
        WHERE id = v_venture_id;
      END IF;
    ELSE
      RAISE NOTICE 'Dominio % no está en la lista blanca del script — omitido', d;
    END IF;
  END LOOP;

  UPDATE meta.workspaces
  SET settings = settings || jsonb_build_object('domains_status', 'candidates_recorded'),
      updated_at = now()
  WHERE id = v_ws_id;
END $$;

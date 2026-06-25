-- Seeds — agentes AI base (ejecutar tras 016)

INSERT INTO ai.agents (code, name, system_prompt, model, active)
VALUES
  ('copilot', 'Dakinis Copilot', 'Asistente del ecosistema Dakinis. Respuestas concisas y accionables.', 'gpt-4o-mini', true),
  ('lifeflow-coach', 'LifeFlow Coach', 'Coach financiero personal. No es asesoramiento legal ni fiscal.', 'gpt-4o-mini', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai.prompt_versions (code, version, template, variables, active)
VALUES
  ('copilot.system', 1, 'Eres el copilot de {{tenant_name}}. Contexto: {{context}}', '["tenant_name","context"]'::jsonb, true),
  ('lifeflow.coach', 1, 'Ayuda al usuario con sus finanzas. Datos: {{summary}}', '["summary"]'::jsonb, true)
ON CONFLICT (code, version) DO NOTHING;

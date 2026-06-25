-- Seeds — core.tenants demo (ejecutar tras 003)

INSERT INTO core.tenants (slug, name, plan)
VALUES
  ('dakinis-platform', 'Dakinis Plataforma', 'platform'),
  ('restaurante-demo', 'Restaurante Demo', 'pro'),
  ('clinica-demo', 'Clínica Demo', 'starter'),
  ('peluqueria-demo', 'Peluquería Demo', 'starter'),
  ('inmobiliaria-demo', 'Inmobiliaria Demo', 'starter')
ON CONFLICT (slug) DO NOTHING;

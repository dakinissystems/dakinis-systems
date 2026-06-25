-- Seeds — hub.widgets (ejecutar tras 009)

INSERT INTO hub.widgets (code, title, description, sort_order)
VALUES
  ('launcher', 'Launcher', 'Acceso rápido a productos', 10),
  ('notifications', 'Notificaciones', 'Centro de avisos', 20),
  ('timeline', 'Actividad', 'Timeline reciente', 30),
  ('billing', 'Facturación', 'Plan y uso', 40),
  ('ai-copilot', 'Copilot', 'Asistente IA', 50)
ON CONFLICT (code) DO NOTHING;

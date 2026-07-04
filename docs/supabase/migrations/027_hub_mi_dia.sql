-- 027 — Hub «Mi día»: activar flag + widgets alineados al dashboard
-- Ejecutar tras 016–019 (v1_get_dashboard) y 024 (feature_flags).

UPDATE meta.feature_flags
SET enabled = true, updated_at = now()
WHERE flag_key = 'hub.mi_dia';

INSERT INTO hub.widgets (code, title, description, sort_order)
VALUES
  ('my-day', 'Mi día', 'Agenda, foco y resumen del día', 0),
  ('hub-today-agenda', 'Agenda de hoy', 'Citas y streams de hoy', 1),
  ('hub-notifications-unread', 'Notificaciones', 'Avisos sin leer', 2),
  ('hub-recent-activity', 'Actividad', 'Timeline reciente', 3),
  ('lifeflow-score', 'LifeFlow Score', 'Salud financiera', 4),
  ('hub-app-launcher', 'Aplicaciones', 'Launcher secundario', 99)
ON CONFLICT (code) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order;

INSERT INTO meta.migration_history (migration_file, notes)
VALUES ('027_hub_mi_dia.sql', 'Hub Mi día flag + widget seeds')
ON CONFLICT (migration_file) DO NOTHING;

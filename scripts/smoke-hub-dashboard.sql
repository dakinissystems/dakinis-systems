-- Smoke hub.v1_get_dashboard tras migración 028
-- Pegar en SQL Editor con tu user UUID de prod.

SELECT hub.v1_get_dashboard('3ff966a0-2ae7-4d6a-b4f9-76facabcb423'::uuid) AS dashboard;

-- Esperado: JSON con stream_scheduled_week, lifeflow_score, akoenet_online, timeline, etc.

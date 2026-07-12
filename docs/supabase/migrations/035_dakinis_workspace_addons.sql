-- 035 — Dakinis Workspace: catálogo de addons nativos + instalaciones por workspace
-- Ejecutar tras 031. Idempotente.

CREATE TABLE IF NOT EXISTS meta.workspace_addons (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  phase text NOT NULL DEFAULT 'future',
  icon text,
  sort_order integer NOT NULL DEFAULT 100,
  permissions text[] NOT NULL DEFAULT '{}',
  windows text[] NOT NULL DEFAULT '{}',
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  builtin boolean NOT NULL DEFAULT false,
  i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meta_workspace_addons_category_check CHECK (
    category IN ('system', 'productivity', 'developer', 'stream', 'media', 'entertainment')
  ),
  CONSTRAINT meta_workspace_addons_phase_check CHECK (
    phase IN ('mvp', 'growth', 'future')
  )
);

COMMENT ON TABLE meta.workspace_addons IS
  'Catálogo global Dakinis Workspace — addons nativos instalables (no plugins Discord).';

CREATE TABLE IF NOT EXISTS meta.workspace_addon_installs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES meta.workspaces(id) ON DELETE CASCADE,
  addon_key text NOT NULL REFERENCES meta.workspace_addons(key),
  enabled boolean NOT NULL DEFAULT true,
  pinned boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, addon_key)
);

CREATE INDEX IF NOT EXISTS idx_meta_workspace_addon_installs_ws
  ON meta.workspace_addon_installs (workspace_id) WHERE enabled = true;

COMMENT ON TABLE meta.workspace_addon_installs IS
  'Addons instalados por workspace Hub (visible en Desktop, Command Center y perfil platform admin).';

-- Catálogo (EN/ES en i18n JSON)
INSERT INTO meta.workspace_addons (key, name, description, category, phase, icon, sort_order, permissions, windows, builtin, i18n)
VALUES
  ('command-palette', 'Command Center', 'Ctrl+K — open apps, search, deploy, play music', 'system', 'mvp', 'command', 5,
   ARRAY['search'], ARRAY['palette'], true,
   '{"name":{"en":"Command Center","es":"Centro de comandos"},"description":{"en":"Ctrl+K — open apps, search messages, deploy Railway, play music.","es":"Ctrl+K — abrir apps, buscar mensajes, deploy Railway, reproducir música."}}'::jsonb),
  ('activity-center', 'Activity Center', 'Notifications, streams, deploys, invoices', 'system', 'mvp', 'bell', 6,
   ARRAY['notifications'], ARRAY['feed'], true,
   '{"name":{"en":"Activity Center","es":"Centro de actividad"},"description":{"en":"Notifications, streams, deploys, invoices, messages and AI alerts.","es":"Notificaciones, streams, deploys, facturas, mensajes y alertas de IA."}}'::jsonb),
  ('terminal', 'Dakinis Terminal', 'Shell — Railway, Docker, Git, Supabase', 'developer', 'growth', 'terminal', 10,
   ARRAY['storage','notifications','network'],
   ARRAY['terminal','ssh','railway','docker','supabase','kubernetes','logs','history','bookmarks'], false,
   '{"name":{"en":"Dakinis Terminal","es":"Terminal Dakinis"},"description":{"en":"Shell for developers — Railway, Docker, Git, Supabase and deploy logs with AI hints.","es":"Terminal para desarrolladores — Railway, Docker, Git, Supabase y logs de deploy con ayuda de IA."}}'::jsonb),
  ('ai-workspace', 'AI Workspace', 'Multi-window AI desktop', 'productivity', 'mvp', 'sparkles', 20,
   ARRAY['ai','storage','knowledge','notifications'],
   ARRAY['conversation','prompt-library','knowledge','actions','files','models','history','settings'], false,
   '{"name":{"en":"AI Workspace","es":"Espacio de IA"},"description":{"en":"Multi-window AI desktop — conversations, prompts, knowledge and actions.","es":"Escritorio de IA con ventanas — conversaciones, prompts, conocimiento y acciones."}}'::jsonb),
  ('whiteboard', 'Whiteboard', 'Collaborative board', 'productivity', 'growth', 'pen-tool', 30,
   ARRAY['storage','realtime','voice'],
   ARRAY['canvas','sticky-notes','shapes','mind-map','flowchart','draw','export'], false,
   '{"name":{"en":"Whiteboard","es":"Pizarra colaborativa"},"description":{"en":"Excalidraw-style board for brainstorming and voice meetings.","es":"Pizarra estilo Excalidraw para brainstorming y reuniones con voz."}}'::jsonb),
  ('kanban', 'Kanban', 'Boards and tasks', 'productivity', 'growth', 'columns', 40,
   ARRAY['storage','notifications'],
   ARRAY['boards','columns','tasks','comments','labels','members','calendar'], false,
   '{"name":{"en":"Kanban","es":"Kanban"},"description":{"en":"Todo → Doing → Review → Done without leaving Dakinis.","es":"Todo → Doing → Review → Done sin salir de Dakinis."}}'::jsonb),
  ('calendar', 'Calendar', 'Events and streams', 'productivity', 'growth', 'calendar', 50,
   ARRAY['events','notifications'],
   ARRAY['agenda','week','month','meetings','bookings','birthdays','reminders'], false,
   '{"name":{"en":"Calendar","es":"Calendario"},"description":{"en":"Streams, events, meetings, bookings and birthdays.","es":"Streams, eventos, reuniones, reservas y cumpleaños."}}'::jsonb),
  ('notes', 'Notes', 'Markdown wiki', 'productivity', 'growth', 'file-text', 60,
   ARRAY['storage','ai','knowledge','search'],
   ARRAY['folders','editor','wiki','tags','backlinks','search','ai-summary'], false,
   '{"name":{"en":"Notes","es":"Notas"},"description":{"en":"Obsidian-style markdown wiki with backlinks and AI summaries.","es":"Wiki Markdown estilo Obsidian con backlinks y resúmenes de IA."}}'::jsonb),
  ('code-editor', 'Code Editor', 'Lightweight editor', 'developer', 'growth', 'code', 70,
   ARRAY['storage','git'],
   ARRAY['explorer','editor','terminal','git','problems','outline'], false,
   '{"name":{"en":"Code Editor","es":"Editor de código"},"description":{"en":"Lightweight editor to share files during voice calls.","es":"Editor ligero para compartir archivos durante llamadas de voz."}}'::jsonb),
  ('dashboard', 'Dashboard', 'Configurable widgets', 'system', 'mvp', 'layout-dashboard', 80,
   ARRAY['metrics','notifications'],
   ARRAY['widgets','cpu','memory','stripe','railway','github','supabase','analytics','calendar','weather','streams'], false,
   '{"name":{"en":"Dashboard","es":"Panel"},"description":{"en":"Configurable widgets — CPU, Railway, GitHub, Stripe and live streams.","es":"Widgets configurables — CPU, Railway, GitHub, Stripe y streams en vivo."}}'::jsonb),
  ('stream-deck', 'Stream Deck', 'Virtual deck', 'stream', 'growth', 'grid-3x3', 90,
   ARRAY['streamautomator','obs','twitch'],
   ARRAY['buttons','pages','macros','obs','twitch','akoenet','keyboard','automation'], false,
   '{"name":{"en":"Stream Deck","es":"Stream Deck virtual"},"description":{"en":"Virtual deck for StreamAutomator — OBS, Twitch, macros and hotkeys.","es":"Deck virtual para StreamAutomator — OBS, Twitch, macros y atajos."}}'::jsonb),
  ('soundboard', 'Soundboard', 'Voice sounds', 'entertainment', 'growth', 'volume-2', 100,
   ARRAY['storage','voice'],
   ARRAY['categories','favorites','hotkeys','history','upload','share'], false,
   '{"name":{"en":"Soundboard","es":"Soundboard"},"description":{"en":"Voice-channel soundboard with favorites and hotkeys.","es":"Soundboard en canales de voz con favoritos y atajos."}}'::jsonb),
  ('game-launcher', 'Game Launcher', 'Game libraries', 'entertainment', 'future', 'gamepad-2', 110,
   ARRAY['steam','presence'],
   ARRAY['library','steam','epic','gog','battlenet','presence'], false,
   '{"name":{"en":"Game Launcher","es":"Lanzador de juegos"},"description":{"en":"Manage libraries and presence across Steam, Epic, GOG and Battle.net.","es":"Gestiona bibliotecas y presencia en Steam, Epic, GOG y Battle.net."}}'::jsonb),
  ('clip-studio', 'Clip Studio', 'Clips for streamers', 'stream', 'future', 'scissors', 120,
   ARRAY['storage','streamautomator'],
   ARRAY['clips','editor','export','share'], false,
   '{"name":{"en":"Clip Studio","es":"Clip Studio"},"description":{"en":"Create, edit and share clips for streamers.","es":"Crea, edita y comparte clips para streamers."}}'::jsonb),
  ('marketplace', 'Marketplace', 'Browse addons', 'system', 'growth', 'store', 130,
   ARRAY['marketplace','billing'],
   ARRAY['browse','installed','updates','themes','plugins','ratings','developer'], false,
   '{"name":{"en":"Marketplace","es":"Marketplace"},"description":{"en":"Browse, install and update addons, themes and plugins.","es":"Explora, instala y actualiza addons, temas y plugins."}}'::jsonb),
  ('theme-studio', 'Theme Studio', 'Create skins', 'system', 'growth', 'palette', 140,
   ARRAY['storage','marketplace'],
   ARRAY['colors','fonts','borders','icons','animations','preview','export'], false,
   '{"name":{"en":"Theme Studio","es":"Theme Studio"},"description":{"en":"Create skins, preview and publish to the Marketplace.","es":"Crea skins, previsualiza y publica en el Marketplace."}}'::jsonb),
  ('media-player', 'Media Player', 'Winamp-style player', 'media', 'mvp', 'music', 150,
   ARRAY['storage','media','realtime'],
   ARRAY['player','playlist','library','equalizer','visualizer','friends'], false,
   '{"name":{"en":"Media Player","es":"Reproductor multimedia"},"description":{"en":"Winamp-style player — albums, lyrics, visualizer and listen together.","es":"Reproductor estilo Winamp — álbumes, letras, visualizer y escuchar juntos."}}'::jsonb),
  ('downloads', 'Downloads', 'Download manager', 'system', 'future', 'download', 160,
   ARRAY['storage'],
   ARRAY['active','history','queue','settings'], false,
   '{"name":{"en":"Downloads","es":"Descargas"},"description":{"en":"Download manager with history and queue.","es":"Administrador de descargas con historial y cola."}}'::jsonb),
  ('file-explorer', 'File Explorer', 'Workspace files', 'system', 'growth', 'folder', 170,
   ARRAY['storage'],
   ARRAY['recent','shared','uploads','downloads','cloud','trash','favorites'], false,
   '{"name":{"en":"File Explorer","es":"Explorador de archivos"},"description":{"en":"Workspace files — uploads, shared media and documents.","es":"Archivos del workspace — subidas, media compartida y documentos."}}'::jsonb),
  ('devops', 'DevOps', 'Deploy and logs', 'developer', 'growth', 'server', 180,
   ARRAY['railway','supabase','metrics'],
   ARRAY['deployments','logs','containers','railway','supabase','redis','cron','metrics'], false,
   '{"name":{"en":"DevOps","es":"DevOps"},"description":{"en":"Deploy, logs and metrics for Railway, Supabase and Redis.","es":"Deploy, logs y métricas de Railway, Supabase y Redis."}}'::jsonb),
  ('obs-companion', 'OBS Companion', 'OBS control', 'stream', 'growth', 'video', 190,
   ARRAY['obs','streamautomator'],
   ARRAY['scenes','sources','audio','streaming','recording','chat','statistics'], false,
   '{"name":{"en":"OBS Companion","es":"OBS Companion"},"description":{"en":"Switch scenes, read chat and control mic/camera from Dakinis.","es":"Cambia escenas, lee el chat y controla mic/cámara desde Dakinis."}}'::jsonb),
  ('automation-builder', 'Automation Builder', 'Visual flows', 'developer', 'growth', 'workflow', 200,
   ARRAY['automation','ai','notifications'],
   ARRAY['canvas','triggers','conditions','actions','variables','history','logs'], false,
   '{"name":{"en":"Automation Builder","es":"Automation Builder"},"description":{"en":"Visual flows — message → AI → condition → action (n8n style).","es":"Flujos visuales — mensaje → IA → condición → acción (estilo n8n)."}}'::jsonb),
  ('live-dashboard', 'Live Dashboard', 'Meeting mode', 'productivity', 'future', 'users', 7,
   ARRAY['voice','ai','calendar'],
   ARRAY['meeting','voice','screen','notes','ai-summary','tasks','calendar'], false,
   '{"name":{"en":"Live Dashboard","es":"Panel en vivo"},"description":{"en":"Meeting mode — voice, screen, notes, AI summary and tasks together.","es":"Modo reunión — voz, pantalla, notas, resumen IA y tareas juntos."}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  phase = EXCLUDED.phase,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  permissions = EXCLUDED.permissions,
  windows = EXCLUDED.windows,
  builtin = EXCLUDED.builtin,
  i18n = EXCLUDED.i18n,
  updated_at = now();

INSERT INTO meta.schema_versions (schema_name, version, description, migration_file)
VALUES ('meta', 4, 'Dakinis Workspace addons catalog + installs', '035_dakinis_workspace_addons.sql')
ON CONFLICT (schema_name) DO UPDATE SET
  version = GREATEST(meta.schema_versions.version, 4),
  description = EXCLUDED.description,
  migration_file = EXCLUDED.migration_file,
  applied_at = now();

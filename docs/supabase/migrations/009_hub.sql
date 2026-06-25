-- 009 — Hub (schema hub)

CREATE TABLE IF NOT EXISTS hub.widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub.user_widget_layout (
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  widget_id uuid NOT NULL REFERENCES hub.widgets(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}',
  visible boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, widget_id)
);

CREATE TABLE IF NOT EXISTS hub.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES dakinis_auth.users(id),
  source_product text,
  metadata jsonb NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_notifications_user ON hub.notifications (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS hub.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES hub.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

CREATE TABLE IF NOT EXISTS hub.timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  event_type text NOT NULL,
  title text,
  payload jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_timeline_user ON hub.timeline (user_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS hub.preferences (
  user_id uuid PRIMARY KEY REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  locale text NOT NULL DEFAULT 'es',
  theme text NOT NULL DEFAULT 'system',
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  path text,
  label text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_code, path)
);

CREATE TABLE IF NOT EXISTS hub.shortcuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  key_combo text NOT NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key_combo)
);

CREATE TABLE IF NOT EXISTS hub.dashboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES dakinis_auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- F1 demo seed — Hub Mi día KPIs for Heladería Copérnico
-- Requires: provision_heladeria_copernico.sql + provision_heladeria_copernico_idp_user.sql
-- User: admin@heladeria-copernico.local → c0ce0000-0000-4000-8000-00000000c0ce
-- Idempotent: deletes prior pilot_seed rows for this user, then inserts fresh demo events.

DO $$
DECLARE
  v_user_id uuid := 'c0ce0000-0000-4000-8000-00000000c0ce';
  v_tenant_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dakinis_auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Copérnico IdP user missing — run provision_heladeria_copernico_idp_user.sql first';
  END IF;

  SELECT t.id INTO v_tenant_id
  FROM core.tenants t
  WHERE lower(t.slug) = 'heladeria-copernico'
  LIMIT 1;

  DELETE FROM hub.timeline
  WHERE user_id = v_user_id
    AND coalesce(payload->>'source', '') = 'pilot_seed';

  INSERT INTO hub.timeline (user_id, tenant_id, event_type, title, payload, occurred_at)
  VALUES
    (
      v_user_id,
      v_tenant_id,
      'sale.completed',
      'Venta mostrador — helados',
      jsonb_build_object(
        'amount', 186.5,
        'currency', 'EUR',
        'product', 'core',
        'source', 'pilot_seed',
        'label', 'Ticket #1042'
      ),
      now() - interval '45 minutes'
    ),
    (
      v_user_id,
      v_tenant_id,
      'sale.completed',
      'Venta delivery',
      jsonb_build_object(
        'amount', 42,
        'currency', 'EUR',
        'product', 'core',
        'source', 'pilot_seed',
        'label', 'Glovo #88'
      ),
      now() - interval '2 hours'
    ),
    (
      v_user_id,
      v_tenant_id,
      'order.pending',
      'Pedido pendiente cocina',
      jsonb_build_object(
        'status', 'pending',
        'product', 'core',
        'source', 'pilot_seed',
        'label', 'Mesa 4 · 3 líneas'
      ),
      now() - interval '20 minutes'
    ),
    (
      v_user_id,
      v_tenant_id,
      'order.pending',
      'Pedido delivery pendiente',
      jsonb_build_object(
        'status', 'pending',
        'product', 'core',
        'source', 'pilot_seed',
        'label', 'Uber #12'
      ),
      now() - interval '35 minutes'
    ),
    (
      v_user_id,
      v_tenant_id,
      'stock.low',
      'Stock bajo — vainilla',
      jsonb_build_object(
        'product', 'core',
        'source', 'pilot_seed',
        'sku', 'vainilla-5l',
        'label', 'Vainilla 5L'
      ),
      now() - interval '3 hours'
    ),
    (
      v_user_id,
      v_tenant_id,
      'appointment.created',
      'Reserva catering',
      jsonb_build_object(
        'product', 'core',
        'source', 'pilot_seed',
        'label', 'Catering 18:00'
      ),
      date_trunc('day', now() AT TIME ZONE 'UTC') + interval '10 hours'
    );

  RAISE NOTICE 'Copérnico Hub timeline seeded for % (tenant %)', v_user_id, v_tenant_id;
END $$;

-- Smoke: expect sales > 0, pending orders ≥ 1, low stock ≥ 1
SELECT
  hub.v1_get_dashboard('c0ce0000-0000-4000-8000-00000000c0ce'::uuid)
    -> 'core_sales_today' AS core_sales_today,
  hub.v1_get_dashboard('c0ce0000-0000-4000-8000-00000000c0ce'::uuid)
    -> 'core_orders_pending' AS core_orders_pending,
  hub.v1_get_dashboard('c0ce0000-0000-4000-8000-00000000c0ce'::uuid)
    -> 'core_low_stock_count' AS core_low_stock_count,
  hub.v1_get_dashboard('c0ce0000-0000-4000-8000-00000000c0ce'::uuid)
    -> 'core_appointments_today' AS core_appointments_today,
  hub.v1_get_dashboard('c0ce0000-0000-4000-8000-00000000c0ce'::uuid)
    -> 'lifeflow_score' AS lifeflow_score;

import { query } from "../lib/db.js";

/**
 * @param {{ status?: string, plan?: string, limit?: number, offset?: number }} [filters]
 */
export async function listWorkspaces(filters = {}) {
  const limit = Math.min(Number(filters.limit) || 50, 200);
  const offset = Number(filters.offset) || 0;
  const params = [];
  const where = [];

  if (filters.status) {
    params.push(filters.status);
    where.push(`w.status = $${params.length}`);
  }
  if (filters.plan) {
    params.push(filters.plan);
    where.push(`w.plan = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT w.id, w.name, w.slug, w.plan, w.status, w.created_at,
            (SELECT count(*)::int FROM meta.workspace_members m
             WHERE m.workspace_id = w.id AND m.status = 'active') AS member_count
     FROM meta.workspaces w
     ${whereSql}
     ORDER BY w.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const { rows: countRows } = await query(
    `SELECT count(*)::int AS total FROM meta.workspaces w ${whereSql}`,
    params
  );

  return { items: rows, total: countRows[0]?.total ?? rows.length, limit, offset };
}

/**
 * @param {string} workspaceId
 */
export async function getWorkspaceDetail(workspaceId) {
  const { rows } = await query(
    `SELECT w.*,
            s.stripe_customer_id, s.stripe_subscription_id, s.status AS subscription_status,
            s.current_period_end
     FROM meta.workspaces w
     LEFT JOIN meta.subscriptions s ON s.workspace_id = w.id AND s.status = 'active'
     WHERE w.id = $1::uuid
     LIMIT 1`,
    [workspaceId]
  );
  return rows[0] ?? null;
}

/**
 * @param {string} workspaceId
 * @param {string} status
 * @param {string} [reason]
 * @param {string} [actorId]
 */
export async function setWorkspaceStatus(workspaceId, status, reason, actorId) {
  const { rows } = await query(
    `UPDATE meta.workspaces
     SET status = $2,
         suspended_at = CASE WHEN $2 = 'suspended' THEN now() ELSE suspended_at END,
         suspension_reason = CASE WHEN $2 = 'suspended' THEN $3 ELSE suspension_reason END,
         updated_at = now()
     WHERE id = $1::uuid
     RETURNING id, name, slug, status, suspended_at, suspension_reason`,
    [workspaceId, status, reason || null]
  );
  if (!rows[0]) throw new Error("workspace_not_found");

  await query(
    `SELECT meta.log_audit($1::uuid, $2, 'workspace', $3,
      jsonb_build_object('status', $4, 'reason', $5), '{}'::jsonb, $3::uuid, 'internal-api')`,
    [actorId || null, `workspace.${status}`, workspaceId, status, reason || null]
  ).catch(() => {});

  return rows[0];
}

/**
 * Revenue dashboard stub — agrega meta.subscriptions + invoices
 */
export async function getRevenueDashboard() {
  const [plans, invoices, subs] = await Promise.all([
    query(
      `SELECT plan, count(*)::int AS workspaces
       FROM meta.workspaces
       WHERE status IN ('active', 'trial', 'payment_failed')
       GROUP BY plan ORDER BY plan`
    ),
    query(
      `SELECT coalesce(sum(amount_cents), 0)::int AS paid_cents_30d,
              count(*) FILTER (WHERE status = 'paid')::int AS paid_count,
              count(*) FILTER (WHERE status IN ('open', 'past_due'))::int AS open_count
       FROM meta.invoices
       WHERE created_at > now() - interval '30 days'`
    ),
    query(
      `SELECT count(*)::int AS active_subscriptions
       FROM meta.subscriptions WHERE status = 'active'`
    ),
  ]);

  return {
    plans: plans.rows,
    invoices30d: invoices.rows[0] ?? {},
    activeSubscriptions: subs.rows[0]?.active_subscriptions ?? 0,
    mrrCents: null,
    note: "MRR requiere sync Stripe → meta.subscriptions (post Billing E2E)",
  };
}

/**
 * @param {{ limit?: number }} [opts]
 */
export async function listAuditLogs(opts = {}) {
  const limit = Math.min(Number(opts.limit) || 50, 200);
  const { rows } = await query(
    `SELECT id, user_id, user_email, action, resource_type, resource_id,
            workspace_id, service, created_at
     FROM meta.audit_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function listFeatureFlags() {
  const { rows } = await query(
    `SELECT id, flag_key, name, enabled, description, scope, tenant_id,
            rollout_percentage, target_workspaces, target_plans, updated_at
     FROM meta.feature_flags
     ORDER BY flag_key`
  );
  return rows;
}

/**
 * @param {string} flagKey
 * @param {boolean} enabled
 * @param {string} [actorId]
 */
export async function setFeatureFlag(flagKey, enabled, actorId) {
  const { rows } = await query(
    `UPDATE meta.feature_flags
     SET enabled = $2, updated_at = now(), updated_by = $3::uuid
     WHERE flag_key = $1
     RETURNING id, flag_key, enabled, rollout_percentage`,
    [flagKey, enabled, actorId || null]
  );
  if (!rows[0]) throw new Error("flag_not_found");
  return rows[0];
}

export async function getPlatformOverview() {
  const [workspaces, users, incidents, health] = await Promise.all([
    query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE status = 'active')::int AS active,
              count(*) FILTER (WHERE status = 'trial')::int AS trial,
              count(*) FILTER (WHERE status = 'payment_failed')::int AS payment_failed
       FROM meta.workspaces`
    ),
    query(`SELECT count(*)::int AS total FROM dakinis_auth.users WHERE is_disabled IS NOT TRUE`),
    query(
      `SELECT count(*)::int AS open
       FROM meta.incidents WHERE status <> 'resolved'`
    ).catch(() => ({ rows: [{ open: 0 }] })),
    query(
      `SELECT avg(score)::int AS avg_health
       FROM meta.customer_health_scores
       WHERE calculated_at > now() - interval '7 days'`
    ).catch(() => ({ rows: [{ avg_health: null }] })),
  ]);

  return {
    workspaces: workspaces.rows[0],
    users: users.rows[0],
    openIncidents: incidents.rows[0]?.open ?? 0,
    avgHealthScore: health.rows[0]?.avg_health ?? null,
  };
}

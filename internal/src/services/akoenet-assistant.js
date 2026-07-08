import { createDefaultOrchestrator, PermissionsEngine } from "../../packages/akoenet-orchestrator/src/index.js";
import { invokeModule } from "../../packages/akoenet-modules/src/index.js";
import { createAkoeNetEvent, resolveModulesForEvent } from "../../packages/akoenet-orchestrator/src/events.js";
import { query } from "../lib/db.js";

let orchestratorSingleton = null;

function getOrchestrator() {
  if (!orchestratorSingleton) {
    orchestratorSingleton = createDefaultOrchestrator({
      permissionsEngine: new PermissionsEngine({
        isSuperAdmin: async (userId) => {
          const { rows } = await query(
            `SELECT is_super_admin FROM dakinis_auth.users WHERE id = $1::uuid LIMIT 1`,
            [userId]
          );
          return Boolean(rows[0]?.is_super_admin);
        },
        isServerOwner: async (userId, serverId) => {
          const { rows } = await query(
            `SELECT 1 FROM akoenet.servers WHERE id = $1::bigint AND owner_id = $2::uuid LIMIT 1`,
            [serverId, userId]
          );
          return Boolean(rows[0]);
        },
        getUserPermissions: async () => [],
      }),
    });
  }
  return orchestratorSingleton;
}

export async function listAssistantModules() {
  const { rows } = await query(
    `SELECT key, name, description, category, version, capabilities, default_config,
            requires_plan, phase
     FROM akoenet.assistant_modules
     ORDER BY
       CASE phase WHEN 'mvp' THEN 0 WHEN 'growth' THEN 1 ELSE 2 END,
       category, key`
  );
  return rows;
}

export async function getServerModules(serverId) {
  const { rows } = await query(
    `SELECT sm.id, sm.module_key, sm.enabled, sm.config, sm.activated_at,
            am.name, am.category, am.capabilities, am.phase
     FROM akoenet.server_modules sm
     JOIN akoenet.assistant_modules am ON am.key = sm.module_key
     WHERE sm.server_id = $1::bigint
     ORDER BY am.category, am.key`,
    [serverId]
  );
  return rows;
}

export async function getActiveModuleKeys(serverId) {
  const { rows } = await query(
    `SELECT module_key FROM akoenet.server_modules
     WHERE server_id = $1::bigint AND enabled = true`,
    [serverId]
  );
  return rows.map((r) => r.module_key);
}

/**
 * @param {string|number} serverId
 * @param {string} moduleKey
 * @param {{ enabled?: boolean; config?: object; actorId?: string }} input
 */
export async function upsertServerModule(serverId, moduleKey, input) {
  const enabled = input.enabled !== false;
  const config = input.config ?? {};

  const { rows } = await query(
    `INSERT INTO akoenet.server_modules (server_id, module_key, enabled, config, activated_at)
     VALUES ($1::bigint, $2, $3, $4::jsonb, now())
     ON CONFLICT (server_id, module_key) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       config = akoenet.server_modules.config || EXCLUDED.config,
       deactivated_at = CASE WHEN EXCLUDED.enabled THEN NULL ELSE now() END,
       updated_at = now()
     RETURNING id, server_id, module_key, enabled, config, activated_at`,
    [serverId, moduleKey, enabled, JSON.stringify(config)]
  );

  return rows[0];
}

/**
 * @param {{ action: string; serverId: string|number; userId?: string; channelId?: string; payload?: object; type?: string }} command
 */
export async function routeAssistantCommand(command) {
  const orchestrator = getOrchestrator();
  const active = await getActiveModuleKeys(command.serverId);
  orchestrator.setActiveModules(active);

  return orchestrator.route(command, async (moduleId, enriched) => {
    const result = await invokeModule(moduleId, enriched);
    if (enriched.action?.startsWith("moderation.")) {
      await logModeration({
        serverId: command.serverId,
        channelId: command.channelId,
        actorUserId: command.userId,
        targetUserId: command.payload?.targetUserId,
        action: enriched.action,
        reason: command.payload?.reason,
        metadata: { moduleId, result },
      }).catch(() => {});
    }
    return result;
  });
}

/**
 * @param {{ type: string; serverId: string|number; source?: string; data?: object; metadata?: object }} eventInput
 */
export async function dispatchAssistantEvent(eventInput) {
  const event = createAkoeNetEvent({
    type: eventInput.type,
    source: eventInput.source || "internal-api",
    data: eventInput.data || {},
    metadata: {
      serverId: eventInput.serverId,
      ...eventInput.metadata,
    },
  });

  await query(
    `INSERT INTO akoenet.assistant_events (server_id, event_type, source, payload, metadata)
     VALUES ($1::bigint, $2, $3, $4::jsonb, $5::jsonb)`,
    [
      eventInput.serverId,
      event.type,
      event.source,
      JSON.stringify(event.data),
      JSON.stringify(event.metadata),
    ]
  ).catch(() => {});

  const active = await getActiveModuleKeys(eventInput.serverId);
  const moduleIds = resolveModulesForEvent(event.type, active, {});

  const results = [];
  for (const moduleId of moduleIds) {
    const result = await invokeModule(moduleId, {
      action: event.type,
      type: "event",
      serverId: eventInput.serverId,
      payload: { event },
    });
    results.push({ moduleId, result });
  }

  return { event, modules: moduleIds, results };
}

export async function logModeration(input) {
  const { rows } = await query(
    `INSERT INTO akoenet.moderation_logs
       (server_id, channel_id, actor_user_id, target_user_id, action, reason, metadata)
     VALUES ($1::bigint, $2::bigint, $3::uuid, $4::uuid, $5, $6, $7::jsonb)
     RETURNING id, created_at`,
    [
      input.serverId,
      input.channelId ?? null,
      input.actorUserId ?? null,
      input.targetUserId ?? null,
      input.action,
      input.reason ?? null,
      JSON.stringify(input.metadata ?? {}),
    ]
  );
  return rows[0];
}

export async function logAssistantUsage(input) {
  const { rows } = await query(
    `INSERT INTO akoenet.assistant_usage
       (server_id, module_key, user_id, tokens_input, tokens_output, cost_cents, endpoint, metadata)
     VALUES ($1::bigint, $2, $3::uuid, $4, $5, $6, $7, $8::jsonb)
     RETURNING id`,
    [
      input.serverId,
      input.moduleKey,
      input.userId ?? null,
      input.tokensInput ?? null,
      input.tokensOutput ?? null,
      input.costCents ?? null,
      input.endpoint ?? null,
      JSON.stringify(input.metadata ?? {}),
    ]
  );
  return rows[0];
}

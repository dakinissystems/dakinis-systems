import { DomainError, Email, UserId, canAcceptInvite } from "@dakinis/domain";
import { OutboxPublisher } from "@dakinis/shared-db/outbox";
import { publishDomainEvents } from "@dakinis/shared-db/outbox/domain-events";
import { query, withTransaction } from "../lib/db.js";
import { invalidateUserBffCache } from "../lib/cache.js";
import { PostgresWorkspaceInviteRepository } from "./workspace-invite-repository.js";

const repo = new PostgresWorkspaceInviteRepository();
const outbox = new OutboxPublisher(query);

/**
 * Map domain errors to legacy Error codes used by routes.
 * @param {unknown} err
 */
function toServiceError(err) {
  if (err instanceof DomainError) {
    return new Error(err.code);
  }
  return err instanceof Error ? err : new Error("db_error");
}

/**
 * Thin facade — FOR UPDATE lock → policy → aggregate.accept → outbox → persist member.
 * @param {string} token
 * @param {{ userId: string; ctx?: object }} input
 */
export async function acceptInviteViaFacade(token, input) {
  const userId = String(input.userId || "").trim();
  if (!userId) throw new Error("user_id_required");

  try {
    const result = await withTransaction(async (client) => {
      const invite = await repo.findByToken(token, { forUpdate: true, client });
      if (!invite) throw new DomainError("invite_not_found");

      const { rows: userRows } = await client.query(
        `SELECT id, email FROM dakinis_auth.users WHERE id = $1::uuid LIMIT 1`,
        [userId]
      );
      const user = userRows[0];
      if (!user) throw new DomainError("user_not_found");

      if (
        !canAcceptInvite({
          inviteEmail: invite.email.value,
          userEmail: user.email,
        })
      ) {
        throw new DomainError("email_mismatch", "Invite email does not match user");
      }

      const userEmail = Email.from(user.email);
      invite.accept(UserId.from(userId), userEmail);

      const { rows: memberRows } = await client.query(
        `INSERT INTO meta.workspace_members (
           workspace_id, user_id, role, invited_by, invited_at, accepted_at, status
         )
         VALUES (
           $1::uuid, $2::uuid, $3,
           (SELECT invited_by FROM meta.workspace_invites WHERE id = $4::uuid),
           now(), now(), 'active'
         )
         ON CONFLICT (workspace_id, user_id) DO UPDATE SET
           role = EXCLUDED.role,
           status = 'active',
           accepted_at = coalesce(meta.workspace_members.accepted_at, now()),
           updated_at = now()
         RETURNING id, user_id, role, status, accepted_at`,
        [invite.workspaceId.value, userId, invite.role.value, invite.id]
      );

      await repo.save(invite, client);

      const events = invite.pullDomainEvents();
      const traceId = input.ctx?.traceId ?? null;
      for (const event of events) {
        if (traceId) event.traceId = traceId;
        if (event.type === "invite.accepted") {
          await client
            .query(
              `SELECT meta.log_audit($1::uuid, 'workspace.member.accepted', 'workspace_member', $2,
                jsonb_build_object('role', $3, 'invite_id', $4, 'trace_id', $5), '{}'::jsonb, $6::uuid, 'internal-api')`,
              [
                userId,
                memberRows[0]?.id,
                invite.role.value,
                invite.id,
                traceId,
                invite.workspaceId.value,
              ]
            )
            .catch(() => {});
        }
      }

      const txQuery = (text, params) => client.query(text, params);
      await publishDomainEvents(outbox, events, txQuery);

      return {
        member: memberRows[0] ?? null,
        workspaceId: invite.workspaceId.value,
        role: invite.role.value,
      };
    });

    await invalidateUserBffCache(userId).catch(() => {});
    return result;
  } catch (err) {
    throw toServiceError(err);
  }
}

/**
 * List invites with domain status for workspace admin UI.
 * @param {string} workspaceId
 */
export async function listWorkspaceInvites(workspaceId) {
  const rows = await repo.findByWorkspace(workspaceId);
  return {
    items: rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      createdAt: row.createdAt,
      token: row.token,
    })),
  };
}

export { PostgresWorkspaceInviteRepository };

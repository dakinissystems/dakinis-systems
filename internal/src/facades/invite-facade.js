import { DomainError, Email, UserId } from "@dakinis/domain";
import { query } from "../lib/db.js";
import { PostgresWorkspaceInviteRepository } from "./workspace-invite-repository.js";

const repo = new PostgresWorkspaceInviteRepository();

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
 * Thin facade — repo.find → aggregate.accept → repo.save → persist member.
 * @param {string} token
 * @param {{ userId: string; ctx?: import("@dakinis/shared-platform/platform-context").ReturnType<import("@dakinis/shared-platform/platform-context").createPlatformContext> }} input
 */
export async function acceptInviteViaFacade(token, input) {
  const userId = String(input.userId || "").trim();
  if (!userId) throw new Error("user_id_required");

  try {
    const invite = await repo.findByToken(token);
    if (!invite) throw new DomainError("invite_not_found");

    const { rows: userRows } = await query(
      `SELECT id, email FROM dakinis_auth.users WHERE id = $1::uuid LIMIT 1`,
      [userId]
    );
    const user = userRows[0];
    if (!user) throw new DomainError("user_not_found");

    const userEmail = Email.from(user.email);
    invite.accept(UserId.from(userId), userEmail);

    const { rows: memberRows } = await query(
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

    await repo.save(invite);

    const events = invite.pullDomainEvents();
    const traceId = input.ctx?.traceId ?? null;
    for (const event of events) {
      if (event.type === "invite.accepted") {
        await query(
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
        ).catch(() => {});
      }
    }

    return {
      member: memberRows[0] ?? null,
      workspaceId: invite.workspaceId.value,
      role: invite.role.value,
    };
  } catch (err) {
    throw toServiceError(err);
  }
}

export { PostgresWorkspaceInviteRepository };

import { query } from "../lib/db.js";
import { WorkspaceInvite } from "@dakinis/domain/invite";

/**
 * Postgres adapter for WorkspaceInvite aggregate.
 */
export class PostgresWorkspaceInviteRepository {
  /**
   * @param {WorkspaceInvite} invite
   */
  async save(invite) {
    const row = invite.toPersistence();
    if (row.status === "accepted" && row.usedAt) {
      await query(
        `UPDATE meta.workspace_invites SET used_at = $2 WHERE id = $1::uuid AND used_at IS NULL`,
        [row.id, row.usedAt]
      );
    }
  }

  /**
   * @param {string} token
   * @returns {Promise<WorkspaceInvite | null>}
   */
  async findByToken(token) {
    const { rows } = await query(
      `SELECT id, workspace_id, email, role, token, invited_by, expires_at, used_at
       FROM meta.workspace_invites
       WHERE token = $1
       LIMIT 1`,
      [String(token || "").trim()]
    );
    const row = rows[0];
    if (!row) return null;
    return WorkspaceInvite.reconstitute({
      id: row.id,
      token: row.token,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      invitedBy: row.invited_by,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
    });
  }

  /**
   * @param {string} workspaceId
   */
  async findPendingByWorkspace(workspaceId) {
    const { rows } = await query(
      `SELECT id, workspace_id, email, role, token, invited_by, expires_at, used_at
       FROM meta.workspace_invites
       WHERE workspace_id = $1::uuid AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC`,
      [workspaceId]
    );
    return rows.map((row) =>
      WorkspaceInvite.reconstitute({
        id: row.id,
        token: row.token,
        workspaceId: row.workspace_id,
        email: row.email,
        role: row.role,
        invitedBy: row.invited_by,
        expiresAt: row.expires_at,
        usedAt: row.used_at,
      })
    );
  }
}

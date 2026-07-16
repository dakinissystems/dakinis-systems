import { query } from "../lib/db.js";
import { WorkspaceInvite } from "@dakinis/domain/invite";

/**
 * @param {import("pg").PoolClient | null} client
 * @param {string} text
 * @param {unknown[]} [params]
 */
async function run(client, text, params = []) {
  if (client) return client.query(text, params);
  return query(text, params);
}

/**
 * Postgres adapter for WorkspaceInvite aggregate.
 */
export class PostgresWorkspaceInviteRepository {
  /**
   * @param {WorkspaceInvite} invite
   * @param {import("pg").PoolClient} [client]
   */
  async save(invite, client = null) {
    const row = invite.toPersistence();
    if (row.status === "accepted" && row.usedAt) {
      await run(
        client,
        `UPDATE meta.workspace_invites SET used_at = $2 WHERE id = $1::uuid AND used_at IS NULL`,
        [row.id, row.usedAt]
      );
    }
  }

  /**
   * @param {string} token
   * @param {{ forUpdate?: boolean; client?: import("pg").PoolClient | null }} [opts]
   * @returns {Promise<WorkspaceInvite | null>}
   */
  async findByToken(token, opts = {}) {
    const forUpdate = opts.forUpdate === true;
    const client = opts.client ?? null;
    const lock = forUpdate ? " FOR UPDATE" : "";
    const { rows } = await run(
      client,
      `SELECT id, workspace_id, email, role, token, invited_by, expires_at, used_at
       FROM meta.workspace_invites
       WHERE token = $1
       LIMIT 1${lock}`,
      [String(token || "").trim()]
    );
    const row = rows[0];
    if (!row) return null;
    return this.#fromRow(row);
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
    return rows.map((row) => this.#fromRow(row));
  }

  /**
   * Pending + expired + recently accepted for admin status panel.
   * @param {string} workspaceId
   * @param {{ limit?: number }} [opts]
   */
  async findByWorkspace(workspaceId, opts = {}) {
    const limit = Math.min(Number(opts.limit) || 50, 100);
    const { rows } = await query(
      `SELECT id, workspace_id, email, role, token, invited_by, expires_at, used_at, created_at
       FROM meta.workspace_invites
       WHERE workspace_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT $2`,
      [workspaceId, limit]
    );
    return rows.map((row) => {
      const invite = this.#fromRow(row);
      return {
        ...invite.toPersistence(),
        createdAt: row.created_at,
      };
    });
  }

  /**
   * @param {object} row
   * @private
   */
  #fromRow(row) {
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
}

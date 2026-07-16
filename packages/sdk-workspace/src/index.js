import { createInternalClient } from "@dakinis/sdk-auth";

/**
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export function createWorkspaceModule(opts = {}) {
  const client = createInternalClient(opts);

  return {
    catalog() {
      return client.request("/workspace-addons/catalog");
    },

    /** @param {string} workspaceId */
    addons(workspaceId) {
      return client.request(`/workspaces/${encodeURIComponent(workspaceId)}/addons`);
    },

    /**
     * @param {string} workspaceId
     * @param {string} key
     * @param {{ enabled?: boolean; pinned?: boolean; config?: object }} body
     */
    upsertAddon(workspaceId, key, body) {
      return client.request(
        `/workspaces/${encodeURIComponent(workspaceId)}/addons/${encodeURIComponent(key)}`,
        { method: "PUT", body: JSON.stringify(body) }
      );
    },

    /** @param {string} workspaceId */
    enableAllAddons(workspaceId) {
      return client.request(`/workspaces/${encodeURIComponent(workspaceId)}/addons/enable-all`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },

    /**
     * @param {string} userId
     * @param {{ fresh?: boolean }} [opts]
     */
    summary(userId, queryOpts = {}) {
      const qs = queryOpts.fresh ? "?fresh=1" : "";
      return client.request(`/workspace/summary/${encodeURIComponent(userId)}${qs}`);
    },

    /**
     * @param {string} workspaceId
     * @param {{ email: string; role?: string; invitedBy?: string }} body
     */
    inviteMember(workspaceId, body) {
      return client.request(`/workspaces/${encodeURIComponent(workspaceId)}/members/invite`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    /**
     * @param {string} token
     * @param {{ userId: string }} body
     */
    acceptInvite(token, body) {
      return client.request(`/workspaces/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    /** @param {string} workspaceId */
    members(workspaceId) {
      return client.request(`/workspaces/${encodeURIComponent(workspaceId)}/members`);
    },

    /** @param {string} workspaceId */
    get(workspaceId) {
      return client.request(`/workspaces/${encodeURIComponent(workspaceId)}`);
    },
  };
}

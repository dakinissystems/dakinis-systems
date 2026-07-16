/** Auto-generated from docs/contracts/internal-api.json — do not edit by hand. */
export const InternalApiService = "dakinis-internal-api" as const;
export const InternalApiBaseUrl = "https://api.dakinissystems.com/internal" as const;

export type InternalApiRoute =
  | { key: "GET /internal/health"; description: "Health del servicio internal" } |
  | { key: "GET /internal/users/:id"; description: "Perfil mínimo usuario (IdP)" } |
  | { key: "GET /internal/profile/:userId"; description: "Preferencias cross-producto" } |
  | { key: "GET /internal/hub/dashboard/:userId"; description: "Dashboard Hub — secciones, apps, resumen" } |
  | { key: "GET /internal/hub/dashboard/aggregated/:userId"; description: "BFF Hub dashboard — cache Redis 30s + notifications fan-out" } |
  | { key: "GET /internal/workspace/summary/:userId"; description: "BFF workspace summary — addons, profiles, plan" } |
  | { key: "GET /internal/platform/health"; description: "BFF platform health — DB, Redis, bus probes (cache 15s)" } |
  | { key: "GET /internal/feature-flags/evaluate"; description: "Evaluar flags batch (query keys, userId, workspaceId)" } |
  | { key: "GET /internal/platform/metrics"; description: "Métricas platform — health probes, Railway, event bus" } |
  | { key: "GET /internal/workspaces/me/:userId/data/:addonKey"; description: "Sync addon content (kanban, calendar, notes, code-editor)" } |
  | { key: "PUT /internal/workspaces/me/:userId/data/:addonKey"; description: "Save addon content blob" } |
  | { key: "POST /internal/events"; description: "Publicar evento al bus platform" } |
  | { key: "GET /internal/events"; description: "Suscripción / replay (admin)" } |
  | { key: "POST /internal/storage/upload-url"; description: "Presigned upload URL → Storage (Supabase / R2)" } |
  | { key: "GET /internal/storage/:objectId"; description: "Signed read URL" } |
  | { key: "POST /internal/search"; description: "Global search (query + scopes)" } |
  | { key: "POST /internal/knowledge/query"; description: "Proxy → Knowledge /v1/query" } |
  | { key: "POST /internal/notifications/send"; description: "Encolar notificación multi-canal" } |
  | { key: "GET /internal/workspaces/:id"; description: "Workspace Admin — detalle (migr. 031)" } |
  | { key: "GET /internal/workspaces/:id/members"; description: "Workspace Admin — miembros" } |
  | { key: "POST /internal/workspaces/:id/members/invite"; description: "Workspace Admin — invitar" } |
  | { key: "POST /internal/workspaces/invites/:token/accept"; description: "Aceptar invitación de workspace por token" } |
  | { key: "GET /internal/admin/v1/overview"; description: "Super Admin — panorama platform" } |
  | { key: "GET /internal/admin/v1/workspaces"; description: "Super Admin — listar workspaces" } |
  | { key: "GET /internal/admin/v1/audit"; description: "Super Admin — audit timeline" };

export interface InternalApiPaths {
  /** GET /internal/health */
  get_internal_health: (params: Record<string, never>) => string;
  /** GET /internal/users/:id */
  get_internal_users_id: (params: { id: string }) => string;
  /** GET /internal/profile/:userId */
  get_internal_profile_userId: (params: { userId: string }) => string;
  /** GET /internal/hub/dashboard/:userId */
  get_internal_hub_dashboard_userId: (params: { userId: string }) => string;
  /** GET /internal/hub/dashboard/aggregated/:userId */
  get_internal_hub_dashboard_aggregated_userId: (params: { userId: string }) => string;
  /** GET /internal/workspace/summary/:userId */
  get_internal_workspace_summary_userId: (params: { userId: string }) => string;
  /** GET /internal/platform/health */
  get_internal_platform_health: (params: Record<string, never>) => string;
  /** GET /internal/feature-flags/evaluate */
  get_internal_feature_flags_evaluate: (params: Record<string, never>) => string;
  /** GET /internal/platform/metrics */
  get_internal_platform_metrics: (params: Record<string, never>) => string;
  /** GET /internal/workspaces/me/:userId/data/:addonKey */
  get_internal_workspaces_me_userId_data_addonKey: (params: { userId: string; addonKey: string }) => string;
  /** PUT /internal/workspaces/me/:userId/data/:addonKey */
  put_internal_workspaces_me_userId_data_addonKey: (params: { userId: string; addonKey: string }) => string;
  /** POST /internal/events */
  post_internal_events: (params: Record<string, never>) => string;
  /** GET /internal/events */
  get_internal_events: (params: Record<string, never>) => string;
  /** POST /internal/storage/upload-url */
  post_internal_storage_upload_url: (params: Record<string, never>) => string;
  /** GET /internal/storage/:objectId */
  get_internal_storage_objectId: (params: { objectId: string }) => string;
  /** POST /internal/search */
  post_internal_search: (params: Record<string, never>) => string;
  /** POST /internal/knowledge/query */
  post_internal_knowledge_query: (params: Record<string, never>) => string;
  /** POST /internal/notifications/send */
  post_internal_notifications_send: (params: Record<string, never>) => string;
  /** GET /internal/workspaces/:id */
  get_internal_workspaces_id: (params: { id: string }) => string;
  /** GET /internal/workspaces/:id/members */
  get_internal_workspaces_id_members: (params: { id: string }) => string;
  /** POST /internal/workspaces/:id/members/invite */
  post_internal_workspaces_id_members_invite: (params: { id: string }) => string;
  /** POST /internal/workspaces/invites/:token/accept */
  post_internal_workspaces_invites_token_accept: (params: { token: string }) => string;
  /** GET /internal/admin/v1/overview */
  get_internal_admin_v1_overview: (params: Record<string, never>) => string;
  /** GET /internal/admin/v1/workspaces */
  get_internal_admin_v1_workspaces: (params: Record<string, never>) => string;
  /** GET /internal/admin/v1/audit */
  get_internal_admin_v1_audit: (params: Record<string, never>) => string;
}

export const InternalApiPathBuilders: InternalApiPaths = {
  get_internal_health: () => "/internal/health",
  get_internal_users_id: (params) => "/internal/users/:id".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_profile_userId: (params) => "/internal/profile/:userId".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_hub_dashboard_userId: (params) => "/internal/hub/dashboard/:userId".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_hub_dashboard_aggregated_userId: (params) => "/internal/hub/dashboard/aggregated/:userId".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_workspace_summary_userId: (params) => "/internal/workspace/summary/:userId".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_platform_health: () => "/internal/platform/health",
  get_internal_feature_flags_evaluate: () => "/internal/feature-flags/evaluate",
  get_internal_platform_metrics: () => "/internal/platform/metrics",
  get_internal_workspaces_me_userId_data_addonKey: (params) => "/internal/workspaces/me/:userId/data/:addonKey".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  put_internal_workspaces_me_userId_data_addonKey: (params) => "/internal/workspaces/me/:userId/data/:addonKey".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  post_internal_events: () => "/internal/events",
  get_internal_events: () => "/internal/events",
  post_internal_storage_upload_url: () => "/internal/storage/upload-url",
  get_internal_storage_objectId: (params) => "/internal/storage/:objectId".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  post_internal_search: () => "/internal/search",
  post_internal_knowledge_query: () => "/internal/knowledge/query",
  post_internal_notifications_send: () => "/internal/notifications/send",
  get_internal_workspaces_id: (params) => "/internal/workspaces/:id".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_workspaces_id_members: (params) => "/internal/workspaces/:id/members".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  post_internal_workspaces_id_members_invite: (params) => "/internal/workspaces/:id/members/invite".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  post_internal_workspaces_invites_token_accept: (params) => "/internal/workspaces/invites/:token/accept".replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),
  get_internal_admin_v1_overview: () => "/internal/admin/v1/overview",
  get_internal_admin_v1_workspaces: () => "/internal/admin/v1/workspaces",
  get_internal_admin_v1_audit: () => "/internal/admin/v1/audit",
};

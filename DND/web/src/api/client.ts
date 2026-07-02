import type { Character } from "../types/character";
import type {
  CampaignDetail,
  CampaignItem,
  CampaignNote,
  CampaignSummary,
  TabletopUser,
} from "../types/campaign";
import { readStoredAuthToken } from "../lib/auth-storage";

function normalizeApiBase(raw: string | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, "");
  return `https://${value.replace(/\/+$/, "")}`;
}

/** VITE_TABLETOP_API_URL (canónico) · VITE_API_URL (alias Finanzas) */
function resolveApiBase(): string {
  const raw =
    import.meta.env.VITE_TABLETOP_API_URL ??
    import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_DND_API_URL ??
    "";
  return normalizeApiBase(raw);
}

const API_BASE = resolveApiBase();

export function tabletopApiBase(): string {
  return API_BASE;
}

let authToken: string | null = null;

export function tabletopSetToken(token: string | null) {
  authToken = token;
}

/** @deprecated alias interno */
export const dndSetToken = tabletopSetToken;

export function tabletopApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

/** @deprecated alias interno */
export const dndApiUrl = tabletopApiUrl;

async function tabletopFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE && path.startsWith("/api")) {
    throw new Error(
      "API no configurada en el build. Añade VITE_TABLETOP_API_URL=https://tabletop-api.dakinissystems.com y redeploy.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(tabletopApiUrl(path), { ...init, headers });
  } catch {
    throw new Error("No se pudo conectar con la API. Comprueba la red o la URL del servidor.");
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    throw new Error(data.error || data.message || `Error ${res.status}`);
  }

  if (!isJson && contentType.includes("text/html")) {
    throw new Error(
      "La web no alcanza la API (respuesta HTML). Revisa VITE_TABLETOP_API_URL y redeploy.",
    );
  }

  return data as T;
}

function assertAuthResponse(data: { user?: TabletopUser; token?: string }) {
  if (!data?.user?.id || !data?.token) {
    throw new Error("Respuesta inválida del servidor. Revisa VITE_TABLETOP_API_URL y redeploy.");
  }
  return data as { user: TabletopUser; token: string };
}

export const tabletopApi = {
  register: async (email: string, password: string, displayName: string) =>
    assertAuthResponse(
      await tabletopFetch<{ user?: TabletopUser; token?: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      }),
    ),

  login: async (email: string, password: string) =>
    assertAuthResponse(
      await tabletopFetch<{ user?: TabletopUser; token?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    ),

  me: () => tabletopFetch<{ user: TabletopUser; token: string }>("/api/auth/me"),

  /** Restaura sesión; null si el token expiró o el JWT secret cambió (401). */
  restoreSession: async (): Promise<{ user: TabletopUser; token: string } | null> => {
    if (!readStoredAuthToken()) return null;
    try {
      return await tabletopFetch<{ user: TabletopUser; token: string }>("/api/auth/me");
    } catch {
      return null;
    }
  },

  getCharacters: () => tabletopFetch<{ characters: Character[] }>("/api/characters"),

  syncCharacters: (characters: Character[]) =>
    tabletopFetch<{ characters: Character[] }>("/api/characters/sync", {
      method: "PUT",
      body: JSON.stringify({ characters }),
    }),

  deleteCharacter: (id: string) =>
    tabletopFetch<{ ok: boolean }>(`/api/characters/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listCampaigns: () => tabletopFetch<{ campaigns: CampaignSummary[] }>("/api/campaigns"),

  createCampaign: (name: string) =>
    tabletopFetch<{ campaign: CampaignDetail }>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  joinCampaign: (inviteCode: string) =>
    tabletopFetch<{ campaign: CampaignDetail }>("/api/campaigns/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    }),

  getCampaign: (id: string) =>
    tabletopFetch<{ campaign: CampaignDetail }>(`/api/campaigns/${encodeURIComponent(id)}`),

  listNotes: (campaignId: string) =>
    tabletopFetch<{ notes: CampaignNote[] }>(`/api/campaigns/${encodeURIComponent(campaignId)}/notes`),

  addNote: (campaignId: string, body: { playedAt: string; title?: string; content: string }) =>
    tabletopFetch<{ note: CampaignNote }>(`/api/campaigns/${encodeURIComponent(campaignId)}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteNote: (campaignId: string, noteId: string) =>
    tabletopFetch<{ ok: boolean }>(
      `/api/campaigns/${encodeURIComponent(campaignId)}/notes/${encodeURIComponent(noteId)}`,
      { method: "DELETE" },
    ),

  listItems: (campaignId: string) =>
    tabletopFetch<{ items: CampaignItem[] }>(`/api/campaigns/${encodeURIComponent(campaignId)}/items`),

  addItem: (
    campaignId: string,
    body: { name: string; category?: string; quantity?: number; description?: string },
  ) =>
    tabletopFetch<{ item: CampaignItem }>(`/api/campaigns/${encodeURIComponent(campaignId)}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteItem: (campaignId: string, itemId: string) =>
    tabletopFetch<{ ok: boolean }>(
      `/api/campaigns/${encodeURIComponent(campaignId)}/items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" },
    ),
};

/** @deprecated alias interno — usar tabletopApi */
export const dndApi = tabletopApi;

export const TABLETOP_SYNC_EVENT = "tabletop-characters-synced";
/** @deprecated escucha legacy */
export const DND_SYNC_EVENT = TABLETOP_SYNC_EVENT;

export function tabletopDispatchCharacterSync(characters: Character[]) {
  window.dispatchEvent(new CustomEvent(TABLETOP_SYNC_EVENT, { detail: characters }));
}

/** @deprecated alias interno */
export const dndDispatchCharacterSync = tabletopDispatchCharacterSync;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Character } from "../types/character";
import type { TabletopUser } from "../types/campaign";
import { tabletopApi, tabletopDispatchCharacterSync, tabletopSetToken } from "../api/client";
import { clearStoredAuthToken, AUTH_TOKEN_KEY, readStoredAuthToken } from "../lib/auth-storage";

const STORAGE_KEY = "dnd5e-characters";

type AuthContextValue = {
  user: TabletopUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<TabletopUser>;
  register: (email: string, password: string, displayName: string) => Promise<TabletopUser>;
  logout: () => void;
  syncCloudCharacters: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadLocalCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Character[];
  } catch {
    /* ignore */
  }
  return [];
}

function asCharacterList(value: unknown): Character[] {
  return Array.isArray(value) ? value : [];
}

function mergeCharacters(local: Character[], remote: Character[]): Character[] {
  const byId = new Map<string, Character>();
  for (const c of asCharacterList(remote)) {
    byId.set(c.id, { ...c, setupComplete: c.setupComplete ?? true, sessionNotes: c.sessionNotes ?? [] });
  }
  for (const c of local) {
    if (!byId.has(c.id)) {
      byId.set(c.id, { ...c, setupComplete: c.setupComplete ?? true, sessionNotes: c.sessionNotes ?? [] });
    }
  }
  return [...byId.values()];
}

async function pullAndMergeCharacters(): Promise<Character[]> {
  const local = loadLocalCharacters();
  const { characters: remoteRaw } = await tabletopApi.getCharacters();
  const merged = mergeCharacters(local, asCharacterList(remoteRaw));
  const { characters: savedRaw } = await tabletopApi.syncCharacters(merged);
  const saved = asCharacterList(savedRaw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TabletopUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncCloudCharacters = useCallback(async () => {
    if (!readStoredAuthToken()) return;
    const saved = await pullAndMergeCharacters();
    tabletopDispatchCharacterSync(saved);
  }, []);

  useEffect(() => {
    const token = readStoredAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    tabletopSetToken(token);
    void tabletopApi
      .restoreSession()
      .then(async (session) => {
        if (!session) {
          clearStoredAuthToken();
          tabletopSetToken(null);
          return;
        }
        const { user: u, token: t } = session;
        setUser(u);
        if (t) {
          localStorage.setItem(AUTH_TOKEN_KEY, t);
          tabletopSetToken(t);
        }
        const saved = await pullAndMergeCharacters();
        tabletopDispatchCharacterSync(saved);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await tabletopApi.login(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    tabletopSetToken(token);
    setUser(u);
    const saved = await pullAndMergeCharacters();
    tabletopDispatchCharacterSync(saved);
    return u;
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { user: u, token } = await tabletopApi.register(email, password, displayName);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    tabletopSetToken(token);
    setUser(u);
    const saved = await pullAndMergeCharacters();
    tabletopDispatchCharacterSync(saved);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuthToken();
    tabletopSetToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, syncCloudCharacters }),
    [user, loading, login, register, logout, syncCloudCharacters],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

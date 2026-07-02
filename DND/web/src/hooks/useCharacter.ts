import { useCallback, useEffect, useRef, useState } from "react";

import type { Character } from "../types/character";

import { EXAMPLE_CHARACTER } from "../data/seed-character";

import { createBlankCharacter } from "../data/character-factory";

import { DND_SYNC_EVENT, dndApi } from "../api/client";
import { readStoredAuthToken } from "../lib/auth-storage";

const STORAGE_KEY = "dnd5e-characters";
const ACTIVE_KEY = "dnd5e-active-character";

function isLoggedIn() {
  return Boolean(readStoredAuthToken());
}



function loadCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Character[];
      if (parsed.length === 0) return [];
      return parsed.map((c) => ({
        ...c,
        setupComplete: c.setupComplete ?? true,
        sessionNotes: c.sessionNotes ?? [],
      }));
    }
  } catch {
    /* ignore */
  }
  return [{ ...structuredClone(EXAMPLE_CHARACTER), setupComplete: true }];
}

function loadActiveId(chars: Character[]): string {
  const id = localStorage.getItem(ACTIVE_KEY);
  if (id && chars.some((c) => c.id === id)) return id;
  return chars[0]?.id ?? "";
}

export function useCharacter() {

  const [characters, setCharacters] = useState<Character[]>(loadCharacters);

  const [activeId, setActiveId] = useState(() => loadActiveId(loadCharacters()));

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);



  const character = characters.find((c) => c.id === activeId) ?? characters[0];



  const scheduleCloudSync = useCallback((next: Character[]) => {

    if (!isLoggedIn()) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);

    syncTimer.current = setTimeout(() => {

      dndApi.syncCharacters(next).catch(() => {

        /* offline — localStorage sigue siendo fuente local */

      });

    }, 800);

  }, []);



  const persist = useCallback(

    (next: Character[]) => {

      setCharacters(next);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      scheduleCloudSync(next);

    },

    [scheduleCloudSync],

  );



  const replaceAllCharacters = useCallback((next: Character[]) => {

    setCharacters(next);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (next.length && !next.some((c) => c.id === activeId)) {

      setActiveId(next[0].id);

      localStorage.setItem(ACTIVE_KEY, next[0].id);

    }

  }, [activeId]);



  useEffect(() => {

    const handler = (e: Event) => {

      const detail = (e as CustomEvent<Character[]>).detail;

      if (Array.isArray(detail)) replaceAllCharacters(detail);

    };

    window.addEventListener(DND_SYNC_EVENT, handler);

    return () => window.removeEventListener(DND_SYNC_EVENT, handler);

  }, [replaceAllCharacters]);



  const updateCharacter = useCallback(

    (updater: (c: Character) => Character) => {

      if (!character) return;

      const next = characters.map((c) => (c.id === character.id ? updater(c) : c));

      persist(next);

    },

    [character, characters, persist],

  );



  const setActive = useCallback((id: string) => {

    setActiveId(id);

    localStorage.setItem(ACTIVE_KEY, id);

  }, []);



  const addCharacter = useCallback(

    (char: Character) => {

      const next = [...characters.filter((c) => c.id !== char.id), char];

      persist(next);

      setActive(char.id);

    },

    [characters, persist, setActive],

  );



  const createCharacter = useCallback(() => createBlankCharacter(), []);



  const removeCharacter = useCallback(

    (id: string) => {

      const next = characters.filter((c) => c.id !== id);

      persist(next);

      if (isLoggedIn()) {

        dndApi.deleteCharacter(id).catch(() => {});

      }

      if (activeId === id) {
        if (next[0]?.id) setActive(next[0].id);
        else {
          setActiveId("");
          localStorage.removeItem(ACTIVE_KEY);
        }
      }

    },

    [activeId, characters, persist, setActive],

  );



  const resetToExample = useCallback(() => {

    const fresh = { ...structuredClone(EXAMPLE_CHARACTER), id: crypto.randomUUID(), setupComplete: true };

    const next = [...characters, fresh];

    persist(next);

    setActive(fresh.id);

    return fresh;

  }, [characters, persist, setActive]);



  const importCharacters = useCallback(

    (incoming: Character[], mode: "merge" | "replace" = "merge") => {

      const existingIds = new Set(characters.map((c) => c.id));

      const normalized = incoming.map((c) => {

        let id = c.id || crypto.randomUUID();

        if (mode === "merge" && existingIds.has(id)) {

          id = crypto.randomUUID();

        }

        return {

          ...c,

          id,

          setupComplete: c.setupComplete ?? true,

          sessionNotes: c.sessionNotes ?? [],

        };

      });

      let next: Character[];

      if (mode === "replace") {

        next = normalized;

      } else {

        const byId = new Map(characters.map((c) => [c.id, c]));

        normalized.forEach((c) => byId.set(c.id, c));

        next = [...byId.values()];

      }

      persist(next);

      if (next.length) setActive(next[next.length - 1].id);

      return next;

    },

    [characters, persist, setActive],

  );



  useEffect(() => {

    if (!character && characters.length > 0) setActive(characters[0].id);

  }, [character, characters, setActive]);



  return {

    character,

    characters,

    activeId,

    setActive,

    updateCharacter,

    addCharacter,

    createCharacter,

    removeCharacter,

    resetToExample,

    importCharacters,

    replaceAllCharacters,

  };

}


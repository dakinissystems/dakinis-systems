import { useCallback, useEffect, useState } from "react";
import type { Character } from "../types/character";
import { EXAMPLE_CHARACTER } from "../data/seed-character";
import { createBlankCharacter } from "../data/character-factory";

const STORAGE_KEY = "dnd5e-characters";
const ACTIVE_KEY = "dnd5e-active-character";

function loadCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Character[];
      return parsed.map((c) => ({ ...c, setupComplete: c.setupComplete ?? true }));
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

  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  const persist = useCallback((next: Character[]) => {
    setCharacters(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

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
      if (activeId === id) setActive(next[0]?.id ?? "");
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
  };
}

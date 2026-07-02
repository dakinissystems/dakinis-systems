import type { Character } from "../types/character";
import { isLegacyCharacter, migrateLegacyCharacter, migrateLegacyExport } from "./migrate-legacy";

export const EXPORT_VERSION = 1;
export const EXPORT_APP = "dakinis-tabletop";
/** Alias legacy en imports antiguos */
export const LEGACY_EXPORT_APPS = ["dnd-character-manager", "dakinis-tabletop"] as const;

export interface CharacterExportBundle {
  version: number;
  exportedAt: string;
  app: string;
  characters: Character[];
}

export function downloadJson(data: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}

export function exportCharacter(char: Character): void {
  const bundle: CharacterExportBundle = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: EXPORT_APP,
    characters: [char],
  };
  const safeName = (char.name || "personaje").replace(/[^\w\s-]/g, "").trim() || "personaje";
  downloadJson(bundle, `${safeName}.json`);
}

export function exportAllCharacters(chars: Character[]): void {
  const bundle: CharacterExportBundle = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: EXPORT_APP,
    characters: chars,
  };
  downloadJson(bundle, "tabletop-personajes.json");
}

function isModernCharacter(value: unknown): value is Character {
  if (!value || typeof value !== "object") return false;
  const c = value as Character;
  return typeof c.id === "string" && typeof c.name === "string" && Array.isArray(c.classes) && "abilities" in c;
}

function normalizeBundle(data: unknown): Character[] {
  if (!data || typeof data !== "object") {
    throw new Error("JSON inválido");
  }

  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.characters)) {
    return obj.characters.flatMap((entry) => parseSingle(entry));
  }

  if (isModernCharacter(obj)) {
    return [normalizeCharacter(obj)];
  }

  if (isModernCharacter(obj.character)) {
    return [normalizeCharacter(obj.character)];
  }

  // Legacy Flask: { "char_id": { ... }, ... }
  if (Object.values(obj).some(isLegacyCharacter)) {
    return migrateLegacyExport(obj);
  }

  if (isLegacyCharacter(obj)) {
    return [migrateLegacyCharacter(obj)];
  }

  throw new Error("Formato de personaje no reconocido");
}

function parseSingle(entry: unknown): Character[] {
  if (isModernCharacter(entry)) return [normalizeCharacter(entry)];
  if (isLegacyCharacter(entry)) return [migrateLegacyCharacter(entry)];
  return [];
}

function normalizeCharacter(char: Character): Character {
  return {
    ...char,
    id: char.id || crypto.randomUUID(),
    setupComplete: char.setupComplete ?? true,
    sessionNotes: char.sessionNotes ?? [],
  };
}

export async function parseImportFile(file: File): Promise<Character[]> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es JSON válido");
  }

  const chars = normalizeBundle(parsed);
  if (chars.length === 0) {
    throw new Error("No se encontraron personajes en el archivo");
  }
  return chars;
}

export type ImportMode = "merge" | "replace";

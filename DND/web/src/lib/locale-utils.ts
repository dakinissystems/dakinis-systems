import type { ItemCategory } from "../types/character";
import type { TranslateFn } from "../context/LocaleContext";

export type AlignmentKey =
  | "lawfulGood"
  | "neutralGood"
  | "chaoticGood"
  | "lawfulNeutral"
  | "trueNeutral"
  | "chaoticNeutral"
  | "lawfulEvil"
  | "neutralEvil"
  | "chaoticEvil";

export const ALIGNMENT_KEYS: AlignmentKey[] = [
  "lawfulGood",
  "neutralGood",
  "chaoticGood",
  "lawfulNeutral",
  "trueNeutral",
  "chaoticNeutral",
  "lawfulEvil",
  "neutralEvil",
  "chaoticEvil",
];

const LEGACY_ALIGNMENT_MAP: Record<string, AlignmentKey> = {
  "legal bueno": "lawfulGood",
  "neutral bueno": "neutralGood",
  "caotico bueno": "chaoticGood",
  "caótico bueno": "chaoticGood",
  "lawful good": "lawfulGood",
  "neutral good": "neutralGood",
  "chaotic good": "chaoticGood",
  "legal neutral": "lawfulNeutral",
  neutral: "trueNeutral",
  "true neutral": "trueNeutral",
  "caotico neutral": "chaoticNeutral",
  "caótico neutral": "chaoticNeutral",
  "chaotic neutral": "chaoticNeutral",
  "lawful neutral": "lawfulNeutral",
  "legal malo": "lawfulEvil",
  "neutral malo": "neutralEvil",
  "caotico malo": "chaoticEvil",
  "caótico malo": "chaoticEvil",
  "lawful evil": "lawfulEvil",
  "neutral evil": "neutralEvil",
  "chaotic evil": "chaoticEvil",
};

export function normalizeAlignmentKey(value: string): AlignmentKey {
  if ((ALIGNMENT_KEYS as string[]).includes(value)) {
    return value as AlignmentKey;
  }
  const normalized = value.toLowerCase().trim();
  return LEGACY_ALIGNMENT_MAP[normalized] ?? "trueNeutral";
}

export function alignmentLabel(value: string, t: TranslateFn): string {
  const key = normalizeAlignmentKey(value);
  return t(`alignment.${key}`);
}

export function formatTabletopDate(iso: string, locale: "en" | "es"): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTabletopTime(date: Date, locale: "en" | "es"): string {
  return date.toLocaleTimeString(locale === "es" ? "es-ES" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function srdDisplayName(item: { name: string; nameEn?: string }, locale: "en" | "es"): string {
  if (locale === "en") return item.nameEn || item.name;
  return item.name;
}

export function itemCategoryLabel(category: string | ItemCategory, t: TranslateFn): string {
  const key = String(category) as ItemCategory;
  const known: ItemCategory[] = [
    "arma",
    "armadura",
    "escudo",
    "curacion",
    "herreria",
    "magia",
    "ornamento",
    "supervivencia",
    "otro",
  ];
  return known.includes(key) ? t(`categories.${key}`) : String(category);
}

import { LEGAL_DOCS, LEGAL_NAV } from "./i18n";
import type { LegalDoc, LegalDocKey, LegalSection } from "./i18n";

export type { LegalDoc, LegalDocKey, LegalSection };

export const LEGAL_UPDATED = "19 mayo 2026";

export function getLegalDocs(locale: "en" | "es"): Record<LegalDocKey, LegalDoc> {
  return LEGAL_DOCS[locale];
}

export function getLegalNav(locale: "en" | "es"): { key: LegalDocKey; label: string }[] {
  return LEGAL_NAV[locale];
}

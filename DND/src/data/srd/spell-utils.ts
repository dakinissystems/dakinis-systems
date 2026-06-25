import type { SrdSpell, SpellBook } from "./types";

type SpellInput = Omit<SrdSpell, "source"> & { source?: SpellBook };

export function spell(s: SpellInput): SrdSpell {
  return { ...s, source: s.source ?? "srd" };
}

export function tagSpells(spells: Omit<SrdSpell, "source">[], source: SpellBook): SrdSpell[] {
  return spells.map((s) => ({ ...s, source }));
}

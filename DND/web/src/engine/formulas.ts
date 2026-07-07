import type { Ability, Character } from "../types/character";
import { classByName } from "../data/srd/classes";

function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getAbilityScore(char: Character, ability: Ability): number {
  return char.abilities[ability] + char.abilityBonuses[ability];
}

export function getAbilityMod(char: Character, ability: Ability): number {
  return abilityModifier(getAbilityScore(char, ability));
}

export function spellAttackBonus(char: Character): number {
  const spellAbility = getSpellcastingAbility(char);
  return char.proficiencyBonus + getAbilityMod(char, spellAbility);
}

export function spellSaveDC(char: Character): number {
  return 8 + char.proficiencyBonus + getAbilityMod(char, getSpellcastingAbility(char));
}

function getSpellcastingAbility(char: Character): Ability {
  const cls = classByName(char.classes[0]?.className ?? "");
  if (cls?.spellcasting) return cls.spellcasting.ability;

  const primary = char.classes[0]?.className.toLowerCase() ?? "";
  if (primary.includes("palad")) return "cha";
  if (primary.includes("mago") || primary.includes("wizard")) return "int";
  if (primary.includes("cler") || primary.includes("druida") || primary.includes("druid"))
    return "wis";
  if (primary.includes("brujo") || primary.includes("warlock")) return "cha";
  if (primary.includes("bardo") || primary.includes("bard")) return "cha";
  if (primary.includes("explorador") || primary.includes("ranger")) return "wis";
  if (primary.includes("hechicero") || primary.includes("sorcerer")) return "cha";
  return "cha";
}

export function maxPreparedSpells(char: Character): number {
  const spellAbility = getSpellcastingAbility(char);
  const mod = getAbilityMod(char, spellAbility);
  const halfLevel = Math.ceil(char.level / 2);
  return Math.max(mod + halfLevel, 1);
}

export function extraAttacks(char: Character): number {
  const fighterLevel = char.classes
    .filter((c) => c.className.toLowerCase().includes("guerr") || c.className.toLowerCase().includes("fighter"))
    .reduce((s, c) => s + c.level, 0);
  const paladinLevel = char.classes
    .filter((c) => c.className.toLowerCase().includes("palad"))
    .reduce((s, c) => s + c.level, 0);
  const barbarianLevel = char.classes
    .filter((c) => c.className.toLowerCase().includes("barbar"))
    .reduce((s, c) => s + c.level, 0);

  if (fighterLevel >= 20) return 3;
  if (fighterLevel >= 11 || paladinLevel >= 11 || barbarianLevel >= 5) return 2;
  if (fighterLevel >= 5) return 2;
  return 1;
}

export function calculateAC(char: Character): number {
  let ac = 10 + getAbilityMod(char, "dex");
  const equipped = char.armors.filter((a) => a.isEquipped);

  const heavy = equipped.find((a) => a.type === "pesada");
  const medium = equipped.find((a) => a.type === "media");
  const light = equipped.find((a) => a.type === "ligera");
  const shield = equipped.find((a) => a.type === "escudo");

  if (heavy) {
    ac = heavy.baseAC + heavy.acBonus;
  } else if (medium) {
    ac = medium.baseAC + heavyDexCap(char, medium) + medium.acBonus;
  } else if (light) {
    ac = light.baseAC + getAbilityMod(char, "dex") + light.acBonus;
  }

  if (shield) ac += shield.baseAC + shield.acBonus;

  for (const style of char.fightingStyles) {
    if (style.toLowerCase().includes("defense") || style.toLowerCase().includes("defensa")) {
      ac += 1;
    }
  }

  return ac;
}

function heavyDexCap(char: Character, _armor: { type: string }): number {
  return Math.min(getAbilityMod(char, "dex"), 2);
}

export function estimateMaxHP(char: Character): number {
  const conMod = getAbilityMod(char, "con");
  const cls = classByName(char.classes[0]?.className ?? "");
  const hitDie = cls?.hitDie ?? 8;

  const avgPerLevel = Math.floor(hitDie / 2) + 1 + conMod;
  return hitDie + conMod + avgPerLevel * (char.level - 1);
}

export function hasFeat(char: Character, name: string): boolean {
  return char.feats.some((f) => f.isTaken && f.name.toLowerCase().includes(name.toLowerCase()));
}

export function hasSpell(char: Character, name: string): boolean {
  return char.spells.some(
    (s) =>
      s.name.toLowerCase().includes(name.toLowerCase()) && (s.isPrepared || s.isAlwaysReady),
  );
}

export function hasWeapon(char: Character, name: string): boolean {
  return char.weapons.some((w) => w.name.toLowerCase().includes(name.toLowerCase()));
}

export function activeWeapons(char: Character): Character["weapons"] {
  return char.weapons.filter((w) => w.isActive);
}

export function className(char: Character): string {
  return char.classes.map((c) => `${c.className} ${c.level}`).join(" / ");
}

export function subclassName(char: Character): string | undefined {
  return char.classes.find((c) => c.subclass)?.subclass;
}

import type { Ability, AbilityScores } from "../types/character";

const FANTASY_NAMES = [
  "Aelindra", "Thorin", "Lyra", "Kael", "Seraphina", "Draven", "Mira", "Gareth",
  "Isolde", "Brennan", "Elara", "Ragnar", "Ysolde", "Cedric", "Nimue", "Torsten",
  "Aragorn", "Legolas", "Gimli", "Galadriel", "Éowyn", "Faramir", "Arwen", "Boromir",
  "Aldric", "Branwen", "Cassian", "Dorian", "Elowen", "Finnian", "Gwendolyn", "Hadrian",
];

export interface RollResult {
  notation: string;
  rolls: number[];
  dropped?: number[];
  modifier: number;
  total: number;
  label?: string;
}

export type RollMode = "normal" | "advantage" | "disadvantage";

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollDiceDetailed(
  notation: string,
  options?: { modifier?: number; mode?: RollMode; label?: string },
): RollResult {
  const trimmed = notation.trim().toLowerCase().replace(/\s+/g, "");
  const match = trimmed.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    return {
      notation,
      rolls: [],
      modifier: 0,
      total: 0,
      label: options?.label,
    };
  }

  const numDice = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10);
  const parsedMod = match[3] ? parseInt(match[3], 10) : 0;
  const modifier = options?.modifier ?? parsedMod;
  const mode = options?.mode ?? "normal";

  let rolls: number[] = [];
  let dropped: number[] | undefined;

  if (numDice === 1 && dieSize === 20 && mode !== "normal") {
    const a = rollDie(20);
    const b = rollDie(20);
    rolls = mode === "advantage" ? [Math.max(a, b)] : [Math.min(a, b)];
    dropped = mode === "advantage" ? [Math.min(a, b)] : [Math.max(a, b)];
  } else {
    for (let i = 0; i < numDice; i++) {
      rolls.push(rollDie(dieSize));
    }
  }

  const total = rolls.reduce((s, r) => s + r, 0) + modifier;

  return {
    notation: `${numDice}d${dieSize}${modifier >= 0 ? `+${modifier}` : modifier}`,
    rolls,
    dropped,
    modifier,
    total,
    label: options?.label,
  };
}

/** Tirada estándar 4d6 descartando el más bajo */
function roll4d6DropLowest(): number {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
}

export function generateRandomAttributes(): AbilityScores {
  return {
    str: roll4d6DropLowest(),
    dex: roll4d6DropLowest(),
    con: roll4d6DropLowest(),
    int: roll4d6DropLowest(),
    wis: roll4d6DropLowest(),
    cha: roll4d6DropLowest(),
  };
}

export function generateRandomName(): string {
  return FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)] ?? "Aventurero";
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function formatRollSummary(result: RollResult): string {
  const rollsText = result.rolls.join(", ");
  const modText = result.modifier !== 0 ? ` ${formatModifier(result.modifier)}` : "";
  const droppedText =
    result.dropped?.length ? ` (descartado: ${result.dropped.join(", ")})` : "";
  return `[${rollsText}]${modText}${droppedText} = ${result.total}`;
}

export type AbilityKey = Ability;

export const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

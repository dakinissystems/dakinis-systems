import { useEffect, useRef, useState } from "react";
import type { Character } from "../types/character";
import { getAbilityMod } from "../engine/formulas";
import {
  QUICK_DICE,
  formatModifier,
  formatRollSummary,
  rollDiceDetailed,
  type RollMode,
  type RollResult,
} from "../engine/dice";
import { useLocale } from "../context/LocaleContext";
import { formatTabletopTime } from "../lib/locale-utils";

type Props = {
  character: Character;
};

type HistoryEntry = RollResult & { id: string; at: string };

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ROLL_MS = 720;

function dieCountFromNotation(notation: string): number {
  const match = notation.trim().toLowerCase().replace(/\s+/g, "").match(/^(\d+)d\d+/);
  return match ? Math.min(parseInt(match[1], 10), 6) : 1;
}

export function DiceRollerPanel({ character }: Props) {
  const { locale, t } = useLocale();
  const [custom, setCustom] = useState("1d20");
  const [modifier, setModifier] = useState(0);
  const [mode, setMode] = useState<RollMode>("normal");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingLabel, setRollingLabel] = useState<string | null>(null);
  const [rollingDice, setRollingDice] = useState(1);
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    };
  }, []);

  const roll = (notation: string, opts?: { modifier?: number; mode?: RollMode; label?: string }) => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);

    const label = opts?.label;
    const diceCount = dieCountFromNotation(notation);
    setRollingLabel(label ?? notation);
    setRollingDice(Math.max(1, diceCount));
    setIsRolling(true);

    rollTimerRef.current = setTimeout(() => {
      const result = rollDiceDetailed(notation, {
        modifier: opts?.modifier ?? modifier,
        mode: opts?.mode ?? mode,
        label,
      });
      setLastRoll(result);
      setIsRolling(false);
      setRollingLabel(null);
      setHistory((prev) => [
        { ...result, id: crypto.randomUUID(), at: new Date().toISOString() },
        ...prev.slice(0, 19),
      ]);
      rollTimerRef.current = null;
    }, ROLL_MS);

    return null;
  };

  const rollQuick = (sides: number) => {
    roll(`1d${sides}`, { modifier: 0, mode: "normal", label: `d${sides}` });
    setModifier(0);
    setMode("normal");
  };

  const rollCustom = () => {
    const modMatch = custom.match(/([+-]\d+)\s*$/);
    const baseNotation = modMatch ? custom.replace(/\s*[+-]\d+\s*$/, "") : custom;
    const parsedMod = modMatch ? parseInt(modMatch[1], 10) : modifier;
    roll(baseNotation.trim() || "1d20", { modifier: parsedMod, mode, label: custom });
  };

  const rollAbility = (key: (typeof ABILITY_KEYS)[number]) => {
    const mod = getAbilityMod(character, key);
    roll("1d20", {
      modifier: mod,
      mode,
      label: `${t(`abilities.abbr.${key}`)} ${formatModifier(mod)}`,
    });
  };

  const rollWithPb = (label: string) => {
    roll("1d20", {
      modifier: character.proficiencyBonus,
      mode,
      label: `${label} ${formatModifier(character.proficiencyBonus)}`,
    });
  };

  return (
    <section className="panel dice-roller">
      <h2>{t("dice.title")}</h2>

      {(isRolling || lastRoll) && (
        <div
          className={`dice-result${isRolling ? " dice-result--rolling" : " dice-result--landed"}`}
          aria-live="polite"
        >
          {isRolling ? (
            <>
              {rollingLabel && <span className="dice-result__label">{rollingLabel}</span>}
              <div className="dice-roll-stage" aria-hidden="true">
                {Array.from({ length: rollingDice }, (_, i) => (
                  <span key={i} className="dice-die" style={{ animationDelay: `${i * 0.08}s` }}>
                    🎲
                  </span>
                ))}
              </div>
              <span className="dice-result__detail">{t("dice.rolling")}</span>
            </>
          ) : (
            lastRoll && (
              <>
                {lastRoll.label && <span className="dice-result__label">{lastRoll.label}</span>}
                <span className="dice-result__total">{lastRoll.total}</span>
                <span className="dice-result__detail">{formatRollSummary(lastRoll)}</span>
              </>
            )
          )}
        </div>
      )}

      <div className="dice-mode">
        {(["normal", "advantage", "disadvantage"] as RollMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`chip-btn ${mode === m ? "chip-btn--on" : ""}`}
            onClick={() => setMode(m)}
            disabled={isRolling}
          >
            {m === "normal" ? t("dice.normal") : m === "advantage" ? t("dice.advantage") : t("dice.disadvantage")}
          </button>
        ))}
      </div>

      <p className="panel-hint">{t("dice.hint")}</p>

      <div className="dice-quick">
        {QUICK_DICE.map((sides) => (
          <button
            key={sides}
            type="button"
            className="dice-quick__btn"
            onClick={() => rollQuick(sides)}
            disabled={isRolling}
          >
            d{sides}
          </button>
        ))}
      </div>

      <div className="dice-custom">
        <input
          className="dice-custom__input"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={t("dice.notationPlaceholder")}
          aria-label={t("dice.notationAria")}
          disabled={isRolling}
        />
        <div className="dice-custom__mod">
          <label>{t("dice.modifier")}</label>
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(+e.target.value || 0)}
            aria-label={t("dice.modifierAria")}
            disabled={isRolling}
          />
        </div>
        <button type="button" className="btn" onClick={rollCustom} disabled={isRolling}>
          {t("dice.roll")}
        </button>
      </div>

      <h3 className="dice-section-title">{t("dice.abilities")}</h3>
      <div className="dice-ability-row">
        {ABILITY_KEYS.map((key) => {
          const mod = getAbilityMod(character, key);
          return (
            <button
              key={key}
              type="button"
              className="dice-ability-btn"
              onClick={() => rollAbility(key)}
              disabled={isRolling}
            >
              <span>{t(`abilities.abbr.${key}`)}</span>
              <strong>{formatModifier(mod)}</strong>
            </button>
          );
        })}
      </div>

      <h3 className="dice-section-title">{t("dice.proficiencyBonus")}</h3>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={() => rollWithPb(t("dice.pbLabel"))}
        disabled={isRolling}
      >
        1d20 {formatModifier(character.proficiencyBonus)} ({t("dice.pbLabel")} +{character.proficiencyBonus})
      </button>

      {history.length > 0 && (
        <>
          <h3 className="dice-section-title">{t("dice.history")}</h3>
          <ul className="dice-history">
            {history.map((entry) => (
              <li key={entry.id}>
                <span className="dice-history__time">
                  {formatTabletopTime(new Date(entry.at), locale)}
                </span>
                <span className="dice-history__label">{entry.label ?? entry.notation}</span>
                <strong className="dice-history__total">{entry.total}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

import { useState } from "react";
import type { Character } from "../types/character";
import { extraAttacks, spellAttackBonus, spellSaveDC } from "../engine/formulas";
import { SRD_ARMOR_TEMPLATES, armorFromTemplate } from "../data/srd/equipment";
import { useLocale } from "../context/LocaleContext";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

export function CombatPanel({ character, onChange }: Props) {
  const { t } = useLocale();
  const r = character.resources;
  const [armorPick, setArmorPick] = useState("");

  const addArmor = () => {
    const template = SRD_ARMOR_TEMPLATES.find((x) => x.name === armorPick);
    if (!template) return;
    onChange((c) => ({ ...c, armors: [...c.armors, armorFromTemplate(template)] }));
    setArmorPick("");
  };

  return (
    <div className="grid-2">
      <section className="panel">
        <h2>{t("combat.resources")}</h2>
        <div className="resource-bar">
          <label htmlFor="combat-current-hp">{t("combat.currentHp")}</label>
          <input
            id="combat-current-hp"
            type="number"
            value={r.currentHP}
            onChange={(e) =>
              onChange((c) => ({
                ...c,
                resources: { ...c.resources, currentHP: +e.target.value || 0 },
              }))
            }
          />
          <span>/ {r.maxHP}</span>
        </div>
        <div className="resource-bar">
          <label htmlFor="combat-max-hp">{t("combat.maxHp")}</label>
          <input
            id="combat-max-hp"
            type="number"
            value={r.maxHP}
            onChange={(e) =>
              onChange((c) => ({
                ...c,
                resources: { ...c.resources, maxHP: +e.target.value || 0 },
              }))
            }
          />
        </div>
        <div className="resource-bar">
          <label htmlFor="combat-lay-on-hands">{t("combat.layOnHands")}</label>
          <input
            id="combat-lay-on-hands"
            type="number"
            value={r.layOnHandsRemaining}
            onChange={(e) =>
              onChange((c) => ({
                ...c,
                resources: { ...c.resources, layOnHandsRemaining: +e.target.value || 0 },
              }))
            }
          />
        </div>
        <label className="checkbox-label" style={{ marginTop: "0.5rem" }}>
          <input
            type="checkbox"
            checked={r.breathWeaponUsed}
            onChange={(e) =>
              onChange((c) => ({
                ...c,
                resources: { ...c.resources, breathWeaponUsed: e.target.checked },
              }))
            }
          />
          {t("combat.breathUsed")}
        </label>

        <h3 style={{ fontSize: "0.95rem", margin: "1rem 0 0.5rem", color: "var(--gold)" }}>
          {t("combat.spellSlots")}
        </h3>
        <div className="slot-grid">
          {Object.entries(r.spellSlots).map(([lvl, slot]) => (
            <div key={lvl} className="slot-pill">
              {t("combat.level")} <strong>{lvl}</strong>:{" "}
              <input
                type="number"
                min={0}
                max={slot.max}
                value={slot.used}
                style={{ width: 36 }}
                aria-label={`${t("combat.spellSlots")} ${t("combat.level")} ${lvl}`}
                onChange={(e) =>
                  onChange((c) => ({
                    ...c,
                    resources: {
                      ...c.resources,
                      spellSlots: {
                        ...c.resources.spellSlots,
                        [lvl]: { ...slot, used: Math.min(slot.max, +e.target.value || 0) },
                      },
                    },
                  }))
                }
              />{" "}
              / {slot.max}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{t("combat.attackAndSpells")}</h2>
        <div className="grid-3">
          <div className="stat-block">
            <div className="label">{t("combat.attacksPerTurn")}</div>
            <div className="value">{extraAttacks(character)}</div>
          </div>
          <div className="stat-block">
            <div className="label">{t("combat.spellAttack")}</div>
            <div className="value">+{spellAttackBonus(character)}</div>
          </div>
          <div className="stat-block">
            <div className="label">{t("combat.spellDc")}</div>
            <div className="value">{spellSaveDC(character)}</div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>{t("combat.specialActions")}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("combat.table.origin")}</th>
                <th>{t("combat.table.name")}</th>
                <th>{t("combat.table.description")}</th>
                <th>{t("combat.table.level")}</th>
                <th>{t("combat.table.uses")}</th>
                <th>{t("combat.table.action")}</th>
                <th>{t("combat.table.range")}</th>
                <th>{t("combat.table.recharge")}</th>
                <th>{t("combat.table.damageSave")}</th>
              </tr>
            </thead>
            <tbody>
              {character.combatActions.map((a) => (
                <tr key={a.id}>
                  <td>{a.origin}</td>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.description}</td>
                  <td>{a.obtainedAtLevel}</td>
                  <td>{a.uses}</td>
                  <td>{a.actionType}</td>
                  <td>{a.range}</td>
                  <td>{a.recharge}</td>
                  <td>
                    {a.damage}
                    {a.saveEffect && ` · ${a.saveEffect}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <h2 style={{ margin: 0 }}>{t("combat.equippedArmor")}</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              value={armorPick}
              aria-label={t("combat.srdArmorPlaceholder")}
              onChange={(e) => setArmorPick(e.target.value)}
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
            >
              <option value="">{t("combat.srdArmorPlaceholder")}</option>
              {SRD_ARMOR_TEMPLATES.map((armor) => (
                <option key={armor.name} value={armor.name}>
                  {armor.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" disabled={!armorPick} onClick={addArmor}>
              {t("combat.add")}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("combat.table.name")}</th>
                <th>{t("combat.table.type")}</th>
                <th>{t("combat.table.baseAc")}</th>
                <th>{t("combat.table.bonus")}</th>
                <th>{t("combat.table.notes")}</th>
                <th>{t("combat.table.equipped")}</th>
              </tr>
            </thead>
            <tbody>
              {character.armors.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.name}
                    {a.isCustom && <span className="badge badge-custom"> {t("combat.custom")}</span>}
                  </td>
                  <td>{a.type}</td>
                  <td>{a.baseAC}</td>
                  <td>+{a.acBonus}</td>
                  <td>{a.notes}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={a.isEquipped}
                      aria-label={`${t("combat.table.equipped")}: ${a.name}`}
                      onChange={(e) =>
                        onChange((c) => ({
                          ...c,
                          armors: c.armors.map((ar) =>
                            ar.id === a.id ? { ...ar, isEquipped: e.target.checked } : ar,
                          ),
                        }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

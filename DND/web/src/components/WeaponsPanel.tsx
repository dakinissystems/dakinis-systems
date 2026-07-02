import { useState } from "react";
import type { Character, Weapon } from "../types/character";
import { SRD_WEAPON_TEMPLATES } from "../data/srd/equipment";
import { getAbilityMod } from "../engine/formulas";
import { useLocale } from "../context/LocaleContext";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

const emptyWeapon = (attackBonus: number, damageBonus: number): Weapon => ({
  id: crypto.randomUUID(),
  name: "",
  isCustom: true,
  isActive: false,
  attackBonus,
  damageDice: "1d8",
  damageBonus,
  damageType: "Slashing",
  range: "Melee",
  properties: [],
});

export function WeaponsPanel({ character, onChange }: Props) {
  const { t } = useLocale();
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Weapon | null>(null);
  const [fromSrd, setFromSrd] = useState("");

  const strMod = getAbilityMod(character, "str");
  const pb = character.proficiencyBonus;

  const openNew = (template?: (typeof SRD_WEAPON_TEMPLATES)[0]) => {
    const w = emptyWeapon(pb + strMod, strMod);
    if (template) {
      w.name = template.name;
      w.isCustom = false;
      w.baseWeapon = template.name;
      w.damageDice = template.damageDice;
      w.damageType = template.damageType;
      w.properties = [...template.properties];
      w.attackBonus = pb + strMod;
      w.damageBonus = strMod;
    } else {
      w.attackBonus = pb + strMod;
      w.damageBonus = strMod;
    }
    setDraft(w);
    setShowModal(true);
  };

  const saveWeapon = () => {
    if (!draft?.name.trim()) return;
    onChange((c) => {
      const exists = c.weapons.some((w) => w.id === draft.id);
      return {
        ...c,
        weapons: exists
          ? c.weapons.map((w) => (w.id === draft.id ? draft : w))
          : [...c.weapons, draft],
      };
    });
    setShowModal(false);
    setDraft(null);
  };

  const removeWeapon = (id: string) => {
    onChange((c) => ({ ...c, weapons: c.weapons.filter((w) => w.id !== id) }));
  };

  const editWeapon = (w: Weapon) => {
    setDraft({ ...w });
    setShowModal(true);
  };

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>{t("weapons.title")}</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            value={fromSrd}
            onChange={(e) => setFromSrd(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">{t("weapons.srdPlaceholder")}</option>
            {SRD_WEAPON_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!fromSrd}
            onClick={() => {
              const t = SRD_WEAPON_TEMPLATES.find((x) => x.name === fromSrd);
              if (t) openNew(t);
              setFromSrd("");
            }}
          >
            {t("weapons.addSrd")}
          </button>
          <button className="btn btn-sm" onClick={() => openNew()}>
            {t("weapons.addCustom")}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("weapons.active")}</th>
              <th>{t("weapons.name")}</th>
              <th>{t("weapons.attack")}</th>
              <th>{t("weapons.damage")}</th>
              <th>{t("weapons.type")}</th>
              <th>{t("weapons.range")}</th>
              <th>{t("weapons.extra")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {character.weapons.map((w) => (
              <tr key={w.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={w.isActive}
                    onChange={(e) =>
                      onChange((c) => ({
                        ...c,
                        weapons: c.weapons.map((x) =>
                          x.id === w.id ? { ...x, isActive: e.target.checked } : x,
                        ),
                      }))
                    }
                  />
                </td>
                <td>
                  <strong>{w.name}</strong>
                  {w.isCustom && <span className="badge badge-custom"> {t("weapons.custom")}</span>}
                </td>
                <td>1d20+{w.attackBonus}</td>
                <td>
                  {w.damageDice}+{w.damageBonus}
                </td>
                <td>{w.damageType}</td>
                <td>{w.range}</td>
                <td>{w.notes}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => editWeapon(w)}>
                    {t("weapons.edit")}
                  </button>{" "}
                  <button className="btn btn-danger btn-sm" onClick={() => removeWeapon(w.id)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {character.weapons.length === 0 && (
        <p className="empty-state">{t("weapons.empty")}</p>
      )}

      {showModal && draft && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.name ? t("weapons.modalEdit") : t("weapons.modalNew")}</h3>
            <div className="form-row">
              <div className="form-field">
                <label>{t("weapons.name")}</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t("weapons.baseSrd")}</label>
                <input
                  value={draft.baseWeapon ?? ""}
                  onChange={(e) => setDraft({ ...draft, baseWeapon: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>{t("weapons.attackBonus")}</label>
                <input
                  type="number"
                  value={draft.attackBonus}
                  onChange={(e) => setDraft({ ...draft, attackBonus: +e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>{t("weapons.damageDice")}</label>
                <input
                  value={draft.damageDice}
                  onChange={(e) => setDraft({ ...draft, damageDice: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>{t("weapons.damageBonus")}</label>
                <input
                  type="number"
                  value={draft.damageBonus}
                  onChange={(e) => setDraft({ ...draft, damageBonus: +e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>{t("weapons.damageType")}</label>
                <input
                  value={draft.damageType}
                  onChange={(e) => setDraft({ ...draft, damageType: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>{t("weapons.range")}</label>
                <input value={draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label>{t("weapons.notes")}</label>
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder={t("weapons.notesPlaceholder")}
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={draft.isCustom}
                onChange={(e) => setDraft({ ...draft, isCustom: e.target.checked })}
              />
              {t("weapons.campaignCustom")}
            </label>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t("weapons.cancel")}
              </button>
              <button className="btn" onClick={saveWeapon}>
                {t("weapons.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
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
  damageBonus,
  damageDice: "1d8",
  damageType: "Slashing",
  range: "Melee",
  properties: [],
});

export function WeaponsPanel({ character, onChange }: Props) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<Weapon | null>(null);
  const [fromSrd, setFromSrd] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (draft) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [draft]);

  const closeModal = () => {
    setDraft(null);
  };

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
    closeModal();
  };

  const removeWeapon = (id: string) => {
    onChange((c) => ({ ...c, weapons: c.weapons.filter((w) => w.id !== id) }));
  };

  const editWeapon = (w: Weapon) => {
    setDraft({ ...w });
  };

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>{t("weapons.title")}</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            value={fromSrd}
            aria-label={t("weapons.srdPlaceholder")}
            onChange={(e) => setFromSrd(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">{t("weapons.srdPlaceholder")}</option>
            {SRD_WEAPON_TEMPLATES.map((weapon) => (
              <option key={weapon.name} value={weapon.name}>
                {weapon.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={!fromSrd}
            onClick={() => {
              const template = SRD_WEAPON_TEMPLATES.find((x) => x.name === fromSrd);
              if (template) openNew(template);
              setFromSrd("");
            }}
          >
            {t("weapons.addSrd")}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => openNew()}>
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
              <th>{t("inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {character.weapons.map((w) => (
              <tr key={w.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={w.isActive}
                    aria-label={`${t("weapons.active")}: ${w.name}`}
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => editWeapon(w)}>
                    {t("weapons.edit")}
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    aria-label={t("list.deleteAria", { name: w.name })}
                    onClick={() => removeWeapon(w.id)}
                  >
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

      {draft && (
        <dialog
          ref={dialogRef}
          className="modal-overlay"
          onClose={closeModal}
          aria-labelledby="weapons-modal-title"
        >
          <div className="modal">
            <h3 id="weapons-modal-title">{draft.name ? t("weapons.modalEdit") : t("weapons.modalNew")}</h3>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="weapon-draft-name">{t("weapons.name")}</label>
                <input id="weapon-draft-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label htmlFor="weapon-draft-base">{t("weapons.baseSrd")}</label>
                <input
                  id="weapon-draft-base"
                  value={draft.baseWeapon ?? ""}
                  onChange={(e) => setDraft({ ...draft, baseWeapon: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="weapon-draft-attack">{t("weapons.attackBonus")}</label>
                <input
                  id="weapon-draft-attack"
                  type="number"
                  value={draft.attackBonus}
                  onChange={(e) => setDraft({ ...draft, attackBonus: +e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="weapon-draft-dice">{t("weapons.damageDice")}</label>
                <input
                  id="weapon-draft-dice"
                  value={draft.damageDice}
                  onChange={(e) => setDraft({ ...draft, damageDice: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="weapon-draft-damage-bonus">{t("weapons.damageBonus")}</label>
                <input
                  id="weapon-draft-damage-bonus"
                  type="number"
                  value={draft.damageBonus}
                  onChange={(e) => setDraft({ ...draft, damageBonus: +e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="weapon-draft-type">{t("weapons.damageType")}</label>
                <input
                  id="weapon-draft-type"
                  value={draft.damageType}
                  onChange={(e) => setDraft({ ...draft, damageType: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="weapon-draft-range">{t("weapons.range")}</label>
                <input id="weapon-draft-range" value={draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="weapon-draft-notes">{t("weapons.notes")}</label>
              <textarea
                id="weapon-draft-notes"
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
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                {t("weapons.cancel")}
              </button>
              <button type="button" className="btn" onClick={saveWeapon}>
                {t("weapons.save")}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}

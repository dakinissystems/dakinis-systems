import { useEffect, useRef } from "react";
import type { Spell } from "../../types/character";
import { useLocale } from "../../context/LocaleContext";

type Props = {
  draft: Spell;
  onChange: (spell: Spell) => void;
  onClose: () => void;
  onSave: () => void;
};

export function SpellCustomModal({ draft, onChange, onClose, onSave }: Props) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      onClose={onClose}
      aria-labelledby="spells-modal-title"
    >
      <div className="modal">
        <h3 id="spells-modal-title">{t("spells.customSpellTitle")}</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="spell-draft-name">{t("spells.name")}</label>
            <input
              id="spell-draft-name"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="spell-draft-level">{t("spells.level")}</label>
            <input
              id="spell-draft-level"
              type="number"
              min={0}
              max={9}
              value={draft.level}
              onChange={(e) => onChange({ ...draft, level: +e.target.value })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="spell-draft-school">{t("spells.school")}</label>
            <input
              id="spell-draft-school"
              value={draft.school}
              onChange={(e) => onChange({ ...draft, school: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="spell-draft-casting">{t("spells.castingTime")}</label>
            <input
              id="spell-draft-casting"
              value={draft.castingTime}
              onChange={(e) => onChange({ ...draft, castingTime: e.target.value })}
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="spell-draft-description">{t("spells.description")}</label>
          <textarea
            id="spell-draft-description"
            value={draft.description}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t("spells.cancel")}
          </button>
          <button type="button" className="btn" onClick={onSave}>
            {t("spells.save")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

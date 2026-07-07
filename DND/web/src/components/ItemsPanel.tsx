import { useEffect, useRef, useState } from "react";
import type { Character, InventoryItem, ItemCategory } from "../types/character";
import { SRD_ITEM_TEMPLATES, itemFromTemplate } from "../data/srd/equipment";
import { useLocale } from "../context/LocaleContext";
import { itemCategoryLabel } from "../lib/locale-utils";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

const CATEGORIES: ItemCategory[] = ["arma", "armadura", "curacion", "herreria", "magia", "ornamento", "supervivencia", "otro"];

export function ItemsPanel({ character, onChange }: Props) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<InventoryItem | null>(null);
  const [catFilter, setCatFilter] = useState<ItemCategory | "">("");
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

  const addSrdItem = () => {
    const template = SRD_ITEM_TEMPLATES.find((x) => x.name === fromSrd);
    if (!template) return;
    onChange((c) => ({ ...c, inventory: [...c.inventory, itemFromTemplate(template)] }));
    setFromSrd("");
  };

  const openNew = () => {
    setDraft({
      id: crypto.randomUUID(),
      name: "",
      category: "otro",
      quantity: 1,
      isCustom: true,
      description: "",
      tags: [],
    });
  };

  const save = () => {
    if (!draft?.name.trim()) return;
    onChange((c) => {
      const exists = c.inventory.some((i) => i.id === draft.id);
      return {
        ...c,
        inventory: exists
          ? c.inventory.map((i) => (i.id === draft.id ? draft : i))
          : [...c.inventory, draft],
      };
    });
    closeModal();
  };

  const items = catFilter
    ? character.inventory.filter((i) => i.category === catFilter)
    : character.inventory;

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <h2>{t("inventory.title")}</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            value={fromSrd}
            aria-label={t("inventory.srdItemPlaceholder")}
            onChange={(e) => setFromSrd(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">{t("inventory.srdItemPlaceholder")}</option>
            {SRD_ITEM_TEMPLATES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-secondary btn-sm" disabled={!fromSrd} onClick={addSrdItem}>
            {t("inventory.addSrd")}
          </button>
          <select
            value={catFilter}
            aria-label={t("inventory.allCategories")}
            onChange={(e) => setCatFilter(e.target.value as ItemCategory | "")}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">{t("inventory.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {itemCategoryLabel(c, t)}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-sm" onClick={openNew}>
            {t("inventory.addItem")}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("inventory.qty")}</th>
              <th>{t("inventory.name")}</th>
              <th>{t("inventory.category")}</th>
              <th>{t("inventory.description")}</th>
              <th>{t("inventory.tags")}</th>
              <th>{t("inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.quantity}</td>
                <td>
                  <strong>{item.name}</strong>
                  {item.isCustom && <span className="badge badge-custom"> {t("inventory.custom")}</span>}
                </td>
                <td>{itemCategoryLabel(item.category, t)}</td>
                <td>{item.description}</td>
                <td>{item.tags?.map((tag) => <span key={tag} className="tag">{tag}</span>)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setDraft({ ...item });
                    }}
                  >
                    {t("inventory.edit")}
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    aria-label={t("list.deleteAria", { name: item.name })}
                    onClick={() =>
                      onChange((c) => ({
                        ...c,
                        inventory: c.inventory.filter((i) => i.id !== item.id),
                      }))
                    }
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <p className="empty-state">{t("inventory.empty")}</p>
      )}

      {draft && (
        <dialog
          ref={dialogRef}
          className="modal-overlay"
          onClose={closeModal}
          aria-labelledby="inventory-modal-title"
        >
          <div className="modal">
            <h3 id="inventory-modal-title">{t("inventory.modalTitle")}</h3>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="inventory-item-name">{t("inventory.name")}</label>
                <input id="inventory-item-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label htmlFor="inventory-item-qty">{t("inventory.quantity")}</label>
                <input
                  id="inventory-item-qty"
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(e) => setDraft({ ...draft, quantity: +e.target.value || 0 })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="inventory-item-category">{t("inventory.categoryLabel")}</label>
                <select
                  id="inventory-item-category"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as ItemCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {itemCategoryLabel(c, t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="inventory-item-tags">{t("inventory.tagsComma")}</label>
                <input
                  id="inventory-item-tags"
                  value={draft.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value
                        .split(",")
                        .flatMap((s) => {
                          const trimmed = s.trim();
                          return trimmed ? [trimmed] : [];
                        }),
                    })
                  }
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="inventory-item-description">{t("inventory.descriptionEffects")}</label>
              <textarea
                id="inventory-item-description"
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                {t("inventory.cancel")}
              </button>
              <button type="button" className="btn" onClick={save}>
                {t("inventory.save")}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}

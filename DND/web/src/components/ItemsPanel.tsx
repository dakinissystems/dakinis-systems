import { useState } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<InventoryItem | null>(null);
  const [catFilter, setCatFilter] = useState<ItemCategory | "">("");
  const [fromSrd, setFromSrd] = useState("");

  const addSrdItem = () => {
    const t = SRD_ITEM_TEMPLATES.find((x) => x.name === fromSrd);
    if (!t) return;
    onChange((c) => ({ ...c, inventory: [...c.inventory, itemFromTemplate(t)] }));
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
    setShowModal(true);
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
    setShowModal(false);
    setDraft(null);
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
            onChange={(e) => setFromSrd(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">{t("inventory.srdItemPlaceholder")}</option>
            {SRD_ITEM_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" disabled={!fromSrd} onClick={addSrdItem}>
            {t("inventory.addSrd")}
          </button>
          <select
            value={catFilter}
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
          <button className="btn btn-sm" onClick={openNew}>
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
              <th></th>
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
                <td>{item.tags?.map((t) => <span key={t} className="tag">{t}</span>)}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setDraft({ ...item });
                      setShowModal(true);
                    }}
                  >
                    {t("inventory.edit")}
                  </button>{" "}
                  <button
                    className="btn btn-danger btn-sm"
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

      {showModal && draft && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("inventory.modalTitle")}</h3>
            <div className="form-row">
              <div className="form-field">
                <label>{t("inventory.name")}</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t("inventory.quantity")}</label>
                <input
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(e) => setDraft({ ...draft, quantity: +e.target.value || 0 })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>{t("inventory.categoryLabel")}</label>
                <select
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
                <label>{t("inventory.tagsComma")}</label>
                <input
                  value={draft.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
            <div className="form-field">
              <label>{t("inventory.descriptionEffects")}</label>
              <textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t("inventory.cancel")}
              </button>
              <button className="btn" onClick={save}>
                {t("inventory.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

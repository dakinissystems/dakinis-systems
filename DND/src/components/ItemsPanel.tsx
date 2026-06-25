import { useState } from "react";
import type { Character, InventoryItem, ItemCategory } from "../types/character";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "curacion", label: "Curación" },
  { value: "herreria", label: "Herrería" },
  { value: "magia", label: "Magia" },
  { value: "ornamento", label: "Ornamento" },
  { value: "supervivencia", label: "Supervivencia" },
  { value: "otro", label: "Otro" },
];

export function ItemsPanel({ character, onChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<InventoryItem | null>(null);
  const [catFilter, setCatFilter] = useState<ItemCategory | "">("");

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
        <h2>Inventario y objetos de campaña</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as ItemCategory | "")}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.35rem" }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button className="btn btn-sm" onClick={openNew}>
            + Objeto
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.quantity}</td>
                <td>
                  <strong>{item.name}</strong>
                  {item.isCustom && <span className="badge badge-custom"> Custom</span>}
                </td>
                <td>{item.category}</td>
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
                    Editar
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
        <p className="empty-state">Sin objetos en esta categoría.</p>
      )}

      {showModal && draft && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Objeto de inventario</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Nombre</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Cantidad</label>
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
                <label>Categoría</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as ItemCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Tags (coma)</label>
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
              <label>Descripción / efectos de mesa</label>
              <textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn" onClick={save}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

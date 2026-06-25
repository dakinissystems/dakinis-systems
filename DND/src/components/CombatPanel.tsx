import type { Character } from "../types/character";
import { extraAttacks, spellAttackBonus, spellSaveDC } from "../engine/formulas";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

export function CombatPanel({ character, onChange }: Props) {
  const r = character.resources;

  return (
    <div className="grid-2">
      <section className="panel">
        <h2>Recursos en combate</h2>
        <div className="resource-bar">
          <label>PV actuales</label>
          <input
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
          <label>PV máximos</label>
          <input
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
          <label>Lay on Hands</label>
          <input
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
          Aliento de dragón usado
        </label>

        <h3 style={{ fontSize: "0.95rem", margin: "1rem 0 0.5rem", color: "var(--gold)" }}>
          Slots de hechizo
        </h3>
        <div className="slot-grid">
          {Object.entries(r.spellSlots).map(([lvl, slot]) => (
            <div key={lvl} className="slot-pill">
              Nivel <strong>{lvl}</strong>:{" "}
              <input
                type="number"
                min={0}
                max={slot.max}
                value={slot.used}
                style={{ width: 36 }}
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
        <h2>Ataque y conjuros</h2>
        <div className="grid-3">
          <div className="stat-block">
            <div className="label">Ataques/turno</div>
            <div className="value">{extraAttacks(character)}</div>
          </div>
          <div className="stat-block">
            <div className="label">Ataque conjuro</div>
            <div className="value">+{spellAttackBonus(character)}</div>
          </div>
          <div className="stat-block">
            <div className="label">CD conjuro</div>
            <div className="value">{spellSaveDC(character)}</div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>Acciones especiales</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Origen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Nivel</th>
                <th>Usos</th>
                <th>Acción</th>
                <th>Alcance</th>
                <th>Recarga</th>
                <th>Daño / ST</th>
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
        <h2>Armadura equipada</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>CA base</th>
                <th>Bonus</th>
                <th>Notas</th>
                <th>Equipada</th>
              </tr>
            </thead>
            <tbody>
              {character.armors.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.name}
                    {a.isCustom && <span className="badge badge-custom"> Custom</span>}
                  </td>
                  <td>{a.type}</td>
                  <td>{a.baseAC}</td>
                  <td>+{a.acBonus}</td>
                  <td>{a.notes}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={a.isEquipped}
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

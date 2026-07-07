import { Fragment } from "react";
import { SRD_CLASSES, SRD_SPELLS } from "../../data/srd";
import type { SrdSpell } from "../../data/srd/types";
import { useLocale } from "../../context/LocaleContext";

const SOURCE_LABEL = {
  srd: "SRD",
  xge: "XGE",
  tce: "TCE",
} as const;

type Props = {
  spells: SrdSpell[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
};

export function CompendiumSpellsSection({ spells, expandedId, onToggleExpand }: Props) {
  const { t } = useLocale();

  return (
    <section className="panel">
      <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        {t("compendium.showingSpells", { shown: spells.length, total: SRD_SPELLS.length })}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("compendium.source")}</th>
              <th>{t("compendium.level")}</th>
              <th>{t("spells.name")}</th>
              <th>{t("spells.school")}</th>
              <th>{t("compendium.castingTime")}</th>
              <th>{t("compendium.classes")}</th>
              <th>{t("inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {spells.map((spell) => (
              <Fragment key={spell.id}>
                <tr>
                  <td>
                    <span className="badge badge-custom" style={{ opacity: spell.source === "srd" ? 0.7 : 1 }}>
                      {SOURCE_LABEL[spell.source]}
                    </span>
                  </td>
                  <td>{spell.level === 0 ? t("spells.cantrip") : spell.level}</td>
                  <td>
                    <strong>{spell.name}</strong>
                    {spell.ritual && <span className="tag">{t("compendium.ritual")}</span>}
                    {spell.concentration && <span className="tag">{t("compendium.concentration")}</span>}
                  </td>
                  <td>{spell.school}</td>
                  <td>{spell.castingTime}</td>
                  <td>
                    {spell.classes
                      .map((id) => SRD_CLASSES.find((c) => c.id === id)?.name ?? id)
                      .join(", ")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      aria-label={expandedId === spell.id ? t("compendium.collapse") : t("compendium.expand")}
                      onClick={() => onToggleExpand(spell.id)}
                    >
                      {expandedId === spell.id ? "−" : "+"}
                    </button>
                  </td>
                </tr>
                {expandedId === spell.id && (
                  <tr>
                    <td colSpan={7} style={{ background: "var(--surface-2)" }}>
                      <p style={{ margin: "0.25rem 0" }}>
                        <strong>{t("compendium.range")}:</strong> {spell.range} ·{" "}
                        <strong>{t("compendium.components")}:</strong> {spell.components} ·{" "}
                        <strong>{t("compendium.duration")}:</strong> {spell.duration}
                      </p>
                      <p style={{ margin: 0, color: "var(--muted)" }}>{spell.description}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

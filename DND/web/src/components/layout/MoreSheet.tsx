import type { MorePanel } from "./BottomNav";
import { getMoreOptions } from "./BottomNav";
import { useLocale } from "../../context/LocaleContext";
import { LanguageSwitcher } from "../LanguageSwitcher";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (panel: MorePanel) => void;
  onEditBuild?: () => void;
  onLoadExample?: () => void;
  onLegal?: () => void;
  onExportJson?: () => void;
  onExportAllJson?: () => void;
  onImportJson?: () => void;
  onExportPdf?: () => void;
};

export function MoreSheet({
  open,
  onClose,
  onSelect,
  onEditBuild,
  onLoadExample,
  onLegal,
  onExportJson,
  onExportAllJson,
  onImportJson,
  onExportPdf,
}: Props) {
  const { t } = useLocale();
  const moreOptions = getMoreOptions(t);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="bottom-sheet__handle" />
        <h2 className="bottom-sheet__title">{t("more.title")}</h2>
        <div className="sheet-list">
          {onExportJson && (
            <button type="button" className="sheet-list__item" onClick={() => { onExportJson(); onClose(); }}>
              <strong>{t("more.exportCharacterJsonTitle")}</strong>
              <span>{t("more.exportCharacterJsonDesc")}</span>
            </button>
          )}
          {onImportJson && (
            <button type="button" className="sheet-list__item" onClick={() => { onImportJson(); onClose(); }}>
              <strong>{t("more.importJsonTitle")}</strong>
              <span>{t("more.importJsonDesc")}</span>
            </button>
          )}
          {onExportAllJson && (
            <button type="button" className="sheet-list__item" onClick={() => { onExportAllJson(); onClose(); }}>
              <strong>{t("more.exportAllJsonTitle")}</strong>
              <span>{t("more.exportAllJsonDesc")}</span>
            </button>
          )}
          {onExportPdf && (
            <button type="button" className="sheet-list__item" onClick={() => { onExportPdf(); onClose(); }}>
              <strong>{t("more.exportPdfTitle")}</strong>
              <span>{t("more.exportPdfDesc")}</span>
            </button>
          )}
          {moreOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="sheet-list__item"
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
            >
              <strong>{opt.label}</strong>
              <span>{opt.desc}</span>
            </button>
          ))}
          {onEditBuild && (
            <button type="button" className="sheet-list__item" onClick={() => { onEditBuild(); onClose(); }}>
              <strong>{t("more.editBuildTitle")}</strong>
              <span>{t("more.editBuildDesc")}</span>
            </button>
          )}
          {onLoadExample && (
            <button type="button" className="sheet-list__item sheet-list__item--muted" onClick={() => { onLoadExample(); onClose(); }}>
              <strong>{t("more.loadExampleTitle")}</strong>
              <span>{t("more.loadExampleDesc")}</span>
            </button>
          )}
          {onLegal && (
            <button type="button" className="sheet-list__item" onClick={() => { onLegal(); onClose(); }}>
              <strong>{t("more.legalTitle")}</strong>
              <span>{t("more.legalDesc")}</span>
            </button>
          )}
        </div>
        <div className="bottom-sheet__lang">
          <LanguageSwitcher />
        </div>
        <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
          {t("more.close")}
        </button>
      </div>
    </div>
  );
}

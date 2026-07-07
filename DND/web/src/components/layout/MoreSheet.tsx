import { useEffect, useRef } from "react";
import type { MorePanel } from "./more-options";
import { getMoreOptions } from "./more-options";
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="sheet-overlay"
      onClose={onClose}
      aria-labelledby="more-sheet-title"
    >
      <div className="bottom-sheet">
        <div className="bottom-sheet__handle" />
        <h2 id="more-sheet-title" className="bottom-sheet__title">
          {t("more.title")}
        </h2>
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
    </dialog>
  );
}

import type { MorePanel } from "./BottomNav";
import { MORE_OPTIONS } from "./BottomNav";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (panel: MorePanel) => void;
  onEditBuild?: () => void;
  onLoadExample?: () => void;
  onLegal?: () => void;
};

export function MoreSheet({ open, onClose, onSelect, onEditBuild, onLoadExample, onLegal }: Props) {
  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="bottom-sheet__handle" />
        <h2 className="bottom-sheet__title">Más opciones</h2>
        <div className="sheet-list">
          {MORE_OPTIONS.map((opt) => (
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
              <strong>Editar raza y clase</strong>
              <span>Cambiar build desde el asistente</span>
            </button>
          )}
          {onLoadExample && (
            <button type="button" className="sheet-list__item sheet-list__item--muted" onClick={() => { onLoadExample(); onClose(); }}>
              <strong>Cargar ejemplo (Excel)</strong>
              <span>Charth Dargson — Paladín 8</span>
            </button>
          )}
          {onLegal && (
            <button type="button" className="sheet-list__item" onClick={() => { onLegal(); onClose(); }}>
              <strong>Legal</strong>
              <span>Privacidad, términos y OGL SRD</span>
            </button>
          )}
        </div>
        <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

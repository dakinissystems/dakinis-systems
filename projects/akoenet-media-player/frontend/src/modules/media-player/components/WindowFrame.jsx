import { useCallback, useRef } from "react";
import { clampRect } from "../lib/windowSnap.js";

const RESIZE_HANDLES = ["e", "s", "se"];

export function WindowFrame({
  id,
  title,
  rect,
  zIndex,
  focused,
  onFocus,
  onMove,
  onMoveEnd,
  onResize,
  onResizeEnd,
  onClose,
  children,
}) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const onTitleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".dmp-window__close")) return;
      onFocus();
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = { ...rect };
      dragRef.current = { startX, startY, origin };

      const onMoveEvt = (ev) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        onMove({
          ...dragRef.current.origin,
          x: Math.max(0, dragRef.current.origin.x + dx),
          y: Math.max(48, dragRef.current.origin.y + dy),
        });
      };

      const onUp = (ev) => {
        if (dragRef.current && onMoveEnd) {
          const dx = ev.clientX - dragRef.current.startX;
          const dy = ev.clientY - dragRef.current.startY;
          onMoveEnd({
            ...dragRef.current.origin,
            x: Math.max(0, dragRef.current.origin.x + dx),
            y: Math.max(48, dragRef.current.origin.y + dy),
          });
        }
        dragRef.current = null;
        window.removeEventListener("mousemove", onMoveEvt);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMoveEvt);
      window.addEventListener("mouseup", onUp);
    },
    [onFocus, onMove, onMoveEnd, rect],
  );

  const onResizeMouseDown = useCallback(
    (e, axis) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = { ...rect };
      resizeRef.current = { startX, startY, origin, axis };

      const onMoveEvt = (ev) => {
        if (!resizeRef.current) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dy = ev.clientY - resizeRef.current.startY;
        const { origin: o, axis: ax } = resizeRef.current;
        let next = { ...o };

        if (ax.includes("e")) next.width = o.width + dx;
        if (ax.includes("s")) next.height = o.height + dy;

        onResize?.(clampRect(next));
      };

      const onUp = (ev) => {
        if (resizeRef.current && onResizeEnd) {
          const dx = ev.clientX - resizeRef.current.startX;
          const dy = ev.clientY - resizeRef.current.startY;
          const { origin: o, axis: ax } = resizeRef.current;
          let next = { ...o };
          if (ax.includes("e")) next.width = o.width + dx;
          if (ax.includes("s")) next.height = o.height + dy;
          onResizeEnd(clampRect(next));
        }
        resizeRef.current = null;
        window.removeEventListener("mousemove", onMoveEvt);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMoveEvt);
      window.addEventListener("mouseup", onUp);
    },
    [onFocus, onResize, onResizeEnd, rect],
  );

  return (
    <div
      className={`dmp-window${focused ? " is-focused" : ""}`}
      data-window-id={id}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex,
      }}
    >
      <div className="dmp-window__titlebar" onMouseDown={onTitleMouseDown}>
        <span>{title}</span>
        <button type="button" className="dmp-window__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="dmp-window__body">{children}</div>
      {onResize
        ? RESIZE_HANDLES.map((axis) => (
            <div
              key={axis}
              className={`dmp-window__resize-handle dmp-window__resize-handle--${axis}`}
              onMouseDown={(e) => onResizeMouseDown(e, axis)}
              aria-hidden
            />
          ))
        : null}
    </div>
  );
}

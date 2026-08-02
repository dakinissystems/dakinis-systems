/**
 * Patrón Chat DES — hilo + composer (IA o mensajería producto).
 * Usa AiMessage; el producto define el acento vía data-product.
 */
import { useEffect, useRef } from "react";
import AiMessage from "./AiMessage.jsx";
import AiThinking from "./AiThinking.jsx";
import Button from "./Button.jsx";
import EmptyState from "./EmptyState.jsx";

export default function ChatPattern({
  messages = [],
  value = "",
  onChange,
  onSend,
  placeholder = "Escribe un mensaje…",
  sendLabel = "Enviar",
  busy = false,
  thinking = false,
  emptyTitle,
  emptyHint,
  className = "",
  footer,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  function handleSubmit(e) {
    e.preventDefault();
    const text = String(value || "").trim();
    if (!text || busy) return;
    onSend?.(text);
  }

  const empty = !messages.length && !thinking;

  return (
    <div className={`dakinis-pattern-chat ${className}`.trim()}>
      <div
        ref={listRef}
        className="dakinis-pattern-chat__thread"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {empty ? (
          <EmptyState
            product="generic"
            stateKey="noData"
            title={emptyTitle || "Empieza la conversación"}
            hint={emptyHint || "Escribe abajo para enviar el primer mensaje."}
            className="dakinis-pattern-chat__empty"
          />
        ) : (
          messages.map((msg, i) => (
            <AiMessage
              key={msg.id || `${msg.role}-${i}`}
              role={msg.role === "user" ? "user" : "assistant"}
              timestamp={msg.timestamp}
            >
              {msg.content}
            </AiMessage>
          ))
        )}
        {thinking ? <AiThinking /> : null}
      </div>

      <form className="dakinis-pattern-chat__composer" onSubmit={handleSubmit}>
        <label className="dakinis-pattern-chat__label visually-hidden" htmlFor="dakinis-chat-input">
          Mensaje
        </label>
        <input
          id="dakinis-chat-input"
          className="dakinis-input dakinis-pattern-chat__input"
          value={value}
          onChange={(ev) => onChange?.(ev.target.value)}
          placeholder={placeholder}
          disabled={busy}
          autoComplete="off"
        />
        <Button type="submit" variant="primary" disabled={busy || !String(value || "").trim()}>
          {busy ? "…" : sendLabel}
        </Button>
      </form>
      {footer ? <div className="dakinis-pattern-chat__footer">{footer}</div> : null}
    </div>
  );
}

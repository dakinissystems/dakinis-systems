import { useState } from "react";
import type { Character, SessionNote } from "../types/character";
import { useLocale } from "../context/LocaleContext";
import { formatTabletopDate } from "../lib/locale-utils";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function sortNotes(notes: SessionNote[]): SessionNote[] {
  return [...notes].sort((a, b) => b.playedAt.localeCompare(a.playedAt) || b.createdAt.localeCompare(a.createdAt));
}

const emptyDraft = (): Omit<SessionNote, "id" | "createdAt"> => ({
  playedAt: todayIso(),
  title: "",
  content: "",
});

export function SessionNotesPanel({ character, onChange }: Props) {
  const { locale, t } = useLocale();
  const notes = sortNotes(character.sessionNotes ?? []);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = () => {
    if (!draft.content.trim()) return;

    if (editingId) {
      onChange((c) => ({
        ...c,
        sessionNotes: (c.sessionNotes ?? []).map((n) =>
          n.id === editingId
            ? {
                ...n,
                playedAt: draft.playedAt,
                title: draft.title?.trim() || undefined,
                content: draft.content.trim(),
              }
            : n,
        ),
      }));
    } else {
      const note: SessionNote = {
        id: crypto.randomUUID(),
        playedAt: draft.playedAt,
        title: draft.title?.trim() || undefined,
        content: draft.content.trim(),
        createdAt: new Date().toISOString(),
      };
      onChange((c) => ({
        ...c,
        sessionNotes: [note, ...(c.sessionNotes ?? [])],
      }));
    }

    setDraft(emptyDraft());
    setEditingId(null);
  };

  const startEdit = (note: SessionNote) => {
    setEditingId(note.id);
    setDraft({
      playedAt: note.playedAt,
      title: note.title ?? "",
      content: note.content,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const remove = (id: string) => {
    onChange((c) => ({
      ...c,
      sessionNotes: (c.sessionNotes ?? []).filter((n) => n.id !== id),
    }));
    if (editingId === id) cancelEdit();
  };

  return (
    <section className="panel session-notes">
      <h2>{t("session.title")}</h2>
      <p className="panel-hint">{t("session.hint")}</p>

      <div className="session-notes__form">
        <h3 className="dice-section-title">{editingId ? t("session.editEntry") : t("session.newEntry")}</h3>
        <div className="form-field">
          <label>{t("session.playedDate")}</label>
          <input
            type="date"
            value={draft.playedAt}
            onChange={(e) => setDraft({ ...draft, playedAt: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>{t("session.optionalTitle")}</label>
          <input
            placeholder={t("session.titlePlaceholder")}
            value={draft.title ?? ""}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>{t("session.whatHappened")}</label>
          <textarea
            rows={5}
            placeholder={t("session.bodyPlaceholder")}
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          />
        </div>
        <div className="session-notes__actions">
          <button type="button" className="btn" disabled={!draft.content.trim()} onClick={save}>
            {editingId ? t("session.saveChanges") : t("session.addNote")}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              {t("session.cancel")}
            </button>
          )}
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="empty-state">{t("session.empty")}</p>
      ) : (
        <ul className="session-notes__list">
          {notes.map((note) => (
            <li key={note.id} className="session-note-card">
              <header className="session-note-card__head">
                <div>
                  <time className="session-note-card__date" dateTime={note.playedAt}>
                    {formatTabletopDate(note.playedAt, locale)}
                  </time>
                  {note.title && <strong className="session-note-card__title">{note.title}</strong>}
                </div>
                <div className="session-note-card__btns">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(note)}>
                    {t("session.edit")}
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(note.id)}>
                    ×
                  </button>
                </div>
              </header>
              <p className="session-note-card__body">{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

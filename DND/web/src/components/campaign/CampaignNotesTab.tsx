import type { CampaignNote } from "../../types/campaign";
import { useLocale } from "../../context/LocaleContext";
import { formatTabletopDate } from "../../lib/locale-utils";

type NoteDraft = { playedAt: string; title: string; content: string };

type Props = {
  notes: CampaignNote[];
  noteDraft: NoteDraft;
  busy: boolean;
  onDraftChange: (draft: NoteDraft) => void;
  onAdd: () => void;
};

export function CampaignNotesTab({ notes, noteDraft, busy, onDraftChange, onAdd }: Props) {
  const { locale, t } = useLocale();

  return (
    <div className="campaign-tab">
      <div className="campaign-form">
        <label className="form-field">
          <span>{t("campaign.playedDate")}</span>
          <input
            type="date"
            value={noteDraft.playedAt}
            onChange={(e) => onDraftChange({ ...noteDraft, playedAt: e.target.value })}
          />
        </label>
        <label className="form-field">
          <span>{t("campaign.optionalTitle")}</span>
          <input
            value={noteDraft.title}
            onChange={(e) => onDraftChange({ ...noteDraft, title: e.target.value })}
          />
        </label>
        <label className="form-field">
          <span>{t("campaign.whatHappened")}</span>
          <textarea
            rows={3}
            value={noteDraft.content}
            onChange={(e) => onDraftChange({ ...noteDraft, content: e.target.value })}
          />
        </label>
        <button type="button" className="btn btn-block" onClick={onAdd} disabled={busy}>
          {t("campaign.addSharedNote")}
        </button>
      </div>
      <ul className="session-notes__list">
        {notes.map((n) => (
          <li key={n.id} className="session-note-card">
            <time className="session-note-card__date">{formatTabletopDate(n.playedAt, locale)}</time>
            {n.title && <strong className="session-note-card__title">{n.title}</strong>}
            <p className="session-note-card__body">{n.content}</p>
            <span className="muted">— {n.authorName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

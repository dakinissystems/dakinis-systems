import { useRef, useState } from "react";
import type { CampaignDetail, CampaignItem, CampaignNote } from "../../types/campaign";
import { useLocale } from "../../context/LocaleContext";
import { CampaignNotesTab } from "./CampaignNotesTab";
import { CampaignItemsTab } from "./CampaignItemsTab";

type NoteDraft = { playedAt: string; title: string; content: string };
type ItemDraft = { name: string; category: string; quantity: number; description: string };

type Props = {
  detail: CampaignDetail;
  tab: "notes" | "items";
  notes: CampaignNote[];
  items: CampaignItem[];
  noteDraft: NoteDraft;
  itemDraft: ItemDraft;
  busy: boolean;
  onTabChange: (tab: "notes" | "items") => void;
  onNoteDraftChange: (draft: NoteDraft) => void;
  onItemDraftChange: (draft: ItemDraft) => void;
  onAddNote: () => void;
  onAddItem: () => void;
  onCopyInvite: () => void;
  onRename?: (name: string) => void;
};

export function CampaignDetailView({
  detail,
  tab,
  notes,
  items,
  noteDraft,
  itemDraft,
  busy,
  onTabChange,
  onNoteDraftChange,
  onItemDraftChange,
  onAddNote,
  onAddItem,
  onCopyInvite,
  onRename,
}: Props) {
  const { t } = useLocale();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const canRename = detail.role === "owner" && Boolean(onRename);

  const startRename = () => {
    setNameDraft(detail.name);
    setEditingName(true);
    requestAnimationFrame(() => renameInputRef.current?.focus());
  };

  const cancelRename = () => {
    setNameDraft(detail.name);
    setEditingName(false);
  };

  const saveRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2 || trimmed === detail.name) {
      cancelRename();
      return;
    }
    onRename?.(trimmed);
    setEditingName(false);
  };

  return (
    <>
      <div className="campaign-title-bar">
        {editingName ? (
          <div className="campaign-rename">
            <input
              ref={renameInputRef}
              aria-label={t("campaign.renamePlaceholder")}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={80}
            />
            <button type="button" className="btn btn-sm" onClick={saveRename} disabled={busy}>
              {t("campaign.renameSave")}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelRename} disabled={busy}>
              {t("campaign.renameCancel")}
            </button>
          </div>
        ) : (
          <div className="campaign-title-row">
            <h3 className="campaign-title">{detail.name}</h3>
            {canRename && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={startRename} disabled={busy}>
                {t("campaign.rename")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="campaign-invite-bar">
        <div>
          <strong>{t("campaign.inviteForFriends")}</strong>{" "}
          <span className="campaign-code">{detail.inviteCode}</span>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCopyInvite}>
          {t("campaign.copy")}
        </button>
      </div>
      <p className="muted campaign-members">
        {detail.members.map((m) => m.displayName).join(" · ")}
      </p>

      <div className="segmented">
        <button
          type="button"
          className={`segmented__btn ${tab === "notes" ? "segmented__btn--on" : ""}`}
          onClick={() => onTabChange("notes")}
        >
          {t("campaign.notesTab")}
        </button>
        <button
          type="button"
          className={`segmented__btn ${tab === "items" ? "segmented__btn--on" : ""}`}
          onClick={() => onTabChange("items")}
        >
          {t("campaign.itemsTab")}
        </button>
      </div>

      {tab === "notes" && (
        <CampaignNotesTab
          notes={notes}
          noteDraft={noteDraft}
          busy={busy}
          onDraftChange={onNoteDraftChange}
          onAdd={onAddNote}
        />
      )}

      {tab === "items" && (
        <CampaignItemsTab
          items={items}
          itemDraft={itemDraft}
          busy={busy}
          onDraftChange={onItemDraftChange}
          onAdd={onAddItem}
        />
      )}
    </>
  );
}

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
}: Props) {
  const { t } = useLocale();

  return (
    <>
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

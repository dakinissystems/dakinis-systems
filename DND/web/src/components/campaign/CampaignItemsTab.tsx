import type { CampaignItem } from "../../types/campaign";
import { useLocale } from "../../context/LocaleContext";
import { itemCategoryLabel } from "../../lib/locale-utils";

type ItemDraft = { name: string; category: string; quantity: number; description: string };

type Props = {
  items: CampaignItem[];
  itemDraft: ItemDraft;
  busy: boolean;
  onDraftChange: (draft: ItemDraft) => void;
  onAdd: () => void;
};

export function CampaignItemsTab({ items, itemDraft, busy, onDraftChange, onAdd }: Props) {
  const { t } = useLocale();

  return (
    <div className="campaign-tab">
      <div className="campaign-form">
        <label className="form-field">
          <span>{t("campaign.itemName")}</span>
          <input
            value={itemDraft.name}
            onChange={(e) => onDraftChange({ ...itemDraft, name: e.target.value })}
            placeholder={t("campaign.itemPlaceholder")}
          />
        </label>
        <div className="form-row form-row--2">
          <label className="form-field">
            <span>{t("campaign.quantity")}</span>
            <input
              type="number"
              min={1}
              value={itemDraft.quantity}
              onChange={(e) => onDraftChange({ ...itemDraft, quantity: +e.target.value || 1 })}
            />
          </label>
          <label className="form-field">
            <span>{t("campaign.category")}</span>
            <select
              value={itemDraft.category}
              onChange={(e) => onDraftChange({ ...itemDraft, category: e.target.value })}
            >
              <option value="otro">{itemCategoryLabel("otro", t)}</option>
              <option value="arma">{itemCategoryLabel("arma", t)}</option>
              <option value="armadura">{itemCategoryLabel("armadura", t)}</option>
              <option value="curacion">{itemCategoryLabel("curacion", t)}</option>
              <option value="magia">{itemCategoryLabel("magia", t)}</option>
              <option value="supervivencia">{itemCategoryLabel("supervivencia", t)}</option>
            </select>
          </label>
        </div>
        <label className="form-field">
          <span>{t("campaign.description")}</span>
          <input
            value={itemDraft.description}
            onChange={(e) => onDraftChange({ ...itemDraft, description: e.target.value })}
          />
        </label>
        <button type="button" className="btn btn-block" onClick={onAdd} disabled={busy}>
          {t("campaign.addToLoot")}
        </button>
      </div>
      <ul className="campaign-items-list">
        {items.map((item) => (
          <li key={item.id} className="campaign-item-card">
            <strong>
              {item.name}
              {item.quantity > 1 ? ` ×${item.quantity}` : ""}
            </strong>
            <span className="muted">{itemCategoryLabel(item.category, t)}</span>
            {item.description && <p>{item.description}</p>}
            <span className="muted">{t("campaign.addedBy", { name: item.authorName })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

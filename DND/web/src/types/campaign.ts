export interface TabletopUser {
  id: string;
  email: string;
  displayName: string;
  createdAt?: string;
}

/** @deprecated alias interno */
export type DndUser = TabletopUser;

export interface CampaignSummary {
  id: string;
  name: string;
  inviteCode: string;
  role: "owner" | "member";
  memberCount: number;
  createdAt?: string;
}

export interface CampaignMember {
  id: string;
  displayName: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface CampaignDetail extends CampaignSummary {
  members: CampaignMember[];
}

export interface CampaignNote {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  playedAt: string;
  title?: string;
  content: string;
  createdAt: string;
}

export interface CampaignItem {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  name: string;
  category: string;
  quantity: number;
  description?: string;
  createdAt: string;
}

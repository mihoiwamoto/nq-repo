import type { ApprovalStatus } from "../../data/approvals";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

// 本番の箇所の状態は 修理中・要対応・異常あり・正常（未点検は無い）
export type GlassPlasticItemStatus = "repairing" | "action_needed" | "issue" | "normal";

export const GLASS_PLASTIC_STATUS_LABELS: Record<GlassPlasticItemStatus, string> = {
  repairing: "修理中",
  action_needed: "要対応",
  issue: "異常あり",
  normal: "正常",
};

export const GLASS_PLASTIC_STATUS_COLORS: Record<GlassPlasticItemStatus, string> = {
  repairing: "var(--semantic-status-caution)",
  action_needed: "var(--semantic-status-error)",
  issue: "var(--semantic-status-error)",
  normal: "var(--semantic-status-success)",
};

export type GlassPlasticItemRecord = {
  name: string;
  status: GlassPlasticItemStatus;
  content?: string;
  cause?: string;
  actionType?: string;
  actionDetail?: string;
};

export type GlassPlasticRoomRecord = {
  id: string;
  name: string;
  items: GlassPlasticItemRecord[];
};

export type GlassPlasticApprovalRecord = {
  id: string;
  floorId: string;
  floorName: string;
  date: string;
  time: string;
  implementer: string;
  confirmer: string;
  rooms: GlassPlasticRoomRecord[];
  approvalStatus: ApprovalStatus;
  comments?: Comment[];
};

export function countByStatus(record: GlassPlasticApprovalRecord) {
  let total = 0;
  let normal = 0;
  let issue = 0;
  for (const room of record.rooms) {
    for (const item of room.items) {
      total++;
      if (item.status === "normal") normal++;
      else issue++;
    }
  }
  return { total, normal, issue };
}

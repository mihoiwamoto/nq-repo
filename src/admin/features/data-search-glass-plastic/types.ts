export type GlassPlasticItemStatus = "unchecked" | "normal" | "issue";

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export const GLASS_PLASTIC_STATUS_LABELS: Record<GlassPlasticItemStatus, string> = {
  unchecked: "未点検",
  normal: "正常",
  issue: "異常あり",
};

export const GLASS_PLASTIC_STATUS_COLORS: Record<GlassPlasticItemStatus, string> = {
  unchecked: "#b0b0b0",
  normal: "var(--semantic-status-success)",
  issue: "var(--semantic-status-error)",
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

export type GlassPlasticRecord = {
  id: string;
  floorId: string;
  floorName: string;
  date: string;
  implementer: string;
  confirmer: string;
  rooms: GlassPlasticRoomRecord[];
  comment?: string;
  comments?: Comment[];
};

export function countByStatus(record: GlassPlasticRecord) {
  let total = 0;
  let unchecked = 0;
  let normal = 0;
  let issue = 0;
  for (const room of record.rooms) {
    for (const item of room.items) {
      total++;
      if (item.status === "unchecked") unchecked++;
      else if (item.status === "normal") normal++;
      else if (item.status === "issue") issue++;
    }
  }
  return { total, unchecked, normal, issue };
}

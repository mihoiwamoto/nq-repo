export type GlassPlasticItemStatus = "normal" | "issue" | "repairing";

export const GLASS_PLASTIC_STATUS_LABELS: Record<GlassPlasticItemStatus, string> = {
  normal: "正常",
  issue: "異常あり",
  repairing: "修理中",
};

export const GLASS_PLASTIC_STATUS_COLORS: Record<GlassPlasticItemStatus, string> = {
  normal: "var(--semantic-status-success)",
  issue: "var(--semantic-status-error)",
  repairing: "var(--semantic-status-caution)",
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
};

export function countByStatus(record: GlassPlasticRecord) {
  let total = 0;
  let normal = 0;
  let issue = 0;
  let repairing = 0;
  for (const room of record.rooms) {
    for (const item of room.items) {
      total++;
      if (item.status === "normal") normal++;
      else if (item.status === "issue") issue++;
      else repairing++;
    }
  }
  return { total, normal, issue, repairing };
}

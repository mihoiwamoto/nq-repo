import { rooms as roomTemplates } from "../../../app/features/glass-plastic/mockData";
import type { GlassPlasticApprovalRecord, GlassPlasticItemStatus, GlassPlasticRoomRecord } from "./types";

type Override = {
  status: GlassPlasticItemStatus;
  content?: string;
  cause?: string;
  actionType?: string;
  actionDetail?: string;
};

function buildRooms(overrides: Record<string, Override> = {}): GlassPlasticRoomRecord[] {
  return roomTemplates.map((room) => ({
    id: room.id,
    name: room.name,
    items: room.items.map((item) => {
      const override = overrides[`${room.id}|${item.name}`];
      return {
        name: item.name,
        status: override?.status ?? "normal",
        content: override?.content,
        cause: override?.cause,
        actionType: override?.actionType,
        actionDetail: override?.actionDetail,
      };
    }),
  }));
}

export const glassPlasticApprovalRecords: GlassPlasticApprovalRecord[] = [
  {
    id: "gpa1",
    floorId: "f1",
    floorName: "フロアA",
    date: "2025-04-01",
    time: "09:00",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
    rooms: buildRooms({
      "entrance|窓ガラス1": {
        status: "issue",
        content: "ひび割れ",
        cause: "人や物との接触",
        actionType: "補修テープでの応急処置",
      },
    }),
    approvalStatus: "pending",
  },
  {
    id: "gpa2",
    floorId: "f1",
    floorName: "フロアA",
    date: "2025-04-02",
    time: "09:00",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
    rooms: buildRooms(),
    approvalStatus: "pending",
  },
  {
    id: "gpa3",
    floorId: "f2",
    floorName: "フロアB",
    date: "2025-04-01",
    time: "09:00",
    implementer: "中村健一",
    confirmer: "佐藤花子",
    rooms: buildRooms({
      "washing-room|窓ガラス1": {
        status: "issue",
        content: "その他",
        cause: "その他",
        actionType: "その他",
        actionDetail: "パッキンの劣化による水漏れを確認",
      },
    }),
    approvalStatus: "pending",
  },
];

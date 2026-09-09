import { rooms as roomTemplates } from "../../../app/features/glass-plastic/mockData";
import type { GlassPlasticItemStatus, GlassPlasticRecord, GlassPlasticRoomRecord } from "./types";

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

export const glassPlasticRecords: GlassPlasticRecord[] = [
  {
    id: "dgp1",
    floorId: "f1",
    floorName: "フロアA",
    date: "2025-04-01",
    implementer: "田中太郎",
    confirmer: "確認者01",
    rooms: buildRooms({
      "entrance|時計1": {
        status: "issue",
        content: "破損",
        cause: "人や物との接触",
        actionType: "修理依頼",
      },
      "entrance|窓ガラス1": {
        status: "issue",
        content: "ひび割れ",
        cause: "人や物との接触",
        actionType: "補修テープでの応急処置",
      },
    }),
    comments: [
      {
        id: "c1",
        author: "鈴木修",
        timestamp: "2026.08.19 10:39",
        text: "検索条件を確認しました。問題ありません。",
      },
      {
        id: "c2",
        author: "山田花子",
        timestamp: "2026.08.23 15:45",
        text: "データ抽出の期間を再度ご確認ください。",
      },
    ],
  },
  {
    id: "dgp2",
    floorId: "f1",
    floorName: "フロアA",
    date: "2025-04-02",
    implementer: "田中太郎",
    confirmer: "確認者01",
    rooms: buildRooms(),
  },
  {
    id: "dgp3",
    floorId: "f2",
    floorName: "フロアB",
    date: "2025-04-01",
    implementer: "実施者02",
    confirmer: "確認者02",
    rooms: buildRooms({
      "washing-room|窓ガラス1": {
        status: "issue",
        content: "その他",
        cause: "その他",
        actionType: "その他",
        actionDetail: "パッキンの劣化による水漏れを確認",
      },
    }),
  },
];

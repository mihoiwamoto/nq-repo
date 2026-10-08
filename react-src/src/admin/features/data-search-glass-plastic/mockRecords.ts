import { rooms as roomTemplates } from "../../../app/features/glass-plastic/mockData";
import type { GlassPlasticItemStatus, GlassPlasticRecord, GlassPlasticRoomRecord } from "./types";
import { aprilDays, at, demoComments, statusAt, ymd } from "../../data/demoRecordGen";

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
    approvalStatus: "approved",
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
    approvalStatus: "pending",
    rooms: buildRooms(),
  },
  {
    id: "dgp3",
    floorId: "f2",
    floorName: "フロアB",
    date: "2025-04-01",
    implementer: "実施者02",
    confirmer: "確認者02",
    approvalStatus: "approved",
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

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の dgp1〜dgp3 は画面設計の hash と確定デザインが使うので変えない）。
 * フロアごとに 4 月の稼働日に 1 回（フロアA は月曜・金曜に 2 回目の巡回も）。3 月末・5 月頭にも少し。
 * 異常ありの箇所（破損・ひび割れ・欠け などの内容、原因、対応）を部屋をまたいで混ぜる。
 * ─────────────────────────────────────────────────────────────── */
const GP_ISSUES: Record<string, Override>[] = [
  { "pudding-area|窓ガラス2": { status: "issue", content: "破損", cause: "人や物との接触", actionType: "修理依頼" } },
  { "sanitary-room|鏡1": { status: "issue", content: "ひび割れ", cause: "人や物との接触", actionType: "補修テープでの応急処置" } },
  {
    "ice-area|プラスチック棚2": {
      status: "issue",
      content: "その他",
      cause: "人や物との接触",
      actionType: "その他",
      actionDetail: "棚の角に欠けを確認。欠けた破片は回収済み。棚は使用を止め、交換を手配した。",
    },
  },
  {
    "mixing-room|温度計1": {
      status: "issue",
      content: "ひび割れ",
      cause: "その他",
      actionType: "修理依頼",
    },
    "mixing-room|時計2": { status: "issue", content: "破損", cause: "人や物との接触", actionType: "補修テープでの応急処置" },
  },
  {
    "drying-room-2|包丁/カット類1": {
      status: "issue",
      content: "その他",
      cause: "その他",
      actionType: "その他",
      actionDetail:
        "刃先に約2mmの欠けを確認。欠片は作業台の上で回収し、製品への混入が無いことを確認した。包丁は廃棄し、新しいものに交換。当日製造分は金属探知機で全数を再検査した。",
    },
  },
  { "shipping-dock|シャッター1": { status: "issue", content: "破損", cause: "人や物との接触", actionType: "修理依頼" } },
  { "entrance|窓ガラス1": { status: "issue", content: "ひび割れ", cause: "人や物との接触", actionType: "補修テープでの応急処置" } },
  {
    "product-fridge|温度計1": {
      status: "issue",
      content: "その他",
      cause: "その他",
      actionType: "その他",
      actionDetail: "表示が薄く読めない。電池を交換して表示を確認した。",
    },
  },
];

const GP_FLOORS = [
  { floorId: "f1", floorName: "フロアA", start: 3, staff: ["田中太郎", "高橋美咲", "佐藤健一"], confirmer: "確認者01", second: [14] },
  { floorId: "f2", floorName: "フロアB", start: 2, staff: ["実施者02", "渡辺真由"], confirmer: "確認者02", second: [] as number[] },
  { floorId: "f3", floorName: "フロアC", start: 1, staff: ["小林誠司", "松本奈々"], confirmer: "山本拓海", second: [] as number[] },
];

function glassPlasticExtra(): GlassPlasticRecord[] {
  const out: GlassPlasticRecord[] = [];
  let n = 0;
  GP_FLOORS.forEach((f, fi) => {
    // フロアA は土曜を除く・フロアB は水曜を除く・フロアC は 2 日に 1 回
    const april = aprilDays(f.start, 30, fi === 0 ? [5, 12, 19, 26] : fi === 1 ? [9, 16, 23, 30] : []).filter((_, i) => fi !== 2 || i % 2 === 0);
    const days: [number, number][] = [[3, 27], [3, 31], ...april.map((d) => [4, d] as [number, number]), [5, 1]];
    for (const [m, d] of days) {
      const visits = m === 4 && f.second.includes(d) ? 2 : 1;
      for (let v = 0; v < visits; v++) {
        const date = ymd(m, d);
        const id = `dgp-x${fi + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}${v ? "-pm" : ""}`;
        const issue = n % 3 === 0 ? at(GP_ISSUES, n / 3 + fi) : undefined;
        const rec: GlassPlasticRecord = {
          id,
          floorId: f.floorId,
          floorName: f.floorName,
          date,
          implementer: at(f.staff, n),
          confirmer: f.confirmer,
          approvalStatus: statusAt(n + fi),
          rooms: buildRooms(issue),
        };
        if (issue && n % 2 === 0) {
          rec.comments = demoComments(id, date, [
            [f.confirmer, "異常のあった箇所の写真を共有してください。交換の手配状況も確認します。"],
          ]);
        }
        out.push(rec);
        n++;
      }
    }
  });
  return out;
}

glassPlasticRecords.push(...glassPlasticExtra());

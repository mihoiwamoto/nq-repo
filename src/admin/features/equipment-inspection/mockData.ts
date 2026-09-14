import type { ChecklistItem, Line, ScheduleEntry } from "./types";

export const initialLines: Line[] = [
  { id: "l1", name: "豆乳ライン", frequency: "weekly", inspectionPoints: [] },
  { id: "l2", name: "ゆばライン（その他）", frequency: "weekly", inspectionPoints: [] },
  { id: "l3", name: "殺菌ライン", frequency: "weekly", inspectionPoints: [] },
  { id: "l4", name: "冷蔵倉庫ライン", frequency: "weekly", inspectionPoints: [] },
  { id: "l5", name: "充填・包装ライン", frequency: "weekly", inspectionPoints: [] },
  { id: "l6", name: "原料受入ライン", frequency: "weekly", inspectionPoints: [] },
  { id: "l7", name: "豆乳ライン", frequency: "yearly", inspectionPoints: [] },
  {
    id: "l8",
    name: "豆乳ライン",
    frequency: "daily",
    displayFrom: "2025-04-01",
    displayTo: "2028-04-01",
    inspectionPoints: [
      { id: "p1", location: "エコスター", items: ["定量部", "タンク部", "駆動ベルト"] },
      { id: "p2", location: "ボイル槽", items: ["温度計・水位"] },
    ],
  },
  { id: "l9", name: "ゆばライン（つまみ関係）", frequency: "daily", inspectionPoints: [] },
  { id: "l10", name: "ゆばライン（その他）", frequency: "daily", inspectionPoints: [] },
  { id: "l11", name: "自動計量機・風力選別機ライン", frequency: "daily", inspectionPoints: [] },
  { id: "l12", name: "冷凍・冷蔵設備ライン", frequency: "monthly", inspectionPoints: [] },
  { id: "l13", name: "排水処理設備ライン", frequency: "monthly", inspectionPoints: [] },
  { id: "l14", name: "ボイラー設備ライン", frequency: "monthly", inspectionPoints: [] },
  { id: "l15", name: "コンプレッサー設備ライン", frequency: "monthly", inspectionPoints: [] },
  { id: "l16", name: "空調・フィルターライン", frequency: "monthly", inspectionPoints: [] },
  { id: "l17", name: "計量器・秤設備ライン", frequency: "monthly", inspectionPoints: [] },
];

export const initialEntries: Record<string, ScheduleEntry> = {
  "2025-04-01": { dateKey: "2025-04-01", lineIds: ["l1", "l2", "l7"] },
};

export const initialChecklistItems: ChecklistItem[] = [
  { id: "c1", text: "破損、損傷、部品の欠落、劣化等がないか" },
  { id: "c2", text: "異物や汚れはついていないか" },
  { id: "c3", text: "問題なく動作するか" },
  { id: "c4", text: "【豆乳ライン】洗浄後のすすぎ残しがないか" },
  { id: "c5", text: "【ゆばライン(その他)】ゆば槽（膜張り槽）の温度が規定の保温温度に維持されているか" },
];

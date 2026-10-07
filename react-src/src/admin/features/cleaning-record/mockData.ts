import type { Line, ScheduleEntry } from "./types";

export const initialLines: Line[] = [
  {
    id: "c1",
    name: "ゆばライン",
    frequency: "daily",
    displayFrom: "2025-04-01",
    displayTo: "2028-04-01",
    cleaningPoints: [
      { id: "cp1", location: "つまみ上げパック機", items: ["シール部", "コンベアベルト", "充填ノズル"] },
      { id: "cp2", location: "充填包装機", items: ["コンベア清掃", "充填ノズル洗浄"] },
    ],
  },
  { id: "c2", name: "充填・包装ライン", frequency: "daily", cleaningPoints: [] },
  { id: "c3", name: "豆乳パックライン", frequency: "daily", cleaningPoints: [] },
  { id: "c4", name: "自動計量機・風力選別機ライン", frequency: "daily", cleaningPoints: [] },
  // 毎週のライン。アプリの見本（app/features/cleaning-record/mockData.ts の毎週）と同じ名前・id にそろえる
  { id: "c5", name: "豆乳ライン", frequency: "weekly", cleaningPoints: [] },
  { id: "c16", name: "殺菌ライン", frequency: "weekly", cleaningPoints: [] },
  { id: "c17", name: "冷蔵倉庫ライン", frequency: "weekly", cleaningPoints: [] },
  { id: "c18", name: "充填・包装ライン", frequency: "weekly", cleaningPoints: [] },
  { id: "c19", name: "原料受入ライン", frequency: "weekly", cleaningPoints: [] },
  { id: "c20", name: "自動計量機・風力選別機ライン", frequency: "weekly", cleaningPoints: [] },
];

export const initialEntries: Record<string, ScheduleEntry> = {
  // アプリの点検予定（app/features/cleaning-record/ScheduleContext）と帳票一覧の毎週（scheduledDate 2025-04-01）にそろえる。
  // 毎日のラインは予定に入れない（予定のポップアップに毎日のタブが無い）。アプリの毎週のゆばライン（c4）は、ここの c4 が毎日の別ラインなので入れていない
  "2025-04-01": { dateKey: "2025-04-01", lineIds: ["c5", "c16", "c17", "c18", "c19", "c20"] },
};

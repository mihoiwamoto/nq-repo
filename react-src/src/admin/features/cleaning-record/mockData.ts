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
];

export const initialEntries: Record<string, ScheduleEntry> = {
  "2025-04-01": { dateKey: "2025-04-01", lineIds: ["c1"] },
};

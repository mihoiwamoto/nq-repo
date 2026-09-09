import type { ChecklistGroup, MachineApprovalRecord } from "./types";

export const METAL_DETECTOR_CHECKLIST: ChecklistGroup[] = [
  {
    title: "電源ON",
    items: [
      { key: "power_on", label: "電源が正常に入り始動する" },
      { key: "panel_ok", label: "操作パネルに異常がなく操作できる" },
    ],
  },
  {
    title: "コンベア・プーリー・モーター",
    items: [
      { key: "conveyor_ok", label: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
      { key: "roller_ok", label: "ローラーに引っ掛かりがないか（サーチコイルに接触していないか）" },
    ],
  },
  {
    title: "設定",
    items: [{ key: "setting_ok", label: "各設定基準が正しいか" }],
  },
  {
    title: "はね板（フリッパー）",
    items: [{ key: "flipper_ok", label: "正常に反応し作動する" }],
  },
];

export const XRAY_DETECTOR_CHECKLIST: ChecklistGroup[] = [
  {
    title: "電源ON",
    items: [
      { key: "power_on", label: "電源が正常に入り始動する" },
      { key: "panel_ok", label: "操作パネルに異常がなく操作できる" },
    ],
  },
  {
    title: "コンベア・センサー",
    items: [
      { key: "conveyor_ok", label: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
      { key: "contact_ok", label: "機械同士の接触が無いか" },
    ],
  },
  {
    title: "はね板（フリッパー）",
    items: [{ key: "flipper_ok", label: "正常に反応し作動する" }],
  },
];

export const machineApprovalRecords: MachineApprovalRecord[] = [
  {
    id: "am1",
    machineName: "金探1号機（500g以下の場合）",
    date: "2025-04-01",
    confirmer: "田中美咲",
    approvalStatus: "pending",
    records: [
      {
        id: "am1-1",
        category: "開始",
        time: "08:25",
        content: "動作確認",
        passedProduct: "ー",
        result: "OK",
        remarks: "定期検査、全項目確認完了。異常なし。",
        inspectorName: "田中太郎",
        checklistDetail: {
          metalTime: "08:25",
          metalTimeTimestamp: "田中太郎 2025/04/01 08:25",
          metalChecks: { power_on: "OK", panel_ok: "OK", conveyor_ok: "OK", roller_ok: "OK", setting_ok: "OK", flipper_ok: "OK" },
          metalTimestamps: { power_on: "田中太郎 2025/04/01 08:25", panel_ok: "田中太郎 2025/04/01 08:26", conveyor_ok: "田中太郎 2025/04/01 08:27", roller_ok: "田中太郎 2025/04/01 08:28", setting_ok: "田中太郎 2025/04/01 08:29", flipper_ok: "田中太郎 2025/04/01 08:30" },
          xrayTime: "08:25",
          xrayTimeTimestamp: "田中太郎 2025/04/01 08:31",
          xrayChecks: { power_on: "OK", panel_ok: "OK", conveyor_ok: "OK", contact_ok: "OK", flipper_ok: "OK" },
          xrayTimestamps: { power_on: "田中太郎 2025/04/01 08:31", panel_ok: "田中太郎 2025/04/01 08:32", conveyor_ok: "田中太郎 2025/04/01 08:33", contact_ok: "田中太郎 2025/04/01 08:34", flipper_ok: "田中太郎 2025/04/01 08:35" },
        },
      },
      {
        id: "am1-2",
        category: "開始",
        time: "08:30",
        content: "テストピース",
        passedProduct: "ー",
        result: "NG",
        remarks: "Fe検出異常により点検実施。機械設定を調整した。",
        inspectorName: "田中太郎",
      },
      {
        id: "am1-3",
        category: "開始",
        time: "08:35",
        content: "製品通過",
        passedProduct: "仕出しだし巻き玉子 冷凍",
        result: "NG",
        remarks: "シーリング異常検出。外観検査で異常を確認。機械停止して対応。",
        inspectorName: "田中太郎",
      },
      {
        id: "am1-4",
        category: "終了",
        time: "17:00",
        content: "製品通過",
        passedProduct: "仕出しだし巻き玉子 冷凍",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "am1-5",
        category: "終了",
        time: "17:05",
        content: "テストピース",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "am1-6",
        category: "終了",
        time: "17:10",
        content: "異常反応",
        passedProduct: "仕出しだし巻き玉子 冷凍",
        result: "NG",
        remarks: "最終検査時に金属探知機が反応。異物混入の可能性あり。",
        inspectorName: "田中太郎",
        cause: "異物混入",
        response: "金属探知機の感度調整及び校正テスト実施",
      },
    ],
  },
];

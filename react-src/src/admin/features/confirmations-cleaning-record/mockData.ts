import type { CleaningConfirmationRecord } from "./types";

export const cleaningConfirmationRecords: CleaningConfirmationRecord[] = [
  {
    id: "clc1",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "異常なし",
    implementer: "高橋和子",
    confirmer: "加藤由美",
    confirmStatus: "unconfirmed",
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
    detailRemarks:
      "充填包装機のコンベア清掃時、ベルト裏面に微量の粉体付着あり。通常清掃にて除去済み。次回も重点確認予定。",
    cleaningPoints: [
      {
        location: "つまみ上げパック機",
        items: [
          { name: "シール部", cleaned: true, inspector: "高橋和子", timestamp: "2025/04/01 07:08" },
          { name: "コンベアベルト", cleaned: true, inspector: "高橋和子", timestamp: "2025/04/01 07:12" },
          { name: "充塡ノズル", cleaned: true, inspector: "高橋和子", timestamp: "2025/04/01 07:18" },
        ],
      },
      {
        location: "充填包装機",
        items: [
          { name: "コンベア清掃", cleaned: true, inspector: "高橋和子", timestamp: "2025/04/01 20:12" },
          { name: "充填ノズル洗浄", cleaned: true, inspector: "高橋和子", timestamp: "2025/04/01 20:19" },
        ],
      },
    ],
  },
  {
    id: "clc2",
    date: "2025-04-01",
    lineLabel: "【毎日】冷蔵倉庫ライン",
    cleaned: false,
    remarks: "清掃設備メンテナンス中のため翌日に見送り",
    implementer: "中村美咲",
    confirmer: "田中裕子",
    confirmStatus: "unconfirmed",
    cleaningPoints: [],
  },
  {
    id: "clc3",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    cleaned: true,
    remarks: "排水溝の汚れ軽微",
    implementer: "佐々木理恵",
    confirmer: "鈴木一郎",
    confirmStatus: "confirmed",
    cleaningPoints: [],
  },
  {
    id: "clc4",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "",
    implementer: "高橋和子",
    confirmer: "加藤由美",
    confirmStatus: "confirmed",
    cleaningPoints: [],
  },
];

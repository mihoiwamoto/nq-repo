export type CleaningItem = {
  name: string;
  category: string;
  cleaned: boolean;
  implementer: string;
  timestamp: string;
};

export type CleaningLocation = {
  name: string;
  items: CleaningItem[];
};

export type CleaningApprovalRecord = {
  id: string;
  date: string;
  lineLabel: string;
  cleaned: boolean;
  remarks: string;
  implementer: string;
  confirmer: string;
  locations?: CleaningLocation[];
};

export const cleaningApprovalRecords: CleaningApprovalRecord[] = [
  {
    id: "a1",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "充填包装機のコンベア清掃、ベルト表面に微量の粉付着があり、通常清掃にて除去済み。次回も重点確認予定。",
    implementer: "高橋和子",
    confirmer: "加藤由美",
    locations: [
      {
        name: "つまみ上げバック機",
        items: [
          { name: "シール部", category: "清掃項目", cleaned: true, implementer: "高橋和子", timestamp: "2025/04/01 07:08" },
          { name: "コンベアベルト", category: "清掃項目", cleaned: true, implementer: "高橋和子", timestamp: "2025/04/01 07:12" },
          { name: "充填ノズル", category: "清掃項目", cleaned: true, implementer: "高橋和子", timestamp: "2025/04/01 07:18" },
        ],
      },
      {
        name: "充填包装機",
        items: [
          { name: "コンベア清掃", category: "清掃項目", cleaned: true, implementer: "高橋和子", timestamp: "2025/04/01 20:12" },
          { name: "充填ノズル洗浄", category: "清掃項目", cleaned: true, implementer: "高橋和子", timestamp: "2025/04/01 20:19" },
        ],
      },
    ],
  },
  {
    id: "a2",
    date: "2025-04-01",
    lineLabel: "【毎日】冷蔵倉庫ライン",
    cleaned: false,
    remarks: "清掃設備メンテナンス中のため翌日に見送り",
    implementer: "中村美咲",
    confirmer: "田中裕子",
  },
  {
    id: "a3",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    cleaned: true,
    remarks: "排水溝の汚れ軽微",
    implementer: "佐々木理恵",
    confirmer: "鈴木一郎",
  },
  {
    id: "a4",
    date: "2025-04-01",
    lineLabel: "【毎週】原料受入ライン",
    cleaned: false,
    remarks: "",
    implementer: "渡辺修一",
    confirmer: "山田麻子",
  },
  {
    id: "a5",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "",
    implementer: "高橋和子",
    confirmer: "加藤由美",
  },
  {
    id: "a6",
    date: "2025-04-02",
    lineLabel: "【毎日】冷蔵倉庫ライン",
    cleaned: true,
    remarks: "",
    implementer: "中村美咲",
    confirmer: "田中裕子",
  },
  {
    id: "a7",
    date: "2025-04-02",
    lineLabel: "【毎日】豆乳ライン",
    cleaned: true,
    remarks: "異常なし",
    implementer: "佐々木理恵",
    confirmer: "鈴木一郎",
  },
  {
    id: "a8",
    date: "2025-04-02",
    lineLabel: "【毎週】原料受入ライン",
    cleaned: false,
    remarks: "搬入口周辺の汚れにより翌日に見送り",
    implementer: "渡辺修一",
    confirmer: "山田麻子",
  },
];

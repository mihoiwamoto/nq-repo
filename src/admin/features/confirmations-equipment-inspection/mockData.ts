import type { EquipmentConfirmationRecord } from "./types";

export const equipmentConfirmationRecords: EquipmentConfirmationRecord[] = [
  {
    id: "eqc1",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ng",
    remarks: "エコスター タンク部に油汚れを確認。分解洗浄にて対応済み。",
    implementer: "佐藤健一",
    confirmer: "鈴木雅人",
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
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 07:15", inspector: "佐藤健一" },
              {
                name: "タンク部",
                status: "ng",
                cause: "汚れ",
                action: "その他　内部に油汚れを確認、分解洗浄を実施済み",
                timestamp: "2025/04/01 07:08",
                inspector: "佐藤健一",
              },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 06:52", inspector: "佐藤健一" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/01 06:52", inspector: "佐藤健一" },
            ],
          },
        ],
        remarks:
          "エコスター タンク部に油汚れを確認。分解洗浄にて対応済み。次回点検時に再確認予定。その他の点検項目は異常なし。",
      },
      {
        segment: "終業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 17:15", inspector: "佐藤健一" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/01 17:08", inspector: "佐藤健一" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 16:52", inspector: "佐藤健一" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "eqc2",
    date: "2025-04-01",
    lineLabel: "【毎週】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "高橋美咲",
    confirmer: "加藤由美",
    confirmStatus: "confirmed",
    sessions: [
      {
        segment: "点検",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 09:00", inspector: "高橋美咲" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/01 08:55", inspector: "高橋美咲" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "eqc3",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "skip",
    remarks: "点検見送り 設備メンテナンスのためライン停止中。",
    implementer: "小林誠司",
    confirmer: "鈴木雅人",
    confirmStatus: "unconfirmed",
    sessions: [],
  },
  {
    id: "eqc4",
    date: "2025-04-02",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "山本拓海",
    confirmer: "加藤由美",
    confirmStatus: "confirmed",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/02 07:15", inspector: "山本拓海" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/02 07:08", inspector: "山本拓海" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
];

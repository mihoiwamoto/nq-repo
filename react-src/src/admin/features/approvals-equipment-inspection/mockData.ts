import type { EquipmentApprovalRecord } from "./types";

export const equipmentApprovalRecords: EquipmentApprovalRecord[] = [
  {
    id: "a1",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "全項目正常、異常なし",
    implementer: "佐藤健一",
    confirmer: "鈴木雅人",
    approvalStatus: "approved",
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
              {
                name: "タンク部",
                status: "ng",
                cause: "汚れ",
                action: "その他　内部に油汚れを確認、分解洗浄を実施済み",
                timestamp: "2025/04/01 17:08",
                inspector: "佐藤健一",
              },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 16:52", inspector: "佐藤健一" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/01 16:45", inspector: "佐藤健一" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a2",
    date: "2025-04-01",
    lineLabel: "【毎週】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "高橋美咲",
    confirmer: "加藤由美",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "点検",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 09:00", inspector: "高橋美咲" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/01 08:55", inspector: "高橋美咲" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 08:50", inspector: "高橋美咲" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/01 08:45", inspector: "高橋美咲" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a3",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ng",
    remarks: "タンク内部に油汚れを確認、分解洗浄にて対応済み",
    implementer: "渡辺真由",
    confirmer: "伊藤裕太",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "原料タンク",
            items: [
              {
                name: "タンク内部",
                status: "ng",
                cause: "汚れ",
                action: "その他　内部に油汚れを確認、分解洗浄を実施済み",
                timestamp: "2025/04/01 07:10",
                inspector: "渡辺真由",
              },
              { name: "バルブ", status: "ok", timestamp: "2025/04/01 07:05", inspector: "渡辺真由" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/01 06:55", inspector: "渡辺真由" },
              { name: "シール部", status: "ok", timestamp: "2025/04/01 06:50", inspector: "渡辺真由" },
            ],
          },
        ],
        remarks: "原料タンク内部に油汚れを確認。分解洗浄にて対応済み。",
      },
      {
        segment: "終業",
        points: [
          {
            location: "原料タンク",
            items: [
              { name: "タンク内部", status: "ok", timestamp: "2025/04/01 17:10", inspector: "渡辺真由" },
              { name: "バルブ", status: "ok", timestamp: "2025/04/01 17:05", inspector: "渡辺真由" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/01 16:55", inspector: "渡辺真由" },
              { name: "シール部", status: "ok", timestamp: "2025/04/01 16:50", inspector: "渡辺真由" },
            ],
          },
        ],
        remarks: "対応後、再確認済み。異常なし。",
      },
    ],
  },
  {
    id: "a4",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "skip",
    remarks:
      "点検見送り 設備メンテナンスのためライン停止中。業者による定期整備作業が終日実施されており、点検対象の機器にアクセスできないため、本日の点検を見送りとする。整備完了後の翌営業日に点検を実施予定。",
    implementer: "小林誠司",
    confirmer: "鈴木雅人",
    approvalStatus: "approved",
    sessions: [],
  },
  {
    id: "a5",
    date: "2025-04-02",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "山本拓海",
    confirmer: "加藤由美",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/02 07:15", inspector: "山本拓海" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/02 07:08", inspector: "山本拓海" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/02 06:52", inspector: "山本拓海" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/02 06:52", inspector: "山本拓海" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/02 17:15", inspector: "山本拓海" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/02 17:08", inspector: "山本拓海" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/02 16:52", inspector: "山本拓海" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/02 16:45", inspector: "山本拓海" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a6",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ok",
    remarks: "ベルト摩耗あり、次回交換予定",
    implementer: "吉田浩二",
    confirmer: "伊藤裕太",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "切断機",
            items: [
              { name: "刃部", status: "ok", timestamp: "2025/04/02 07:10", inspector: "吉田浩二" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/02 07:05", inspector: "吉田浩二" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/02 06:55", inspector: "吉田浩二" },
              { name: "シール部", status: "ok", timestamp: "2025/04/02 06:50", inspector: "吉田浩二" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "切断機",
            items: [
              { name: "刃部", status: "ok", timestamp: "2025/04/02 17:10", inspector: "吉田浩二" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/02 17:05", inspector: "吉田浩二" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/02 16:55", inspector: "吉田浩二" },
              { name: "シール部", status: "ok", timestamp: "2025/04/02 16:50", inspector: "吉田浩二" },
            ],
          },
        ],
        remarks: "駆動ベルトにわずかな摩耗を確認。次回点検時に交換予定。他の項目は異常なし。",
      },
    ],
  },
  {
    id: "a7",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "ok",
    remarks: "異常なし",
    implementer: "田村康平",
    confirmer: "鈴木雅人",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "ゆば槽（膜張り槽）",
            items: [
              { name: "温度", status: "ok", timestamp: "2025/04/02 07:00", inspector: "田村康平" },
              { name: "水位", status: "ok", timestamp: "2025/04/02 06:55", inspector: "田村康平" },
            ],
          },
          {
            location: "巻き取り機",
            items: [
              { name: "駆動部", status: "ok", timestamp: "2025/04/02 06:50", inspector: "田村康平" },
              { name: "巻き取りローラー", status: "ok", timestamp: "2025/04/02 06:45", inspector: "田村康平" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "ゆば槽（膜張り槽）",
            items: [
              { name: "温度", status: "ok", timestamp: "2025/04/02 17:00", inspector: "田村康平" },
              { name: "水位", status: "ok", timestamp: "2025/04/02 16:55", inspector: "田村康平" },
            ],
          },
          {
            location: "巻き取り機",
            items: [
              { name: "駆動部", status: "ok", timestamp: "2025/04/02 16:50", inspector: "田村康平" },
              { name: "巻き取りローラー", status: "ok", timestamp: "2025/04/02 16:45", inspector: "田村康平" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a8",
    date: "2025-04-03",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "松本奈々",
    confirmer: "加藤由美",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/03 07:15", inspector: "松本奈々" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/03 07:08", inspector: "松本奈々" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/03 06:52", inspector: "松本奈々" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/03 06:52", inspector: "松本奈々" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/03 17:15", inspector: "松本奈々" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/03 17:08", inspector: "松本奈々" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/03 16:52", inspector: "松本奈々" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/03 16:45", inspector: "松本奈々" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a9",
    date: "2025-04-03",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ok",
    remarks: "",
    implementer: "佐藤健一",
    confirmer: "伊藤裕太",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "切断機",
            items: [
              { name: "刃部", status: "ok", timestamp: "2025/04/03 07:10", inspector: "佐藤健一" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/03 07:05", inspector: "佐藤健一" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/03 06:55", inspector: "佐藤健一" },
              { name: "シール部", status: "ok", timestamp: "2025/04/03 06:50", inspector: "佐藤健一" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "切断機",
            items: [
              { name: "刃部", status: "ok", timestamp: "2025/04/03 17:10", inspector: "佐藤健一" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/03 17:05", inspector: "佐藤健一" },
            ],
          },
          {
            location: "計量包装機",
            items: [
              { name: "計量部", status: "ok", timestamp: "2025/04/03 16:55", inspector: "佐藤健一" },
              { name: "シール部", status: "ok", timestamp: "2025/04/03 16:50", inspector: "佐藤健一" },
            ],
          },
        ],
        remarks: "",
      },
    ],
  },
  {
    id: "a10",
    date: "2025-04-03",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "ok",
    remarks: "パッキン交換済み、動作確認完了",
    implementer: "高橋美咲",
    confirmer: "鈴木雅人",
    approvalStatus: "approved",
    sessions: [
      {
        segment: "始業",
        points: [
          {
            location: "ゆば槽（膜張り槽）",
            items: [
              { name: "温度", status: "ok", timestamp: "2025/04/03 07:00", inspector: "高橋美咲" },
              { name: "水位", status: "ok", timestamp: "2025/04/03 06:55", inspector: "高橋美咲" },
            ],
          },
          {
            location: "巻き取り機",
            items: [
              { name: "駆動部", status: "ok", timestamp: "2025/04/03 06:50", inspector: "高橋美咲" },
              { name: "巻き取りローラー", status: "ok", timestamp: "2025/04/03 06:45", inspector: "高橋美咲" },
            ],
          },
        ],
        remarks: "",
      },
      {
        segment: "終業",
        points: [
          {
            location: "ゆば槽（膜張り槽）",
            items: [
              { name: "温度", status: "ok", timestamp: "2025/04/03 17:00", inspector: "高橋美咲" },
              { name: "水位", status: "ok", timestamp: "2025/04/03 16:55", inspector: "高橋美咲" },
            ],
          },
          {
            location: "巻き取り機",
            items: [
              { name: "駆動部", status: "ok", timestamp: "2025/04/03 16:50", inspector: "高橋美咲" },
              { name: "巻き取りローラー", status: "ok", timestamp: "2025/04/03 16:45", inspector: "高橋美咲" },
            ],
          },
        ],
        remarks: "巻き取り機のパッキンを交換済み。動作確認完了、異常なし。",
      },
    ],
  },
];

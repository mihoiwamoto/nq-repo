import type { InspectionRecord } from "./types";

export const inspectionRecords: InspectionRecord[] = [
  {
    id: "r1",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "全項目正常、異常なし",
    implementer: "田中太郎",
    confirmer: "山田花子",
    approvalStatus: "pending",
    metalComments: [
      {
        id: "mc1",
        author: "田中太郎",
        timestamp: "2026.08.19 10:39",
        text: "金属探知機の動作確認を実施しました。全ての検査項目で正常に動作しています。",
      },
      {
        id: "mc2",
        author: "佐藤花子",
        timestamp: "2026.08.23 15:45",
        text: "キャリブレーション値の確認を完了しました。問題ありません。",
      },
    ],
    xrayComments: [
      {
        id: "xc1",
        author: "田中太郎",
        timestamp: "2026.08.19 11:15",
        text: "X線探知機の感度設定を確認しました。正常範囲内です。",
      },
      {
        id: "xc2",
        author: "山田花子",
        timestamp: "2026.08.27 16:20",
        text: "定期メンテナンススケジュールを確認しました。次回は9月中旬の予定です。",
      },
    ],
    sessions: [
      {
        segment: "始業",
        remarks: "エコスターの定期清掃を実施。点検の結果、異常なし。",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 07:15", inspector: "田中太郎" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/01 07:08", inspector: "田中太郎" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 06:52", inspector: "田中太郎" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/01 06:52", inspector: "田中太郎" },
            ],
          },
        ],
      },
      {
        segment: "終業",
        remarks: "",
        points: [
          {
            location: "エコスター",
            items: [
              { name: "定量部", status: "ok", timestamp: "2025/04/01 17:15", inspector: "田中太郎" },
              { name: "タンク部", status: "ok", timestamp: "2025/04/01 17:08", inspector: "田中太郎" },
              { name: "駆動ベルト", status: "ok", timestamp: "2025/04/01 16:52", inspector: "田中太郎" },
            ],
          },
          {
            location: "ボイル槽",
            items: [
              { name: "温度計・水位", status: "ok", timestamp: "2025/04/01 16:45", inspector: "田中太郎" },
            ],
          },
        ],
      },
    ],
    comment: "点検内容確認しました。見送り箇所については、明日朝一で対応をお願いします。",
  },
  {
    id: "r2",
    date: "2025-04-01",
    lineLabel: "【毎週】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "高橋美咲",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "点検",
        remarks: "",
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
      },
    ],
  },
  {
    id: "r3",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ng",
    remarks: "タンク内部に油汚れを確認、分解洗浄にて対応済み",
    implementer: "渡辺真由",
    confirmer: "伊藤裕太",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "原料タンク内部に油汚れを確認。分解洗浄にて対応済み。",
        points: [
          {
            location: "原料タンク",
            items: [
              {
                name: "タンク内部",
                status: "ng",
                cause: "汚れ",
                action: "その他 / 内部に油汚れを確認、分解洗浄を実施済み",
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
      },
      {
        segment: "終業",
        remarks: "対応後、再確認済み。異常なし。",
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
      },
    ],
  },
  {
    id: "r4",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "skip",
    remarks:
      "点検見送り 設備メンテナンスのためライン停止中。業者による定期整備作業が終日実施されており、点検対象の機器にアクセスできないため、本日の点検を見送りとする。整備完了後の翌営業日に点検を実施予定。",
    implementer: "小林誠司",
    confirmer: "鈴木雅人",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks:
          "点検見送り 設備メンテナンスのためライン停止中。業者による定期整備作業が終日実施されており、点検対象の機器にアクセスできないため、本日の点検を見送りとする。整備完了後の翌営業日に点検を実施予定。",
        points: [
          {
            location: "巻き取り機",
            items: [
              {
                name: "駆動部",
                status: "ng",
                cause: "設備不良",
                action: "その他 / ライン停止のため点検見送り、設備担当者へ連絡済み",
                timestamp: "2025/04/01 07:00",
                inspector: "小林誠司",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "r5",
    date: "2025-04-02",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "山本拓海",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "",
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
      },
    ],
  },
  {
    id: "r6",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ok",
    remarks: "ベルト摩耗あり、次回交換予定",
    implementer: "吉田浩二",
    confirmer: "伊藤裕太",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "駆動ベルトにわずかな摩耗を確認。次回点検時に交換予定。他の項目は異常なし。",
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
      },
    ],
  },
  {
    id: "r7",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "ok",
    remarks: "異常なし",
    implementer: "田村康平",
    confirmer: "鈴木雅人",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "",
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
      },
    ],
  },
  {
    id: "r8",
    date: "2025-04-03",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "",
    implementer: "松本奈々",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "",
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
      },
    ],
  },
  {
    id: "r9",
    date: "2025-04-03",
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    resultIcon: "ok",
    remarks: "",
    implementer: "佐藤健一",
    confirmer: "伊藤裕太",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "",
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
      },
    ],
  },
  {
    id: "r10",
    date: "2025-04-03",
    lineLabel: "【毎日】ゆばライン（その他）",
    resultIcon: "ok",
    remarks: "パッキン交換済み、動作確認完了",
    implementer: "高橋美咲",
    confirmer: "鈴木雅人",
    approvalStatus: "pending",
    sessions: [
      {
        segment: "始業",
        remarks: "",
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
      },
      {
        segment: "終業",
        remarks: "巻き取り機のパッキンを交換済み。動作確認完了、異常なし。",
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
      },
    ],
  },
];

import type { InspectionItemResult, InspectionRecord, InspectionSession } from "./types";
import { addMinutes, at, slash, statusAt, ymd } from "../../data/demoRecordGen";

export const inspectionRecords: InspectionRecord[] = [
  {
    id: "r1",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    resultIcon: "ok",
    remarks: "全項目正常、異常なし",
    implementer: "田中太郎",
    confirmer: "山田花子",
    approvalStatus: "approved",
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
    approvalStatus: "approved",
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

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の r1〜r10 は画面設計の hash・再生・確定デザインが使うので変えない）。
 * 毎日のラインは 4 月の稼働日に飛び飛びで（始業・終業）、毎週・毎月・毎年 のラインは点検のある日だけ（点検）。3 月末・5 月頭にも少し。
 * × の項目（原因・対応）、点検見送り（ー と見送り理由）、長い備考・長いライン名 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
type EqPoint = { location: string; items: string[] };

const EQ_LINES: { lineLabel: string; segments: string[]; points: EqPoint[]; days: [number, number][]; staff: string[]; confirmer: string }[] = [
  {
    lineLabel: "【毎日】豆乳ライン",
    segments: ["始業", "終業"],
    points: [
      { location: "エコスター", items: ["定量部", "タンク部", "駆動ベルト"] },
      { location: "ボイル槽", items: ["温度計・水位"] },
    ],
    days: [[3, 31], [4, 4], [4, 15], [4, 18], [4, 25], [4, 30], [5, 1]],
    staff: ["山本拓海", "松本奈々", "田中太郎"],
    confirmer: "加藤由美",
  },
  {
    lineLabel: "【毎日】ゆばライン（つまみ関係）",
    segments: ["始業", "終業"],
    points: [
      { location: "切断機", items: ["刃部", "駆動ベルト"] },
      { location: "計量包装機", items: ["計量部", "シール部"] },
    ],
    days: [[3, 31], [4, 9], [4, 16], [4, 23], [4, 26], [5, 2]],
    staff: ["佐藤健一", "渡辺真由"],
    confirmer: "伊藤裕太",
  },
  {
    lineLabel: "【毎日】ゆばライン（その他）",
    segments: ["始業", "終業"],
    points: [
      { location: "ゆば槽（膜張り槽）", items: ["温度", "水位"] },
      { location: "巻き取り機", items: ["駆動部", "巻き取りローラー"] },
    ],
    days: [[4, 7], [4, 17], [4, 21], [4, 28], [5, 1]],
    staff: ["田村康平", "高橋美咲", "小林誠司"],
    confirmer: "鈴木雅人",
  },
  {
    lineLabel: "【毎週】豆乳ライン",
    segments: ["点検"],
    points: [
      { location: "エコスター", items: ["定量部", "タンク部", "駆動ベルト"] },
      { location: "ボイル槽", items: ["温度計・水位"] },
    ],
    days: [[3, 25], [4, 8], [4, 15], [4, 22], [4, 29]],
    staff: ["高橋美咲"],
    confirmer: "加藤由美",
  },
  {
    lineLabel: "【毎月】冷凍・冷蔵設備ライン",
    segments: ["点検"],
    points: [
      { location: "製品冷凍庫", items: ["庫内温度表示", "扉パッキン", "霜付き"] },
      { location: "原料冷蔵庫", items: ["庫内温度表示", "扉パッキン"] },
    ],
    days: [[3, 31], [4, 30]],
    staff: ["吉田浩二"],
    confirmer: "山田花子",
  },
  {
    lineLabel: "【毎年】ボイラー設備（年次定期点検・労働基準監督署への届出対象）",
    segments: ["点検"],
    points: [
      { location: "ボイラー本体", items: ["安全弁", "圧力計", "水面計", "燃焼装置"] },
      { location: "給水設備", items: ["給水ポンプ", "軟水装置"] },
    ],
    days: [[4, 16]],
    staff: ["小林誠司"],
    confirmer: "山田花子",
  },
];

/** × の見本（原因は選択肢、対応は 選択肢 / 書いた文） */
const EQ_NG: { cause: string; action: string; remarks: string }[] = [
  { cause: "汚れ", action: "掃除 / 付着していた原料かすを除去し、アルコールで拭き上げた", remarks: "原料かすの付着を確認、清掃にて対応済み" },
  { cause: "故障", action: "修理（外部委託） / メーカーに修理を依頼。部品の取り寄せに 3 日かかる見込み", remarks: "駆動ベルトの異音。メーカーへ修理依頼中" },
  { cause: "部品の欠落", action: "交換 / 固定ボルト 1 本の欠落を確認し、予備品と交換した。欠落したボルトは周辺を探して回収済み", remarks: "固定ボルトの欠落、交換済み" },
  { cause: "破損", action: "修理 / シール部のテフロンシートの破れを補修", remarks: "" },
  {
    cause: "その他",
    action: "その他 / 温度表示が実測より 2℃ 高い。校正済みの温度計で測り直し、表示の補正を設定した",
    remarks:
      "温度表示のずれを確認。校正済みの温度計で再測定し補正済み。来月の点検でも同じ箇所を重点確認する。設備担当（小林）にも共有済み。",
  },
];

const EQ_SKIP = [
  "点検見送り 設備メンテナンスのためライン停止中。",
  "点検見送り 製造予定なし（受注調整のため休止）。翌稼働日に点検を実施する。",
];

function equipmentExtra(): InspectionRecord[] {
  const out: InspectionRecord[] = [];
  let n = 0;
  EQ_LINES.forEach((line, li) => {
    line.days.forEach(([m, d], di) => {
      const date = ymd(m, d);
      const day = slash(date);
      const who = at(line.staff, di);
      const id = `r-x${li + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
      const kind = (n + li) % 6; // 1：×、4：見送り、ほかは正常
      const ngInfo = at(EQ_NG, n + li);
      const skip = kind === 4 && line.segments.length === 2;
      const ng = kind === 1 || (kind === 4 && !skip);
      const sessions: InspectionSession[] = line.segments.map((segment, si) => {
        const start = segment === "終業" ? "17:15" : segment === "始業" ? "07:15" : "09:30";
        let minute = 0;
        return {
          segment,
          remarks: ng && si === 0 ? ngInfo.remarks : "",
          points: line.points.map((p, pi) => ({
            location: p.location,
            items: p.items.map((name, ii) => {
              const isNg = ng && si === 0 && pi === 0 && ii === (n % p.items.length);
              const item: InspectionItemResult = {
                name,
                status: isNg ? "ng" : "ok",
                timestamp: `${day} ${addMinutes(start, -(minute++ * 4))}`,
                inspector: who,
              };
              if (isNg) {
                item.cause = ngInfo.cause;
                item.action = ngInfo.action;
              }
              return item;
            }),
          })),
        };
      });
      out.push({
        id,
        date,
        lineLabel: line.lineLabel,
        resultIcon: skip ? "skip" : ng ? "ng" : "ok",
        remarks: skip ? at(EQ_SKIP, di) : ng ? ngInfo.remarks : at(["", "全項目正常、異常なし", "", ""], n),
        implementer: who,
        confirmer: line.confirmer,
        approvalStatus: statusAt(n),
        // 見送りは承認申請管理と同じく、始業の 1 か所だけ記録が残る形
        sessions: skip ? [{ ...sessions[0], remarks: at(EQ_SKIP, di), points: sessions[0].points.slice(0, 1) }] : sessions,
      });
      n++;
    });
  });
  // 一覧は記録の並びのまま出るので、日付の順にしておく
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

inspectionRecords.push(...equipmentExtra());

import type { CleaningSearchRecord } from "./types";
import { addMinutes, at, slash, statusAt, ymd } from "../../data/demoRecordGen";

export const mockRecords: CleaningSearchRecord[] = [
  {
    id: "r1",
    date: "2025-04-01",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "異常なし",
    implementer: "高橋和子",
    confirmer: "加藤由美",
    // 確定デザイン（7139:162131／7139:162447）：詳細は「承認待ち」
    approvalStatus: "pending",
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
    id: "r2",
    date: "2025-04-01",
    lineLabel: "【毎日】冷蔵倉庫ライン",
    cleaned: false,
    remarks: "清掃設備メンテナンス中のため翌日に見送り",
    implementer: "中村美咲",
    confirmer: "田中裕子",
    // 確定デザイン（7139:162131／7139:162447）：詳細は「承認待ち」
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r3",
    date: "2025-04-01",
    lineLabel: "【毎日】豆乳ライン",
    cleaned: true,
    remarks: "排水溝の汚れ軽微",
    implementer: "佐々木理恵",
    confirmer: "鈴木一郎",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r4",
    date: "2025-04-01",
    lineLabel: "【毎週】原料受入ライン",
    cleaned: false,
    remarks: "",
    implementer: "渡辺修一",
    confirmer: "山田麻子",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r5",
    date: "2025-04-02",
    lineLabel: "【毎日】ゆばライン",
    cleaned: true,
    remarks: "",
    implementer: "高橋和子",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r6",
    date: "2025-04-02",
    lineLabel: "【毎日】冷蔵倉庫ライン",
    cleaned: true,
    remarks: "",
    implementer: "中村美咲",
    confirmer: "田中裕子",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r7",
    date: "2025-04-02",
    lineLabel: "【毎日】豆乳ライン",
    cleaned: true,
    remarks: "異常なし",
    implementer: "佐々木理恵",
    confirmer: "鈴木一郎",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
  {
    id: "r8",
    date: "2025-04-02",
    lineLabel: "【毎週】原料受入ライン",
    cleaned: false,
    remarks: "搬入口周辺の汚れにより翌日に見送り",
    implementer: "渡辺修一",
    confirmer: "山田麻子",
    approvalStatus: "pending",
    cleaningPoints: [],
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の r1〜r8 は画面設計の hash・再生・確定デザインが使うので変えない）。
 * 毎日のラインは 4 月の稼働日に飛び飛び、毎週・毎月・毎年 は清掃のある日だけ。3 月末・5 月頭にも少し。
 * 清掃済み（✓。清掃箇所と項目つき）と点検見送り（ー と見送り理由）、備考あり/なし・長い備考・長いライン名 を混ぜる。
 * 清掃記録には「異常あり（×）」が無いので、気になったことは備考に書く形。
 * ─────────────────────────────────────────────────────────────── */
type ClPoint = { location: string; items: string[] };

const CL_LINES: { lineLabel: string; points: ClPoint[]; days: [number, number][]; staff: string[]; confirmer: string; time: string }[] = [
  {
    lineLabel: "【毎日】ゆばライン",
    points: [
      { location: "つまみ上げパック機", items: ["シール部", "コンベアベルト", "充塡ノズル"] },
      { location: "充填包装機", items: ["コンベア清掃", "充填ノズル洗浄"] },
    ],
    days: [[3, 31], [4, 4], [4, 8], [4, 15], [4, 18], [4, 25], [4, 29], [5, 1]],
    staff: ["高橋和子", "高橋美咲"],
    confirmer: "加藤由美",
    time: "20:05",
  },
  {
    lineLabel: "【毎日】冷蔵倉庫ライン",
    points: [
      { location: "冷蔵倉庫", items: ["床面", "ラック", "扉パッキン"] },
    ],
    days: [[4, 3], [4, 10], [4, 14], [4, 21], [4, 24], [4, 28], [5, 2]],
    staff: ["中村美咲", "吉田浩二"],
    confirmer: "田中裕子",
    time: "18:30",
  },
  {
    lineLabel: "【毎日】豆乳ライン",
    points: [
      { location: "豆乳タンク", items: ["タンク内部", "バルブ"] },
      { location: "排水溝", items: ["グレーチング", "排水口"] },
    ],
    days: [[3, 28], [4, 5], [4, 9], [4, 16], [4, 19], [4, 26], [4, 30]],
    staff: ["佐々木理恵", "渡辺真由"],
    confirmer: "鈴木一郎",
    time: "19:10",
  },
  {
    lineLabel: "【毎週】原料受入ライン",
    points: [
      { location: "搬入口", items: ["床面", "シャッターレール"] },
      { location: "検品台", items: ["台の表面", "はかり"] },
    ],
    days: [[3, 25], [4, 8], [4, 15], [4, 22], [4, 29], [5, 6]],
    staff: ["渡辺修一"],
    confirmer: "山田麻子",
    time: "16:00",
  },
  {
    lineLabel: "【毎月】排水設備・グリストラップ",
    points: [{ location: "グリストラップ", items: ["バスケット", "油脂の除去", "槽内"] }],
    days: [[3, 31], [4, 30]],
    staff: ["小林誠司"],
    confirmer: "山田麻子",
    time: "17:30",
  },
  {
    lineLabel: "【毎年】空調ダクト（製造棟 天井裏 全系統・外部業者立ち会い）",
    points: [
      { location: "製造棟 天井裏", items: ["吸気ダクト", "排気ダクト", "フィルター"] },
    ],
    days: [[4, 19]],
    staff: ["田村康平"],
    confirmer: "山田麻子",
    time: "13:00",
  },
];

const CL_REMARKS = [
  "",
  "異常なし",
  "",
  "排水溝の汚れ軽微",
  "",
  "コンベアベルトの裏面に粉体の付着あり。通常清掃で除去。次回も重点確認",
];

const CL_SKIP = [
  "清掃設備メンテナンス中のため翌日に見送り",
  "製造なし（ライン休止日）のため見送り",
  "洗浄剤の在庫切れのため翌日に見送り。発注済み（4/16 入荷予定）。入荷後すぐに清掃を行い、清掃記録に追記する。品質管理課長へ報告済み。",
];

function cleaningExtra(): CleaningSearchRecord[] {
  const out: CleaningSearchRecord[] = [];
  let n = 0;
  CL_LINES.forEach((line, li) => {
    line.days.forEach(([m, d], di) => {
      const date = ymd(m, d);
      const who = at(line.staff, di);
      const skip = (n + li) % 5 === 3;
      let minute = 0;
      out.push({
        id: `r-x${li + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`,
        date,
        lineLabel: line.lineLabel,
        cleaned: !skip,
        remarks: skip ? at(CL_SKIP, n) : at(CL_REMARKS, n + li),
        implementer: who,
        confirmer: line.confirmer,
        approvalStatus: statusAt(n),
        cleaningPoints: skip
          ? []
          : line.points.map((p) => ({
              location: p.location,
              items: p.items.map((name) => ({
                name,
                cleaned: true,
                inspector: who,
                timestamp: `${slash(date)} ${addMinutes(line.time, minute++ * 6)}`,
              })),
            })),
      });
      n++;
    });
  });
  // 一覧は記録の並びのまま出るので、日付の順にしておく
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

mockRecords.push(...cleaningExtra());

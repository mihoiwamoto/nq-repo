import type { WaterSearchRecord } from "./types";
import { aprilDays, at, demoComments, statusAt, ymd } from "../../data/demoRecordGen";

const NORMAL = { status: "normal" as const };

export const mockRecords: WaterSearchRecord[] = [
  {
    id: "wr1",
    date: "2025-04-01",
    time: "09:00",
    location: "給湯室",
    taste: NORMAL,
    smell: NORMAL,
    color: NORMAL,
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.6,
    chlorine: 0.3,
    chlorineReplenished: false,
    uvOperatingHours: 279.2,
    uvLampReplaced: false,
    uvIndicatorLight: "on",
    abnormalDetectionLight: "off",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
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
  },
  {
    id: "wr2",
    date: "2025-04-01",
    time: "15:00",
    location: "給湯室",
    taste: NORMAL,
    smell: {
      status: "abnormal",
      cause: "不明",
      action: "水を入れ替えて再度確認したところ異常は見られなかった。継続して様子を見る。",
    },
    color: NORMAL,
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.5,
    chlorine: 0.3,
    chlorineReplenished: true,
    uvOperatingHours: 279.2,
    uvLampReplaced: false,
    uvIndicatorLight: "on",
    abnormalDetectionLight: "off",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
    approvalStatus: "pending",
  },
  {
    id: "wr3",
    date: "2025-04-02",
    time: "09:00",
    location: "給湯室",
    taste: NORMAL,
    smell: NORMAL,
    color: NORMAL,
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.7,
    chlorine: 0.2,
    chlorineReplenished: false,
    uvOperatingHours: 283.7,
    uvLampReplaced: false,
    uvIndicatorLight: "off",
    abnormalDetectionLight: "on",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
    approvalStatus: "pending",
  },
  {
    id: "wr4",
    date: "2025-04-02",
    time: "15:00",
    location: "点検場所B",
    taste: NORMAL,
    smell: NORMAL,
    color: NORMAL,
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.8,
    chlorine: 0.4,
    chlorineReplenished: false,
    uvOperatingHours: 140.1,
    uvLampReplaced: false,
    uvIndicatorLight: "on",
    abnormalDetectionLight: "off",
    implementer: "鈴木一郎",
    confirmer: "佐藤花子",
    approvalStatus: "approved",
  },
  {
    id: "wr5",
    date: "2025-04-03",
    time: "09:00",
    location: "給湯室",
    taste: NORMAL,
    smell: NORMAL,
    color: NORMAL,
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.6,
    chlorine: 0.3,
    chlorineReplenished: false,
    uvOperatingHours: 288.5,
    uvLampReplaced: true,
    uvIndicatorLight: "on",
    abnormalDetectionLight: "off",
    implementer: "田中太郎",
    confirmer: "佐藤花子",
    approvalStatus: "approved",
  },
  {
    id: "wr6",
    date: "2025-04-03",
    time: "15:00",
    location: "点検場所B",
    taste: NORMAL,
    smell: NORMAL,
    color: { status: "abnormal", cause: "配管洗浄直後のため", action: "30分後に再検査し正常を確認した。" },
    turbidity: NORMAL,
    foreignMatter: NORMAL,
    ph: 6.9,
    chlorine: 0.4,
    chlorineReplenished: false,
    uvOperatingHours: 148.9,
    uvLampReplaced: false,
    uvIndicatorLight: "on",
    abnormalDetectionLight: "off",
    implementer: "鈴木一郎",
    confirmer: "佐藤花子",
    approvalStatus: "rejected",
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の wr1〜wr6 は画面設計の hash と確定デザインが使うので変えない）。
 * 点検場所ごとに 4 月の稼働日を 1 日 1〜2 回。3 月末・5 月頭にも少し。
 * 味・臭い・色・濁り・異物の ×（原因・対応つき）、残留塩素の補充、UV 殺菌灯の交換、ph の範囲外、表示灯の消灯・異常検出灯の点灯 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
type Issue = Partial<Omit<WaterSearchRecord, "id" | "date" | "time" | "location" | "implementer" | "confirmer" | "approvalStatus">>;

const NG = (cause: string, action: string) => ({ status: "abnormal" as const, cause, action });

/** 異常の見本（番号順に回して当てる） */
const WATER_ISSUES: Issue[] = [
  { taste: NG("配管内の滞留水（休日明け）", "5分間通水したあと再度確認し、正常を確認した。") },
  { chlorine: 0.1, chlorineReplenished: true },
  { smell: NG("塩素臭が強い", "給水タンクの塩素注入量を確認し、注入ポンプの設定を戻した。1時間後に再確認し正常。") },
  { uvLampReplaced: true, uvOperatingHours: 2.5 },
  { color: NG("赤さび色（配管工事の直後）", "工事業者に連絡し、配管内を洗浄。透明になるまで通水して再確認した。") },
  { ph: 8.8 },
  { turbidity: NG("断水復旧後の濁り", "30分通水して濁りが無くなったことを確認。使用再開は品質管理課長の確認後とした。") },
  { uvIndicatorLight: "off", abnormalDetectionLight: "on" },
  { foreignMatter: NG("蛇口パッキンの破片", "パッキンを交換し、ストレーナーを清掃。異物が無いことを再確認した。") },
  { ph: 5.6, chlorine: 0.1, chlorineReplenished: true },
  {
    taste: NG("不明", "水を入れ替えて再度確認したところ異常は見られなかった。"),
    smell: NG("カビ臭", "給湯器のフィルターを清掃し、翌日の点検まで給湯室の使用を止めた。設備業者による点検を依頼済み。"),
  },
];

const WATER_POINTS = [
  { location: "給湯室", times: ["09:00", "15:00"], every: 1, uvStart: 292, confirmer: "佐藤花子", staff: ["田中太郎", "佐藤健一", "高橋美咲"] },
  { location: "点検場所B", times: ["15:00"], every: 1, uvStart: 152, confirmer: "佐藤花子", staff: ["鈴木一郎", "渡辺真由"] },
  { location: "製造棟1F 従業員入口横 手洗い場（足踏み式）", times: ["08:30"], every: 2, uvStart: 1210, confirmer: "山本拓海", staff: ["小林誠司", "松本奈々"] },
];

function waterExtra(): WaterSearchRecord[] {
  const out: WaterSearchRecord[] = [];
  let n = 0;
  WATER_POINTS.forEach((p, pi) => {
    // 3 月末（3/28・3/31）、4 月（給湯室・点検場所B は 4/4 から。元の見本が 4/1〜4/3 にあるため）、5 月頭（5/1・5/2）
    const firstApril = pi === 2 ? 1 : 4;
    // 給湯室は土曜を除く・点検場所B は水曜を除く
    const april = aprilDays(firstApril, 30, pi === 0 ? [5, 12, 19, 26] : pi === 1 ? [9, 16, 23] : []).filter((_, i) => i % p.every === 0);
    const days: [number, number][] = [
      [3, 28], [3, 31],
      ...april.map((d) => [4, d] as [number, number]),
      [5, 1], [5, 2],
    ];
    let uv = p.uvStart;
    days.forEach(([m, d], di) => {
      // 給湯室は 1 日 2 回（午後の点検はときどき）
      const times = p.times.filter((_, ti) => ti === 0 || di % 8 === 3);
      times.forEach((time) => {
        uv = Math.round((uv + 4.3 + (di % 3) * 0.4) * 10) / 10;
        const issue = n % 3 === 1 ? at(WATER_ISSUES, Math.floor(n / 3) + pi) : {};
        const date = ymd(m, d);
        const id = `wr-x${pi + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}-${time.replace(":", "")}`;
        const rec: WaterSearchRecord = {
          id,
          date,
          time,
          location: p.location,
          taste: NORMAL,
          smell: NORMAL,
          color: NORMAL,
          turbidity: NORMAL,
          foreignMatter: NORMAL,
          ph: Math.round((6.4 + ((n * 7) % 9) * 0.1) * 10) / 10,
          chlorine: at([0.3, 0.4, 0.2, 0.3, 0.5], n),
          chlorineReplenished: false,
          uvOperatingHours: uv,
          uvLampReplaced: false,
          uvIndicatorLight: "on",
          abnormalDetectionLight: "off",
          implementer: at(p.staff, di),
          confirmer: p.confirmer,
          approvalStatus: statusAt(n),
          ...issue,
        };
        if (rec.uvLampReplaced) uv = rec.uvOperatingHours;
        if (issue.taste || issue.color || issue.foreignMatter) {
          rec.comments = demoComments(id, date, [
            [p.confirmer, "原因と対応を確認しました。翌日の点検でも同じ箇所を重点的に確認してください。"],
            ["佐藤健一", "承知しました。翌日の点検結果もあわせて報告します。"],
          ]);
        }
        out.push(rec);
        n++;
      });
    });
  });
  return out;
}

mockRecords.push(...waterExtra());

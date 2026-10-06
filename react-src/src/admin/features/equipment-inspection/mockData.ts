import type { ChecklistItem, InspectionPoint, Line, LineFrequency, ScheduleEntry } from "./types";

/**
 * 帳票管理 › 機械器具点検の見本データ。工場ごとに別のデータを持つ（FACTORY_DATA。キーは src/data/factories.ts の id）。
 * ScheduleContext の useSchedule() が URL の :factoryId でこの中から選ぶ。
 *
 * f1（本社工場）は画面設計の hash（lines/l8 など）と再生の見本に使っているので、id も中身も変えないこと。
 * ほかの工場は、デモでいろいろな形を見せるために「パターン」を変えてある（下の各工場のコメント）。
 *   - 点検箇所・点検項目がしっかり入っている／名前だけ登録してある
 *   - アプリ表示期間：指定なし（常に表示）・期間内・終わった（アプリ非表示）・これから始まる（アプリ非表示）
 *   - 頻度の偏り（毎日だけ・毎月が多い など）、件数の多い／少ない、まだ何も無い工場
 *   - 点検予定が 4 月にびっしり／週に 1 回／無い、確認項目が多い／少ない／無い
 * アプリ表示期間は今日の日付で分かれるので、終わった期間は 2025 年度、これから始まる期間は 2027 年度にしてある。
 * 点検予定カレンダーは 2025 年 4 月で開くので、予定も 2025 年 4 月に置く。
 */

export type FactoryScheduleData = {
  lines: Line[];
  entries: Record<string, ScheduleEntry>;
  checklistItems: ChecklistItem[];
};

/* ---------- 組み立て用 ---------- */

/** 期間（アプリ表示期間）の型 */
const ALWAYS = {};
const IN_PERIOD = { displayFrom: "2025-04-01", displayTo: "2028-03-31" };
const ENDED = { displayFrom: "2024-04-01", displayTo: "2026-03-31" };
const UPCOMING = { displayFrom: "2027-04-01", displayTo: "2030-03-31" };

/** 点検箇所 1 つ。[機械, 点検項目...] */
type PointSpec = [string, ...string[]];

function line(
  id: string,
  name: string,
  frequency: LineFrequency,
  points: PointSpec[] = [],
  period: { displayFrom?: string; displayTo?: string } = ALWAYS,
): Line {
  const inspectionPoints: InspectionPoint[] = points.map(([location, ...items], i) => ({
    id: `${id}-p${i + 1}`,
    location,
    items,
  }));
  return { id, name, frequency, inspectionPoints, ...period };
}

/** 予定。{ "2025-04-01": ["l1", "l2"] } を ScheduleEntry の形にする */
function schedule(map: Record<string, string[]>): Record<string, ScheduleEntry> {
  return Object.fromEntries(Object.entries(map).map(([dateKey, lineIds]) => [dateKey, { dateKey, lineIds }]));
}

/** 2025 年 4 月の、指定した曜日（0=日〜6=土）の日付 */
function aprilDays(weekdays: number[]): string[] {
  const days: string[] = [];
  for (let d = 1; d <= 30; d++) {
    if (weekdays.includes(new Date(2025, 3, d).getDay())) days.push(`2025-04-${String(d).padStart(2, "0")}`);
  }
  return days;
}

function checklist(prefix: string, texts: string[]): ChecklistItem[] {
  return texts.map((text, i) => ({ id: `${prefix}c${i + 1}`, text }));
}

const BASIC_CHECKS = ["破損、損傷、部品の欠落、劣化等がないか", "異物や汚れはついていないか", "問題なく動作するか"];

/* ---------- f1 ㈱西原食品 本社工場（元からの見本。変えない） ---------- */

const f1: FactoryScheduleData = {
  lines: [
    { id: "l1", name: "豆乳ライン", frequency: "weekly", inspectionPoints: [] },
    { id: "l2", name: "ゆばライン（その他）", frequency: "weekly", inspectionPoints: [] },
    { id: "l3", name: "殺菌ライン", frequency: "weekly", inspectionPoints: [] },
    { id: "l4", name: "冷蔵倉庫ライン", frequency: "weekly", inspectionPoints: [] },
    { id: "l5", name: "充填・包装ライン", frequency: "weekly", inspectionPoints: [] },
    { id: "l6", name: "原料受入ライン", frequency: "weekly", inspectionPoints: [] },
    { id: "l7", name: "豆乳ライン", frequency: "yearly", inspectionPoints: [] },
    {
      id: "l8",
      name: "豆乳ライン",
      frequency: "daily",
      displayFrom: "2025-04-01",
      displayTo: "2028-04-01",
      inspectionPoints: [
        { id: "p1", location: "エコスター", items: ["定量部", "タンク部", "駆動ベルト"] },
        { id: "p2", location: "ボイル槽", items: ["温度計・水位"] },
      ],
    },
    { id: "l9", name: "ゆばライン（つまみ関係）", frequency: "daily", inspectionPoints: [] },
    { id: "l10", name: "ゆばライン（その他）", frequency: "daily", inspectionPoints: [] },
    { id: "l11", name: "自動計量機・風力選別機ライン", frequency: "daily", inspectionPoints: [] },
    { id: "l12", name: "冷凍・冷蔵設備ライン", frequency: "monthly", inspectionPoints: [] },
    { id: "l13", name: "排水処理設備ライン", frequency: "monthly", inspectionPoints: [] },
    { id: "l14", name: "ボイラー設備ライン", frequency: "monthly", inspectionPoints: [] },
    { id: "l15", name: "コンプレッサー設備ライン", frequency: "monthly", inspectionPoints: [] },
    { id: "l16", name: "空調・フィルターライン", frequency: "monthly", inspectionPoints: [] },
    { id: "l17", name: "計量器・秤設備ライン", frequency: "monthly", inspectionPoints: [] },
  ],
  entries: {
    "2025-04-01": { dateKey: "2025-04-01", lineIds: ["l1", "l2", "l7"] },
  },
  checklistItems: [
    { id: "c1", text: "破損、損傷、部品の欠落、劣化等がないか" },
    { id: "c2", text: "異物や汚れはついていないか" },
    { id: "c3", text: "問題なく動作するか" },
    { id: "c4", text: "【豆乳ライン】洗浄後のすすぎ残しがないか" },
    { id: "c5", text: "【ゆばライン(その他)】ゆば槽（膜張り槽）の温度が規定の保温温度に維持されているか" },
  ],
};

/* ---------- f2 ㈱西原食品 第二工場：きちんと準備済み。全ラインに点検箇所があり、4 月の平日は毎日予定が入っている ---------- */

const f2Daily = [
  line("l1", "充填ライン", "daily", [["充填機", "ノズル", "シール部", "計量部"], ["キャッパー", "トルク", "チャック"]]),
  line("l2", "殺菌・冷却ライン", "daily", [["プレート殺菌機", "温度記録計", "保持管"], ["冷却タンク", "温度計", "攪拌機"]]),
  line("l3", "洗浄ライン", "daily", [["CIP 装置", "洗浄液濃度", "ポンプ"]], IN_PERIOD),
];
const f2Weekly = [
  line("l4", "原料受入ライン", "weekly", [["大豆サイロ", "投入口", "スクリュー"], ["石抜き機", "網", "モーター"]]),
  line("l5", "包装・梱包ライン", "weekly", [["包装機", "フィルム送り", "ヒーター"], ["ケーサー", "吸着パッド"]]),
];
const f2: FactoryScheduleData = {
  lines: [
    ...f2Daily,
    ...f2Weekly,
    line("l6", "ボイラー設備", "monthly", [["ボイラー", "圧力計", "安全弁", "水位計"]]),
    line("l7", "冷凍機設備", "monthly", [["冷凍機", "圧力", "異音"]]),
    line("l8", "排水処理設備", "yearly", [["排水槽", "pH 計", "ブロワー"]]),
  ],
  entries: schedule(
    Object.fromEntries(
      aprilDays([1, 2, 3, 4, 5]).map((d) => {
        const ids = ["l1", "l2", "l3"];
        if (new Date(2025, 3, Number(d.slice(8))).getDay() === 1) ids.push("l4", "l5"); // 月曜は毎週のラインも
        if (d === "2025-04-01") ids.push("l6", "l7"); // 月初は毎月のラインも
        return [d, ids];
      }),
    ),
  ),
  checklistItems: checklist("f2", [
    ...BASIC_CHECKS,
    "【充填ライン】ノズルの詰まり・液だれがないか",
    "【殺菌・冷却ライン】殺菌温度が規定の範囲にあるか",
    "【洗浄ライン】洗浄液の濃度が規定どおりか",
  ]),
};

/* ---------- f3 ㈱西原食品 伊佐工場：小さな工場。毎日のラインが 2 つだけ、確認項目は基本の 3 つ ---------- */

const f3: FactoryScheduleData = {
  lines: [
    line("l1", "豆腐ライン", "daily", [["凝固機", "温度", "攪拌羽根"], ["カッター", "刃", "安全カバー"]]),
    line("l2", "油揚げライン", "daily", [["フライヤー", "油温", "コンベア"]]),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5, 6]).map((d) => [d, ["l1", "l2"]]))),
  checklistItems: checklist("f3", BASIC_CHECKS),
};

/* ---------- f4 ㈱ヒコシマリン 本社工場：水産加工。毎週が中心で、月曜にまとめて点検 ---------- */

const f4: FactoryScheduleData = {
  lines: [
    line("l1", "解凍ライン", "daily", [["解凍機", "水温", "水量"]]),
    line("l2", "フィレ加工ライン", "weekly", [["フィレマシン", "刃", "ガイド", "コンベア"], ["骨取り機", "ピン", "モーター"]]),
    line("l3", "味付け・漬け込みライン", "weekly", [["タンブラー", "真空度", "回転"]]),
    line("l4", "急速凍結ライン", "weekly", [["トンネルフリーザー", "庫内温度", "ベルト"], ["グレーズ槽", "水温"]]),
    line("l5", "金属検出・包装ライン", "weekly", [["包装機", "シール温度"]]),
    line("l6", "冷凍庫設備", "monthly", [["冷凍庫", "庫内温度", "霜付き", "扉パッキン"]]),
    line("l7", "製氷機設備", "monthly", [["製氷機", "水質", "フィルター"]]),
  ],
  entries: schedule({
    ...Object.fromEntries(aprilDays([1, 2, 3, 4, 5, 6]).map((d) => [d, ["l1"]])),
    ...Object.fromEntries(aprilDays([1]).map((d) => [d, ["l1", "l2", "l3", "l4", "l5"]])),
    "2025-04-01": ["l1", "l6", "l7"],
  }),
  checklistItems: checklist("f4", [
    ...BASIC_CHECKS,
    "【フィレ加工ライン】刃こぼれがないか",
    "【急速凍結ライン】凍結温度が -30℃ 以下か",
  ]),
};

/* ---------- f5 ㈱ヒコシマリン カネハチ静岡工場：これから準備する工場。持ち場/ライン・予定・確認項目がまだ何も無い ---------- */

const f5: FactoryScheduleData = { lines: [], entries: {}, checklistItems: [] };

/* ---------- f6 ㈱ゆば将 本社工場：名前と点検項目が長い。点検箇所が多いライン ---------- */

const f6: FactoryScheduleData = {
  lines: [
    line("l1", "生ゆば製造ライン（膜張り槽・引き上げ工程・第 1〜第 4 槽）", "daily", [
      ["膜張り槽（第 1 槽）", "槽内温度（規定の保温温度を維持しているか）", "蒸気バルブの開閉", "槽の縁の焦げ付き"],
      ["膜張り槽（第 2 槽）", "槽内温度（規定の保温温度を維持しているか）", "蒸気バルブの開閉"],
      ["膜張り槽（第 3 槽）", "槽内温度", "蒸気バルブの開閉"],
      ["膜張り槽（第 4 槽）", "槽内温度", "蒸気バルブの開閉"],
      ["引き上げ用の竹串置き場", "竹串の割れ・ささくれ", "置き場の清潔さ"],
    ]),
    line("l2", "乾燥ゆばライン（乾燥室・裁断機）", "daily", [
      ["乾燥室", "室温・湿度", "送風機の異音"],
      ["裁断機", "刃の摩耗", "安全センサーの作動"],
    ]),
    line("l3", "豆乳製造ライン（浸漬・磨砕・煮沸・分離）", "weekly", [
      ["浸漬タンク", "水温", "排水バルブ"],
      ["グラインダー", "臼の摩耗", "異物の混入"],
      ["煮沸釜", "温度計", "消泡装置"],
      ["おから分離機", "スクリーンの目詰まり"],
    ]),
    line("l4", "季節限定　ゆば豆腐ライン", "weekly", [["充填機", "ノズル"]], ENDED),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 3, 5]).map((d) => [d, ["l1", "l2", "l3"]]))),
  checklistItems: checklist("f6", [
    ...BASIC_CHECKS,
    "【生ゆば製造ライン】膜張り槽の温度が規定の保温温度に維持され、引き上げ前に膜が均一に張っているか",
    "【生ゆば製造ライン】竹串に割れ・ささくれがなく、使用前に洗浄・乾燥されているか",
    "【乾燥ゆばライン】乾燥室の温度・湿度が記録どおりで、送風機に異音がないか",
    "【豆乳製造ライン】煮沸後の豆乳温度が規定以上で、消泡装置が正しく作動しているか",
  ]),
};

/* ---------- f7 ㈱匠フーズ 本社工場：ラインの入れ替え中。表示期間の終わったラインと、これから始まるラインがある ---------- */

const f7: FactoryScheduleData = {
  lines: [
    line("l1", "惣菜盛り付けライン（旧）", "daily", [["盛り付けコンベア", "ベルト", "速度"]], ENDED),
    line("l2", "フライライン（旧）", "daily", [["フライヤー", "油温"]], ENDED),
    line("l3", "惣菜盛り付けライン（新）", "daily", [["盛り付けロボット", "アーム", "吸着ハンド"]], UPCOMING),
    line("l4", "フライライン（新）", "daily", [["連続フライヤー", "油温", "ネットコンベア"]], UPCOMING),
    line("l5", "炊飯ライン", "daily", [["炊飯釜", "火力", "タイマー"]], IN_PERIOD),
    line("l6", "冷蔵庫設備", "monthly", [["冷蔵庫", "庫内温度"]]),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, ["l1", "l2", "l5"]]))),
  checklistItems: checklist("f7", BASIC_CHECKS),
};

/* ---------- f8 以降：業種ごとの見本（点検箇所あり・なし、頻度、予定の入り方を少しずつ変える） ---------- */

const f8: FactoryScheduleData = {
  // ㈱薩摩家：さつま揚げ。毎月の設備点検が多い
  lines: [
    line("l1", "すり身ライン", "daily", [["サイレントカッター", "刃", "蓋のインターロック"]]),
    line("l2", "成形・揚げライン", "daily", [["成形機", "型"], ["フライヤー", "油温", "コンベア"]]),
    line("l3", "冷凍庫設備", "monthly"),
    line("l4", "ボイラー設備", "monthly"),
    line("l5", "コンプレッサー設備", "monthly"),
    line("l6", "排水処理設備", "monthly"),
    line("l7", "空調設備", "yearly"),
  ],
  entries: schedule({ "2025-04-01": ["l1", "l2", "l3", "l4", "l5", "l6"], "2025-04-02": ["l1", "l2"], "2025-04-03": ["l1", "l2"] }),
  checklistItems: checklist("f8", BASIC_CHECKS),
};

const f9: FactoryScheduleData = {
  // ㈱西通りプリン 本社工場：名前だけ登録して点検箇所はまだ（詳細を開くと点検箇所が空）
  lines: [
    line("l1", "プリン充填ライン", "daily"),
    line("l2", "カラメル製造ライン", "daily"),
    line("l3", "蒸し・冷却ライン", "daily"),
    line("l4", "包装ライン", "weekly"),
  ],
  entries: {},
  checklistItems: checklist("f9", ["破損や部品の欠落がないか"]),
};

const f10: FactoryScheduleData = {
  // ㈱西通りプリン 安曇野工場：本社工場と同じ構成で、点検箇所まで入っている
  lines: [
    line("l1", "プリン充填ライン", "daily", [["充填機", "ノズル", "計量"], ["シーラー", "シール温度"]]),
    line("l2", "カラメル製造ライン", "daily", [["カラメル釜", "温度", "攪拌"]]),
    line("l3", "蒸し・冷却ライン", "daily", [["スチーマー", "蒸気圧"], ["冷却トンネル", "温度"]]),
    line("l4", "包装ライン", "weekly", [["包装機", "フィルム"]]),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, ["l1", "l2", "l3"]]))),
  checklistItems: checklist("f10", [...BASIC_CHECKS, "【プリン充填ライン】充填量が規定どおりか"]),
};

const f11: FactoryScheduleData = {
  // ㈱桜寿食品：毎年の点検だけ（年 1 回の法定点検など）
  lines: [
    line("l1", "ボイラー（法定点検）", "yearly", [["ボイラー", "安全弁", "圧力計", "水面計"]]),
    line("l2", "第一種圧力容器（法定点検）", "yearly", [["レトルト殺菌機", "安全弁", "パッキン"]]),
    line("l3", "クレーン（年次点検）", "yearly", [["天井クレーン", "ワイヤー", "ブレーキ"]]),
  ],
  entries: schedule({ "2025-04-15": ["l1", "l2", "l3"] }),
  checklistItems: checklist("f11", BASIC_CHECKS),
};

const f12: FactoryScheduleData = {
  // ㈱亜味撰：件数が多い（毎日のラインが 12 本）
  lines: Array.from({ length: 12 }, (_, i) =>
    line(`l${i + 1}`, `第${i + 1}製造ライン`, "daily", i < 4 ? [["包装機", "シール部", "フィルム送り"]] : []),
  ),
  entries: schedule(
    Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, Array.from({ length: 12 }, (_, i) => `l${i + 1}`)])),
  ),
  checklistItems: checklist("f12", BASIC_CHECKS),
};

const f13: FactoryScheduleData = {
  // ㈱ゆう屋：ラインはあるが点検予定がまだ無い（カレンダーが空）
  lines: [
    line("l1", "米菓焼成ライン", "daily", [["焼成機", "温度", "コンベア"]]),
    line("l2", "味付けライン", "daily", [["ドラム", "回転", "噴霧ノズル"]]),
    line("l3", "包装ライン", "weekly", [["ピロー包装機", "シール温度"]]),
  ],
  entries: {},
  checklistItems: checklist("f13", BASIC_CHECKS),
};

const f14: FactoryScheduleData = {
  // ㈱五島製麺：毎日・毎週・毎月・毎年がそろっている
  lines: [
    line("l1", "製麺ライン", "daily", [["ミキサー", "羽根", "加水量"], ["圧延機", "ロール間隔"], ["切り出し機", "切刃"]]),
    line("l2", "乾燥ライン", "weekly", [["乾燥室", "温度", "湿度"]]),
    line("l3", "包装ライン", "monthly", [["計量包装機", "計量精度"]]),
    line("l4", "受電設備", "yearly", [["キュービクル", "絶縁抵抗"]]),
  ],
  entries: schedule({
    ...Object.fromEntries(aprilDays([1, 2, 3, 4, 5, 6]).map((d) => [d, ["l1"]])),
    ...Object.fromEntries(aprilDays([3]).map((d) => [d, ["l1", "l2"]])),
    "2025-04-01": ["l1", "l3"],
    "2025-04-20": ["l4"],
  }),
  checklistItems: checklist("f14", [...BASIC_CHECKS, "【製麺ライン】切刃に欠けがないか"]),
};

const f15: FactoryScheduleData = {
  // ㈱有明農産：アプリ非表示だけ（期間の終わったラインしかない）
  lines: [
    line("l1", "海苔焼きライン（2025 年度）", "daily", [["焼き機", "温度"]], ENDED),
    line("l2", "選別ライン（2025 年度）", "weekly", [["選別機", "カメラ"]], ENDED),
  ],
  entries: schedule({ "2025-04-01": ["l1", "l2"] }),
  checklistItems: checklist("f15", BASIC_CHECKS),
};

const f16: FactoryScheduleData = {
  // 龍屋物産㈱：これから始まるラインだけ（来年度の新工場）
  lines: [
    line("l1", "冷凍餃子ライン", "daily", [["包あん機", "皮の厚さ", "あん量"], ["急速凍結機", "温度"]], UPCOMING),
    line("l2", "シュウマイライン", "daily", [["成形機", "型"]], UPCOMING),
  ],
  entries: {},
  checklistItems: [],
};

const f17: FactoryScheduleData = {
  // 松山製菓㈱ 本社工場：確認項目が多い
  lines: [
    line("l1", "焼き菓子ライン", "daily", [["オーブン", "温度", "コンベア速度"]]),
    line("l2", "チョコレートライン", "daily", [["テンパリング機", "温度"], ["エンローバー", "チョコの厚さ"]]),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, ["l1", "l2"]]))),
  checklistItems: checklist("f17", [
    ...BASIC_CHECKS,
    "ネジ・ボルトの緩みや脱落がないか",
    "安全カバー・非常停止ボタンが正しく作動するか",
    "潤滑油が食品に触れる場所に漏れていないか",
    "異音・異臭・異常な振動がないか",
    "【焼き菓子ライン】オーブンの温度が設定どおりか",
    "【チョコレートライン】テンパリング温度が規定の範囲か",
  ]),
};

const f18: FactoryScheduleData = {
  // 松山製菓㈱ 知多かなん堂工場：毎日 1 本だけ
  lines: [line("l1", "和菓子製造ライン", "daily", [["包あん機", "あん量", "生地の厚さ"]])],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5, 6]).map((d) => [d, ["l1"]]))),
  checklistItems: checklist("f18", BASIC_CHECKS),
};

const f19: FactoryScheduleData = {
  // はやしハム㈱：毎週が中心、月末にまとめて
  lines: [
    line("l1", "ハム製造ライン", "daily", [["インジェクター", "針", "圧力"], ["スモークハウス", "温度", "煙量"]]),
    line("l2", "ソーセージ充填ライン", "weekly", [["充填機", "ケーシング送り"]]),
    line("l3", "スライス・包装ライン", "weekly", [["スライサー", "刃", "厚さ"], ["深絞り包装機", "真空度"]]),
    line("l4", "冷蔵庫設備", "monthly", [["冷蔵庫", "庫内温度"]]),
  ],
  entries: schedule({
    ...Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, ["l1"]])),
    "2025-04-30": ["l1", "l2", "l3", "l4"],
  }),
  checklistItems: checklist("f19", [...BASIC_CHECKS, "【スライス・包装ライン】刃の固定ねじに緩みがないか"]),
};

const f20: FactoryScheduleData = {
  // あったか市場㈱ キットファクトリー：常に表示と期間ありが混ざる
  lines: [
    line("l1", "ミールキット盛り付けライン", "daily", [["盛り付け台", "清潔さ"]]),
    line("l2", "カット野菜ライン", "daily", [["スライサー", "刃"], ["洗浄機", "水量", "塩素濃度"]], IN_PERIOD),
    line("l3", "冬季限定 鍋セットライン", "daily", [["計量機", "精度"]], UPCOMING),
  ],
  entries: schedule(Object.fromEntries(aprilDays([1, 2, 3, 4, 5]).map((d) => [d, ["l1", "l2"]]))),
  checklistItems: checklist("f20", BASIC_CHECKS),
};

const f21: FactoryScheduleData = {
  // ㈱鈴木商会 製造部門：持ち場/ラインは無いが、確認項目だけ先に登録してある
  lines: [],
  entries: {},
  checklistItems: checklist("f21", BASIC_CHECKS),
};

export const FACTORY_DATA: Record<string, FactoryScheduleData> = {
  f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21,
};

/** 工場の見本。無い工場は f1 と同じ */
export function factoryData(factoryId: string | undefined): FactoryScheduleData {
  return FACTORY_DATA[factoryId ?? "f1"] ?? f1;
}

/** 元の名前（f1 のデータ）。他から読まれていたときのために残す */
export const initialLines = f1.lines;
export const initialEntries = f1.entries;
export const initialChecklistItems = f1.checklistItems;

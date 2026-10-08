/**
 * 工場ごとに違う見本データ（2026-10-07）。
 *
 * 管理画面のデータ検索・承認申請管理・帳票管理は、どの工場を開いても同じ見本が並んでいた。
 * 各画面の見本（mockData）を元に、工場ごとに 件数・場所や製品の名前・実施者・日付・承認ステータス を変えた見本を作る。
 *
 * - f1（㈱西原食品 本社工場）は元の見本のまま。画面設計の hash（id 入り）と再生が f1 の見本を前提にしているため
 * - 件数は FACTORY_SCALE（元の見本の何倍か）。f5 は 0 件で「データがありません。」を見せる工場
 * - 同じ工場を開き直しても同じ見本になる（工場 id と帳票から決まる乱数）
 *
 * 使い方：Context の `useState(見本)` を `useFactoryList("帳票の slug", 見本, "records" | "registry")` に差し替える。
 * どの工場かは URL の `/factories/fN` → `?factory=fN` → 承認申請管理で最後に開いた工場 の順で決める（useDemoFactoryId）。
 */
import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { FACTORIES } from "../../data/factories";
import { approvalRequests } from "./approvals";

/** 元の見本の何倍の件数にするか。0 は空（データがありません。）。f1 は元のまま */
const FACTORY_SCALE: Record<string, number> = {
  f2: 1.5, f3: 1, f4: 2, f5: 0, f6: 1, f7: 1.5, f8: 0.5, f9: 2, f10: 1, f11: 0.5,
  f12: 4, f13: 0.3, f14: 1, f15: 0.5, f16: 2.5, f17: 1, f18: 1.5, f19: 3, f20: 1, f21: 2,
};

/** 会社ごとの職員（実施者・確認者・コメントの書き手などに使う） */
const STAFF_BY_COMPANY: Record<string, string[]> = {
  西原食品: ["佐藤健一", "高橋美咲", "渡辺真由", "小林誠司", "吉田浩二", "山本拓海", "田村康平", "松本奈々"],
  ヒコシマリン: ["中村大輔", "伊藤さくら", "加藤翔太", "山口恵", "斎藤隆", "清水由香"],
  ゆば将: ["森田和也", "石井綾", "前田慎吾", "藤田真理子"],
  匠フーズ: ["岡本健太", "長谷川舞", "村上直樹", "近藤千尋", "坂本亮"],
  薩摩家: ["西村拓也", "福田沙織", "太田誠", "原田美穂"],
  西通りプリン: ["小川陽介", "中島彩花", "後藤剛", "岩崎優子", "上田悠斗", "宮本咲"],
  桜寿食品: ["松井大樹", "野口奈緒", "菅原聡"],
  亜味撰: ["木下隼人", "久保愛", "千葉修", "大野真央", "平野亮介", "市川莉子", "桑原誠一", "杉山結衣"],
  ゆう屋: ["横山翼", "工藤里奈"],
  五島製麺: ["浜田俊介", "荒木恵美", "島田浩之", "内田明日香"],
  有明農産: ["永井智也", "新井瞳", "小松健"],
  龍屋物産: ["林田拓真", "安藤彩", "河野勇気", "大塚美穂", "吉川大地"],
  松山製菓: ["今井翔", "柴田真由美", "酒井一輝", "宮崎遥", "関口雅人"],
  はやしハム: ["林健太郎", "林美和", "望月航", "飯田志保", "高木陸", "丸山千夏"],
  あったか市場: ["土屋悠", "菊地美里", "杉本和樹"],
  鈴木商会: ["鈴木一郎", "鈴木花子", "野村健二", "増田愛子", "堀内翔"],
};

/** 帳票ごとの「名前」の項目と、工場ごとに入れ替える名前の候補 */
type NameRule = { keys: string[]; pool: string[] };
const NAME_RULES: Record<string, NameRule> = {
  "water-inspection": {
    keys: ["name", "location"],
    pool: ["給湯室", "点検場所B", "1F 手洗い場", "製造棟 洗浄室", "2F 休憩室", "包装室 蛇口", "原料庫 水栓", "充填室 給水口", "出荷場 蛇口", "計量室 シンク", "加熱室 給水口", "冷却室 水栓", "検品室 手洗い", "事務所 給湯室", "3F 洗面所", "仕込み室 蛇口"],
  },
  "cleaning-record": {
    keys: ["name", "lineLabel"],
    pool: ["ゆばライン", "充填・包装ライン", "豆乳パックライン", "自動計量機・風力選別機ライン", "第1製造ライン", "第2製造ライン", "冷凍食品ライン", "惣菜盛付ライン", "麺製造ライン", "焼成ライン", "ハム燻製ライン", "スライスライン", "洗浄室", "仕込み室", "出荷場", "原料保管庫"],
  },
  "equipment-inspection": {
    keys: ["lineLabel"],
    pool: ["【毎日】豆乳ライン", "【毎日】ゆばライン（つまみ関係）", "【毎週】ゆばライン（その他）", "【毎月】冷凍・冷蔵設備ライン", "【毎日】第1製造ライン", "【毎日】充填ライン", "【毎週】包装ライン", "【毎月】ボイラー設備", "【毎日】焼成ライン", "【毎年】空調設備", "【毎日】スライスライン", "【毎週】殺菌ライン"],
  },
  // データ検索の点検場所は記録ではなく決まった一覧（フロアA〜C）から出すので、記録の floorName は変えない
  "glass-plastic": {
    keys: ["name"],
    pool: ["1F 製造室", "2F 包装室", "1F 原料庫", "2F 検品室", "3F 事務所", "1F 出荷場", "地下 機械室", "2F 冷蔵庫", "1F 仕込み室", "2F 休憩室"],
  },
  "scale-inspection": {
    keys: ["name", "label", "scaleLabel"],
    pool: ["添加物", "プリン", "トッピング", "アイス", "カタラーナ", "原料計量", "調味料", "具材", "包装前計量", "出荷前計量", "仕込み", "ソース"],
  },
  "sample-management": {
    keys: ["name", "productName"],
    pool: ["仕出しだし巻き玉子 冷凍", "茶碗蒸しの素（濃縮）", "ふわとろスクランブルエッグ", "冷凍ぎょうざ 12個入", "焼豚スライス 200g", "生うどん 3食入", "ごま豆腐 120g", "チーズケーキ ホール", "ロースハム 切り落とし", "炊き込みご飯の素", "鶏の照り焼き 冷凍", "あんこ 500g"],
  },
  "sensory-inspection": {
    keys: ["name", "productName"],
    pool: ["マンゴープリン　ストレート　1kg", "厚焼き玉子（本）　500g", "たまごサラダ　200g", "だし巻き玉子　厚焼き　300g", "カスタードプリン　80g", "生ハム　50g", "かけうどん　1食", "抹茶ロールケーキ", "焼きのり　10枚", "ポテトサラダ　1kg", "豆乳プリン　100g", "ベーコン　ブロック"],
  },
  "chemical-management": {
    keys: ["name", "chemicalName"],
    pool: ["次亜塩素酸ナトリウム", "にがり（塩化マグネシウム）", "グルコノデルタラクトン", "アルコール製剤", "中性洗剤", "アルカリ洗浄剤", "酸性洗浄剤", "過酢酸製剤", "塩素系漂白剤", "殺菌灯用洗浄液"],
  },
  "additive-management": {
    keys: ["name", "additiveName"],
    pool: ["ソルビン酸", "にがり（塩化マグネシウム）", "グリシン", "酢酸ナトリウム", "ビタミンC", "カラメル色素", "増粘多糖類", "pH調整剤", "乳化剤", "香料"],
  },
  "metal-xray-detection": {
    keys: ["name", "machineName"],
    pool: ["金探1号機（500g以下の場合）", "金探1号機（1kg以下の場合）", "金探2号機", "X線検査機 A", "X線検査機 B", "ウェイトチェッカー 1号機", "包装ライン 金探", "充填ライン 金探", "出荷前 X線", "冷凍品 金探"],
  },
};

/** 人の名前が入る項目 */
const PERSON_KEY = /^(implementer|confirmer|approver|inspector|inspectorName|confirmerName|author|operator|staff|recorder|checker|createdBy|updatedBy|reviewer|rejectedBy)$/;

const APPROVAL_STATUSES = ["pending", "approved", "approved", "rejected"];

/**
 * データ検索の記録（records）の工場ごとの傾向（2026-10-08）。
 * - abnormal：異常（×・NG・2 点以下・異常反応・破棄）の記録が多い工場（元の見本の異常の記録を 3 倍の割合で使う）
 * - skip：点検見送り（ー）が多い工場
 * - clean：異常も見送りも無い工場（正常の記録だけ）
 * - long：場所・ライン・製品などの名前が長い工場
 * 書いていない工場は元の見本と同じ割合。f5 は FACTORY_SCALE で 0 件。
 */
const FACTORY_FLAVOR: Record<string, "abnormal" | "skip" | "clean" | "long"> = {
  f2: "abnormal",
  f6: "long",
  f7: "skip",
  f9: "clean",
  f14: "clean",
  f16: "abnormal",
  f18: "skip",
  f21: "long",
};

const LONG_SUFFIX = "（第2工場 増設棟 北側エリア）";

/** 帳票ごとの「異常あり」「見送り」の見分け方（元の見本の JSON の文字で見る） */
const FLAVOR_TEST: Record<string, { abnormal?: RegExp; skip?: RegExp }> = {
  "water-inspection": { abnormal: /"status":"abnormal"|"chlorineReplenished":true|"abnormalDetectionLight":"on"/ },
  "glass-plastic": { abnormal: /"status":"issue"/ },
  "scale-inspection": { abnormal: /"operationCheck":"ng"|"weightCause":"/, skip: /"skipped":true/ },
  "sensory-inspection": { abnormal: /"score":[12],/ },
  "metal-xray-detection": { abnormal: /"result":"NG"/ },
  "sample-management": { abnormal: /"status":"破棄済み"/ },
  "equipment-inspection": { abnormal: /"resultIcon":"ng"/, skip: /"resultIcon":"skip"/ },
  "cleaning-record": { skip: /"cleaned":false/ },
};

/** 傾向に合わせて、作り直しに使う元の記録の並びを変える */
function flavoredSequence<T>(slug: string, base: T[], flavor: string | undefined): T[] {
  const test = FLAVOR_TEST[slug];
  if (!flavor || flavor === "long" || !test) return base;
  const is = (re: RegExp | undefined, r: T) => !!re && re.test(JSON.stringify(r));
  if (flavor === "clean") {
    const clean = base.filter((r) => !is(test.abnormal, r) && !is(test.skip, r));
    return clean.length ? clean : base;
  }
  const re = flavor === "abnormal" ? test.abnormal : test.skip;
  if (!re) return base;
  return base.flatMap((r) => (is(re, r) ? [r, r, r] : [r]));
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: string) {
  let x = hash(seed) || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function staffFor(factoryId: string) {
  const name = FACTORIES.find((f) => f.id === factoryId)?.name ?? "";
  const key = Object.keys(STAFF_BY_COMPANY).find((k) => name.includes(k));
  return STAFF_BY_COMPANY[key ?? "西原食品"];
}

/** 2025-04-08 / 2025/04/08 / 2025.04.08 / 04/08 の「日」を、shift 日だけ 4 月の中でずらす */
function shiftDates(s: string, shift: number) {
  if (!shift) return s;
  const day = (d: string) => String(((Number(d) - 1 + shift) % 30 + 30) % 30 + 1).padStart(2, "0");
  return s
    .replace(/(2025[-/.]04[-/.])(\d{2})/g, (_, p, d) => p + day(d))
    .replace(/(^|[^\d/])(04\/)(\d{2})(?![\d/])/g, (_, a, p, d) => a + p + day(d));
}

/**
 * 元の見本から、その工場の見本を作る。
 * - "records"：点検の記録。同じ場所の記録が日付違いで増える。承認ステータスも工場ごとに変える
 * - "registry"：帳票管理の登録物（点検場所・ライン・製品など）。増えた分は別の名前にする
 */
/** records：データ検索の記録（承認ステータスも工場ごとに変える）／ approval：承認申請管理の記録（承認待ちのまま）／ registry：帳票管理の登録物 */
type DemoKind = "records" | "approval" | "registry";

const cache = new Map<string, { base: unknown; list: unknown[] }>();

export function demoForFactory<T>(slug: string, factoryId: string, base: T[], kind: DemoKind = "records"): T[] {
  if (factoryId === "f1" || !base.length) return base;
  // 同じ工場・同じ元の見本なら同じ配列を返す（描くたびに作り直すと、一覧に頼る useMemo や useEffect が毎回走るため）
  const key = `${slug}:${factoryId}:${kind}:${base.length}`;
  const hit = cache.get(key);
  if (hit && hit.base === base) return hit.list as T[];
  const list = buildDemo(slug, factoryId, base, kind);
  cache.set(key, { base, list });
  return list;
}

function buildDemo<T>(slug: string, factoryId: string, base: T[], kind: DemoKind): T[] {
  const scale = FACTORY_SCALE[factoryId] ?? 1;
  if (scale === 0) return [];
  const count = Math.max(1, Math.round(base.length * scale));
  const rand = rng(`${slug}:${factoryId}`);
  const staff = staffFor(factoryId);
  const rule = NAME_RULES[slug];
  const pool = rule ? [...rule.pool].sort(() => rand() - 0.5) : [];
  const nameMap = new Map<string, string>();
  const personMap = new Map<string, string>();
  let next = 0;
  const pickName = (orig: string) => {
    if (!nameMap.has(orig)) nameMap.set(orig, pool.length ? pool[next++ % pool.length] : orig);
    return nameMap.get(orig)!;
  };
  const pickPerson = (orig: string) => {
    if (!personMap.has(orig)) personMap.set(orig, staff[personMap.size % staff.length]);
    return personMap.get(orig)!;
  };

  const flavor = kind === "records" ? FACTORY_FLAVOR[factoryId] : undefined;
  const seq = flavoredSequence(slug, base, flavor);
  const seen = new Map<T, number>();

  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const src = seq[i % seq.length];
    // 同じ元の記録の何回目か（2 回目からは id の後ろに -1・-2… を付け、日付と場所を変える）
    const cycle = seen.get(src) ?? 0;
    seen.set(src, cycle + 1);
    const shift = kind !== "registry" ? cycle * 3 + Math.floor(rand() * 2) : 0;
    // 置き換える名前（この 1 件の中では、同じ元の名前は同じ新しい名前にする）
    const renames = new Map<string, string>();
    if (rule && src && typeof src === "object") {
      for (const key of rule.keys) {
        const v = (src as Record<string, unknown>)[key];
        // 登録物は増えた分を別の名前に。記録も 2 周目・3 周目は別の場所にして、場所の数も増やす（4 周目からは同じ場所の別の日）
        if (typeof v === "string" && v) {
          const picked = pickName(cycle && (kind === "registry" || cycle < 3) ? `${v}#${cycle}` : v);
          // 「【毎日】」のような頭書きは元のものを残す
          const head = /^【[^】]+】/.exec(v)?.[0] ?? "";
          const named = head && !picked.startsWith("【") ? head + picked : picked;
          renames.set(v, flavor === "long" ? named + LONG_SUFFIX : named);
        }
      }
    }
    const walk = (v: unknown, key: string): unknown => {
      if (typeof v === "string") {
        if (key === "factoryId") return factoryId;
        if (key === "id" && cycle) return `${v}-${cycle}`;
        if (PERSON_KEY.test(key)) return pickPerson(v);
        if (renames.has(v)) return renames.get(v);
        return shiftDates(v, shift);
      }
      if (Array.isArray(v)) return v.map((x) => walk(x, key));
      if (v && typeof v === "object") {
        return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
      }
      return v;
    };
    const item = walk(src, "") as Record<string, unknown>;
    if (kind === "records" && typeof item.approvalStatus === "string") {
      item.approvalStatus = APPROVAL_STATUSES[Math.floor(rand() * APPROVAL_STATUSES.length)];
    }
    out.push(item as T);
  }
  return out;
}

const LAST_KEY = "nq_demo_factory";

/** いま見ている工場。URL の /factories/fN → ?factory=fN → 承認申請管理で最後に開いた工場 → f1 */
export function useDemoFactoryId(): string {
  const { pathname, search } = useLocation();
  const inPath = /\/factories\/(f\d+)/.exec(pathname)?.[1];
  if (inPath) return inPath;
  const inSearch = new URLSearchParams(search).get("factory");
  if (inSearch) {
    try {
      sessionStorage.setItem(LAST_KEY, inSearch);
    } catch {
      /* 保存できなくても動く */
    }
    return inSearch;
  }
  // 秤点検記録の承認申請管理は申請の id が URL に入る
  const requestId = /\/approvals\/scale-inspection\/([^/]+)/.exec(pathname)?.[1];
  if (requestId) {
    const req = approvalRequests.find((r) => r.id === requestId);
    const fid = req && factoryIdOfName(req.companyName);
    if (fid) return fid;
  }
  try {
    return sessionStorage.getItem(LAST_KEY) || "f1";
  } catch {
    return "f1";
  }
}

export function factoryIdOfName(name: string) {
  return FACTORIES.find((f) => f.name === name)?.id;
}

/**
 * Context の `useState(見本)` の代わり。いま見ている工場の一覧と、それを書き換える関数を返す。
 * 工場ごとに別々に持つので、ある工場で足した・消したものは、ほかの工場には出ない。
 */
export function useFactoryList<T>(slug: string, base: T[], kind: DemoKind = "records") {
  const factoryId = useDemoFactoryId();
  const [byFactory, setByFactory] = useState<Record<string, T[]>>({});
  const list = byFactory[factoryId] ?? demoForFactory(slug, factoryId, base, kind);
  const setList = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      setByFactory((prev) => {
        const current = prev[factoryId] ?? demoForFactory(slug, factoryId, base, kind);
        return { ...prev, [factoryId]: typeof next === "function" ? (next as (p: T[]) => T[])(current) : next };
      });
    },
    [factoryId, slug, base, kind]
  );
  return [list, setList] as const;
}

/** いま見ている工場の名前（承認申請管理のように URL に工場が入らない画面で使う） */
export function useDemoFactoryName(): string {
  const id = useDemoFactoryId();
  return FACTORIES.find((f) => f.id === id)?.name ?? "工場";
}

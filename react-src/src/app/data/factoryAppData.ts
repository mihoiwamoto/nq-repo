/**
 * プロトタイプの「ログイン中」で選んだ工場の、アプリの見本を組み立てる（2026-10-07）。
 *
 * 各帳票の mockData の点検対象（ひな形）を登録しておき、demoStore の useDemoInspectionState /
 * useDemoUninspected / useDemoList がその配列を受け取ったら、ここで工場の一覧に差し替える。
 *
 *   1. 名前（factoryThemes.ts）… 工場の業種に合わせた名前で並べ直す。元の見本と同じ件数までは
 *      元の id のまま（記録などの中身もそのまま引ける）、それより多い分は `元の id~番号`（targetId.ts）
 *   2. パターン（appFactoryStore.ts の FACTORY_PROFILES）… 絞る・増やす・点検状況を変える など
 *   3. 確認待ち・進捗一覧 … 行の点検対象を、同じ工場の 1.2. の一覧の対象に付け替え、名前も合わせる
 *
 * f1（画面設計とユースケースの再生で使う）は、画面設計の枠の中（?frame=1）では見本のまま。
 * プロトタイプでは見本の後ろに FACTORY_THEMES.f1 の分を足す。
 * 同じ工場・同じひな形なら同じ配列を返す（React の依存が毎回変わらないように）。
 */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { applyFactoryProfile, loadAppFactory, useAppFactory } from "../../data/appFactoryStore";
import { FACTORY_THEMES, type FactoryTheme } from "./factoryThemes";
import { tplId } from "./targetId";
import { lines as equipmentLines } from "../features/equipment-inspection/mockData";
import { lines as cleaningLines } from "../features/cleaning-record/mockData";
import { floors } from "../features/glass-plastic/mockData";
import { posts } from "../features/scale-inspection/mockData";
import { products as sensoryProducts } from "../features/sensory-inspection/mockData";
import { points as waterPoints, recordsByPoint } from "../features/water-inspection/mockData";
import { SAMPLE_ENTRIES, STORED_SAMPLES } from "../features/sample-management/mockData";
import { MACHINES } from "../features/metal-xray-detection/mockData";
import { additives } from "../features/additive-management/mockData";
import { chemicals } from "../features/chemical-management/mockData";
import { PENDING_REVIEWS } from "./pendingReviews";
import { PROGRESS_ENTRIES } from "../features/progress/mockData";

const FRAME = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("frame");

type ThemeList = Exclude<keyof FactoryTheme, "kind">;

/** 点検対象のひな形 */
type TargetSpec = {
  kind: "target";
  theme: ThemeList;
  /** 名前の項目 */
  nameKey: string;
  /** 実施者の項目（見本に入っているときだけ工場の人に替える） */
  personKey?: string;
  /**
   * ひな形の件数と並びを残して名前だけ順に当てる（工場の名前のほうが多ければ後ろに足す）。
   * ライン（毎日・毎週・毎月・毎年のまとまりで並んでいる）用。頻度が偏らないように
   */
  cycle?: boolean;
};
/** 確認待ち・進捗一覧（点検対象を指す行） */
type EntrySpec = { kind: "entries" };

const SPECS = new Map<unknown[], TargetSpec | EntrySpec>();

/** 点検対象のひな形を登録する。ページの中で持っている見本（検体管理の SPECIMEN_ENTRIES）もここで登録できる */
export function registerFactoryTemplate(items: unknown[], spec: Omit<TargetSpec, "kind">) {
  SPECS.set(items, { kind: "target", ...spec });
}

registerFactoryTemplate(equipmentLines, { theme: "lines", nameKey: "name", personKey: "inspectorName", cycle: true });
registerFactoryTemplate(cleaningLines, { theme: "lines", nameKey: "name", personKey: "inspectorName", cycle: true });
registerFactoryTemplate(floors, { theme: "floors", nameKey: "name", personKey: "inspectorName" });
registerFactoryTemplate(posts, { theme: "posts", nameKey: "name", personKey: "inspectorName" });
registerFactoryTemplate(sensoryProducts, { theme: "products", nameKey: "name", personKey: "inspectorName" });
registerFactoryTemplate(waterPoints, { theme: "points", nameKey: "name", personKey: "inspectorName" });
registerFactoryTemplate(SAMPLE_ENTRIES, { theme: "samples", nameKey: "productName", personKey: "inspectorName" });
registerFactoryTemplate(STORED_SAMPLES, { theme: "samples", nameKey: "productName", personKey: "inspectorName" });
registerFactoryTemplate(MACHINES, { theme: "machines", nameKey: "name" });
registerFactoryTemplate(additives, { theme: "additives", nameKey: "name" });
registerFactoryTemplate(chemicals, { theme: "chemicals", nameKey: "name" });
SPECS.set(PENDING_REVIEWS, { kind: "entries" });
SPECS.set(PROGRESS_ENTRIES, { kind: "entries" });

type Obj = Record<string, unknown>;

/** 1. 工場の業種の名前で並べた点検対象（パターンを当てる前） */
function baseTargets(tpl: Obj[], factory: string, spec: TargetSpec): Obj[] {
  if (FRAME || tpl.length === 0) return tpl;
  const theme = FACTORY_THEMES[factory];
  if (!theme) return tpl;
  const names = theme[spec.theme];
  const people = theme.people;
  const person = (item: Obj, i: number) =>
    spec.personKey && typeof item[spec.personKey] === "string" && item[spec.personKey]
      ? { [spec.personKey]: people[i % people.length] }
      : {};
  const make = (i: number, name: string = names[i % names.length]): Obj => {
    const src = tpl[i % tpl.length];
    return {
      ...src,
      id: i < tpl.length ? src.id : `${src.id as string}~${i}`,
      [spec.nameKey]: name,
      ...person(src, i),
    };
  };
  // f1 は見本のまま、後ろに足すだけ
  if (factory === "f1") return [...tpl, ...names.map((name, k) => make(tpl.length + k, name))];
  if (spec.cycle) return Array.from({ length: Math.max(tpl.length, names.length) }, (_, i) => make(i));
  return names.map((name, i) => make(i, name));
}

const cache = new Map<unknown[], Map<string, unknown[]>>();
function cached<T>(items: unknown[], key: string, build: () => T[]): T[] {
  let m = cache.get(items);
  if (!m) cache.set(items, (m = new Map()));
  let v = m.get(key);
  if (!v) m.set(key, (v = build()));
  return v as T[];
}

/** 2. 工場の点検対象（パターンを当てたもの）。帳票の Context・一覧が持つのと同じ */
function targetsFor(tpl: unknown[], factory: string, spec: TargetSpec, opts: { full: boolean; status: boolean }) {
  return cached<Obj>(tpl, `${factory}|${opts.full}|${opts.status}`, () =>
    applyFactoryProfile(baseTargets(tpl as Obj[], factory, spec), factory, { ...opts, nameKey: spec.nameKey }),
  );
}

/** 確認待ち・進捗一覧の行の点検対象（帳票ごと。pendingReviews と progress で項目名が違う） */
const ENTRY_TARGETS: Record<string, { tpl: unknown[]; keys: string[] }> = {
  "equipment-inspection": { tpl: equipmentLines, keys: ["lineId"] },
  "cleaning-record": { tpl: cleaningLines, keys: ["lineId"] },
  "water-inspection": { tpl: waterPoints, keys: ["pointId"] },
  "glass-plastic": { tpl: floors, keys: ["floorId"] },
  "scale-inspection": { tpl: posts, keys: ["postId"] },
  "metal-xray-detection": { tpl: MACHINES, keys: ["machineId"] },
  "additive-management": { tpl: additives, keys: ["additiveId", "productId"] },
  "chemical-management": { tpl: chemicals, keys: ["chemicalId", "productId"] },
  "sample-management": { tpl: SAMPLE_ENTRIES, keys: ["sampleId", "productId"] },
  "sensory-inspection": { tpl: sensoryProducts, keys: ["productId"] },
};

/** 3. 確認待ち・進捗一覧の行を、工場の点検対象に付け替える */
function entriesFor(entries: Obj[], factory: string): Obj[] {
  if (FRAME || (factory === "f1" && !FACTORY_THEMES.f1)) return entries;
  return cached<Obj>(entries, factory, () => {
    const out: Obj[] = [];
    // 点検対象が少ない工場では同じ対象に付け替わる行が出るので、同じ日・同じ帳票・同じ対象は 1 行にする
    const seen = new Set<string>();
    for (const e of entries) {
      const def = ENTRY_TARGETS[e.ledgerSlug as string];
      const spec = def && (SPECS.get(def.tpl) as TargetSpec | undefined);
      if (!def || !spec) {
        out.push(e);
        continue;
      }
      const list = targetsFor(def.tpl, factory, spec, { full: true, status: true });
      if (list.length === 0) continue; // その工場には点検対象が無い
      const key = def.keys.find((k) => typeof e[k] === "string");
      const orig = key ? (e[key] as string) : undefined;
      const tplIdx = orig ? (def.tpl as Obj[]).findIndex((x) => x.id === orig) : 0;
      // 同じ id があればそれ（記録・差し戻しコメントがそのまま合う）、無ければ同じ並びの位置の対象
      const item =
        (orig && list.find((x) => x.id === orig)) ||
        (orig && list.find((x) => tplId(x.id as string) === orig)) ||
        list[Math.max(0, tplIdx) % list.length];
      const name = item[spec.nameKey] as string;
      const prefix = (e.name as string).match(/^【[^】]*】/)?.[0] ?? "";
      const next: Obj = { ...e, name: prefix + name };
      if (key) next[key] = item.id;
      const dup = `${e.date as string}|${e.ledgerSlug as string}|${item.id as string}`;
      if (seen.has(dup)) continue;
      seen.add(dup);
      // 使用水は記録の id も、付け替えた点検場所の記録に合わせる
      if (e.ledgerSlug === "water-inspection" && typeof e.recordId === "string") {
        const recs = recordsByPoint[item.id as string] ?? [];
        if (!recs.some((r) => r.id === e.recordId) && recs[0]) next.recordId = recs[0].id;
      }
      out.push(next);
    }
    return out;
  });
}

/**
 * demoStore から呼ぶ。登録したひな形なら工場の一覧に、そうでなければパターンだけ当てて返す。
 */
export function factoryItems<T>(items: T[], factory: string, opts: { full: boolean; status: boolean }): T[] {
  const spec = SPECS.get(items as unknown[]);
  if (spec?.kind === "target") return targetsFor(items as unknown[], factory, spec, opts) as T[];
  if (spec?.kind === "entries") return entriesFor(items as Obj[], factory) as T[];
  return applyFactoryProfile(items, factory, opts);
}

/**
 * 見本の定数を id で引く画面用（詳細・記録入力・確認待ちの詳細など）。
 * いまの工場の一覧（Context と同じもの）から引き、無ければ元の id で見本から引く。
 */
export function findFactoryItem<T extends { id: string }>(items: T[], id: string | undefined): T | undefined {
  if (!id) return undefined;
  const list = factoryItems(items, loadAppFactory(), { full: true, status: true });
  return list.find((x) => x.id === id) ?? items.find((x) => x.id === id) ?? items.find((x) => x.id === tplId(id));
}

/** 工場を切り替えたら作り直す state（最初の 1 回は作り直さない） */
function useFactoryState<S>(build: (factory: string) => S): [S, Dispatch<SetStateAction<S>>] {
  const factory = useAppFactory();
  const [state, setState] = useState<S>(() => build(factory));
  const built = useRef(factory);
  useEffect(() => {
    if (built.current === factory) return;
    built.current = factory;
    setState(build(factory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory]);
  return [state, setState];
}

const FULL = { full: true, status: true };

/**
 * 点検対象の id → 記録 の表（使用水の recordsByPoint、秤の scalesByPost など）を、いまの工場の点検対象に合わせて持つ。
 * 増やした点検対象には元の id の中身を写す。map で名前などを点検対象に合わせられる。
 */
export function useFactoryKeyed<V, T extends { id: string }>(
  initial: Record<string, V>,
  template: T[],
  map?: (value: V, target: T, factory: string) => V,
) {
  return useFactoryState<Record<string, V>>((factory) => {
    const out: Record<string, V> = {};
    for (const key of Object.keys(initial)) out[key] = initial[key];
    for (const t of factoryItems(template, factory, FULL)) {
      const v = initial[tplId(t.id)];
      if (v === undefined) continue;
      out[t.id] = map ? map(v, t, factory) : v;
    }
    return out;
  });
}

/**
 * 点検対象の id を項目に持つ記録の配列（添加物・薬品の記録）を、いまの工場の点検対象に合わせて持つ。
 * 増やした点検対象には、元の id の記録を写して付け替える（記録の id は `元の記録 id~点検対象 id`）。
 */
export function useFactoryRecords<R extends { id: string }, T extends { id: string }>(
  initial: R[],
  template: T[],
  idKey: keyof R & string,
) {
  return useFactoryState<R[]>((factory) => {
    const out = initial.slice();
    for (const t of factoryItems(template, factory, FULL)) {
      if (initial.some((r) => r[idKey] === t.id)) continue;
      for (const r of initial) {
        if (r[idKey] === tplId(t.id)) out.push({ ...r, id: `${r.id}~${t.id}`, [idKey]: t.id });
      }
    }
    return out;
  });
}

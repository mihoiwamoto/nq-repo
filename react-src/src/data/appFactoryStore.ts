/**
 * プロトタイプ（「プロトタイプで開く」の先）の右下「切り替え › ログイン中」で選ぶ、アプリにログインしている工場（2026-10-07）。
 *
 * 工場を切り替えると、アプリの見本データ（帳票一覧から開く各帳票の点検対象・確認待ち・進捗一覧）が
 * 工場ごとのパターン（FACTORY_PROFILES）に変わる。見本そのものは React の mockData のまま増やさず、
 * demoStore の useDemoInspectionState / useDemoUninspected / useDemoList の中で
 * 絞る・増やす・並べ替える・点検状況を変える・名前を長くする、を当てて作る。
 *
 * - f1（㈱西原食品 本社工場）は画面設計の hash とユースケースの再生で使うので、見本のまま変えない
 * - 画面設計の枠の中（?frame=1）は常に f1。管理画面には効かない
 * - 選んだ工場は sessionStorage に持つ（「プロトタイプで開く」で写る。枠とは混ざらない）
 */
import { useEffect, useState } from "react";
import { FACTORIES } from "./factories";
import { FACTORY_THEMES } from "../app/data/factoryThemes";

const KEY = "nq_kit_factory";
export const APP_FACTORY_EVENT = "nq-kit-factory-changed";
export const DEFAULT_APP_FACTORY = "f1";

const FRAME = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("frame");
/** 枠の中でも ?frame=1&appFactory=f5 と書いたときだけその工場にする（Figma への書き出しで「点検対象が 0 件」を撮るため。2026-10-08） */
const FRAME_FACTORY =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("appFactory") : null;

/** 見本の変え方。上から順に当てる */
type Profile = {
  desc: string;
  /** 並べ替え */
  reverse?: boolean;
  /** 残す件数。half=半分（切り上げ）、one=1 件、none=0 件 */
  take?: "half" | "one" | "none";
  /** 何倍に増やすか（増やした分は id と名前に番号を付ける）。Context で持つ帳票だけ */
  times?: number;
  /** 点検状況。done=すべて点検済み、todo=すべて未点検、alt=1 件おきに点検済み */
  status?: "done" | "todo" | "alt";
  /** 名前を長くする。Context で持つ帳票だけ */
  long?: boolean;
};

/** 工場ごとの見本のパターン。ログイン中のカードの下の行（desc）にも出す */
export const FACTORY_PROFILES: Record<string, Profile> = {
  f1: { desc: "画面設計と同じ見本（プロトタイプでは後ろに足す）" },
  f2: { desc: "点検対象が少ない（半分）", take: "half" },
  f3: { desc: "今日の点検がすべて済んでいる", status: "done" },
  f4: { desc: "今日はまだ誰も点検していない", status: "todo" },
  f5: { desc: "点検対象が 1 件も無い", take: "none" },
  f6: { desc: "点検対象の名前が長い", long: true },
  f7: { desc: "点検対象がとても多い（5 倍）", times: 5 },
  f8: { desc: "並びと点検状況が違う", reverse: true, status: "alt" },
  f9: { desc: "点検対象が 1 件だけ", take: "one" },
  f10: { desc: "半分だけ点検済み", status: "alt" },
  f11: { desc: "点検対象が多く、まだ未点検", times: 3, status: "todo" },
  f12: { desc: "1 件だけで点検済み", take: "one", status: "done" },
  f13: { desc: "点検対象が 1 件も無い", take: "none" },
  f14: { desc: "名前が長く、点検対象が少ない", take: "half", long: true },
  f15: { desc: "並びが逆", reverse: true },
  f16: { desc: "点検対象が多く、半分だけ点検済み", times: 3, status: "alt" },
  f17: { desc: "点検対象が少なく、すべて点検済み", take: "half", status: "done" },
  f18: { desc: "名前が長く、まだ未点検", long: true, status: "todo" },
  f19: { desc: "1 件だけでまだ未点検", take: "one", status: "todo" },
  f20: { desc: "点検対象が多く、名前が長い", times: 3, long: true },
  f21: { desc: "並びが逆で、半分だけ点検済み", reverse: true, status: "alt" },
};

/** ログイン中のカードの説明は「業種・見本のパターン」（業種は app/data/factoryThemes.ts） */
export const APP_FACTORIES = FACTORIES.map((f) => ({
  ...f,
  desc: [FACTORY_THEMES[f.id]?.kind, FACTORY_PROFILES[f.id]?.desc].filter(Boolean).join("・"),
}));

export function loadAppFactory(): string {
  if (FRAME) return FRAME_FACTORY && FACTORY_PROFILES[FRAME_FACTORY] ? FRAME_FACTORY : DEFAULT_APP_FACTORY;
  try {
    const v = sessionStorage.getItem(KEY);
    if (v && FACTORY_PROFILES[v]) return v;
  } catch {
    /* 読めなければ既定 */
  }
  return DEFAULT_APP_FACTORY;
}

export function saveAppFactory(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* 保存できなくても、この画面の間は切り替わる */
  }
  window.dispatchEvent(new CustomEvent(APP_FACTORY_EVENT, { detail: id }));
}

export function useAppFactory(): string {
  const [id, setId] = useState(loadAppFactory);
  useEffect(() => {
    const on = () => setId(loadAppFactory());
    window.addEventListener(APP_FACTORY_EVENT, on);
    return () => window.removeEventListener(APP_FACTORY_EVENT, on);
  }, []);
  return id;
}

export function appFactoryName(id: string): string {
  return FACTORIES.find((f) => f.id === id)?.name ?? FACTORIES[0].name;
}

const LONG_SUFFIX = "（第2製造棟 1階 東側 充填・包装工程の前室）";

type Row = { status?: unknown };

/**
 * 工場のパターンを見本の一覧に当てる。
 * full=false（確認待ち・進捗一覧・記録の一覧）は、詳細画面が定数を id で引くので、
 * id や名前を変える「増やす」「名前を長くする」は当てない。点検状況も status を持つ点検対象のときだけ。
 * 定数を読む点検対象（金属/X線の機械・検体）は full=true で当て、詳細画面は findFactoryItem() で引く。
 */
export function applyFactoryProfile<T>(
  items: T[],
  factoryId: string,
  opts: { full: boolean; status: boolean; nameKey?: string },
): T[] {
  const nameKey = opts.nameKey ?? "name";
  const p = FACTORY_PROFILES[factoryId];
  if (!p || factoryId === DEFAULT_APP_FACTORY || items.length === 0) return items;
  let out = items.slice();
  if (p.reverse) out.reverse();
  if (p.take === "none") return [];
  if (p.take === "half") out = out.slice(0, Math.ceil(out.length / 2));
  if (p.take === "one") out = out.slice(0, 1);
  if (opts.full && p.times && p.times > 1) {
    const base = out;
    out = [];
    for (let k = 0; k < p.times; k++) {
      for (const item of base) {
        if (k === 0) {
          out.push(item);
          continue;
        }
        const r = item as Record<string, unknown>;
        // 増やした分の id は `元の id~x番号`（app/data/targetId.ts の tplId で元の id に戻せる）
        out.push({
          ...item,
          ...(typeof r.id === "string" ? { id: `${r.id}~x${k + 1}` } : {}),
          ...(typeof r[nameKey] === "string" ? { [nameKey]: `${r[nameKey] as string} ${k + 1}` } : {}),
        });
      }
    }
  }
  if (opts.full && p.long) {
    out = out.map((item) => {
      const r = item as Record<string, unknown>;
      return typeof r[nameKey] === "string" ? { ...item, [nameKey]: (r[nameKey] as string) + LONG_SUFFIX } : item;
    });
  }
  if (opts.status && p.status) {
    out = out.map((item, i) => {
      const r = item as Row;
      if (typeof r.status !== "string") return item;
      const done = p.status === "done" || (p.status === "alt" && i % 2 === 0);
      return { ...item, status: done ? "inspected" : "not_inspected" };
    });
  }
  return out;
}

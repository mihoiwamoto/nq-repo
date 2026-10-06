/**
 * 画面設計キットの「Ver の切替」で隠す帳票（2026-10-06）。
 * Ver を選ぶと、その Ver より後で足す帳票を、帳票のタイル・絞り込み・一覧の行（ledgerSlug を持つもの）から外す。
 *
 *   枠の中（?frame=1）      … 画面設計から flags.ver（'all' か 'Ver.3.0' など）と flags.hide（隠す slug のカンマ区切り）が届く。
 *   プロトタイプ（?kit=1） … 右下のフローティング（KitSwitch）の「バージョン」で選ぶ。選んでいなければ開発中の Ver。
 *                            選んだ Ver は画面設計と同じ localStorage（nqrepo:ver）に覚えるので、画面設計と同じ Ver で開く。
 *   ふだん（キットの外）  … 何も隠さない。
 * URL は frameBridge が hash の読み替えで消すので、モジュールを読み込んだとき（その前）に読む。
 */
import { ledgerCategories } from "./ledgers";
import type { LedgerCategory } from "../types/ledger";

/** 画面設計の ⑬ RELEASES の写し（新しい順。帳票は slug）。画面設計側を直したらここも直す */
export const KIT_VERSIONS: { ver: string; st: string; c: string; ledgers: string[] }[] = [
  { ver: "Ver.5.0", st: "予定", c: "#6B6B6B", ledgers: [] },
  { ver: "Ver.4.0", st: "デザイン中", c: "#00853C", ledgers: ["equipment-inspection", "cleaning-record", "additive-management", "chemical-management"] },
  { ver: "Ver.3.0", st: "開発中", c: "#C62F2F", ledgers: ["metal-xray-detection", "sample-management"] },
  { ver: "Ver.2.1", st: "リリース済み", c: "#4A6D99", ledgers: [] },
  { ver: "Ver.2.0", st: "リリース済み", c: "#2F7FD4", ledgers: ["scale-inspection", "sensory-inspection"] },
  { ver: "Ver.1.5", st: "リリース済み", c: "#7C4DCC", ledgers: ["glass-plastic"] },
  { ver: "Ver.1.0", st: "リリース済み", c: "#B65A0E", ledgers: ["water-inspection"] },
];
/** 何も選んでいないときの Ver（開発中のもの）。画面設計の VER_DEFAULT と同じ */
export const DEFAULT_KIT_VER = (KIT_VERSIONS.find((v) => v.st === "開発中") || { ver: "" }).ver;
/** 画面設計の LS（PROJECT.key + ':ver'）と同じ場所。値は JSON の文字列（'all' か Ver） */
const VER_LS = "nqrepo:ver";

const q = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const IN_FRAME = q.has("frame");
const IN_KIT = (() => {
  if (IN_FRAME) return false;
  if (q.has("kit")) return true;
  try {
    return !!sessionStorage.getItem("nq_kit_info");
  } catch {
    return false;
  }
})();

const parse = (v: string | null | undefined) => new Set((v || "").split(",").map((x) => x.trim()).filter(Boolean));
/** 'all'・空 → ''（すべて）。知らない Ver は undefined */
const norm = (v: unknown): string | undefined =>
  v === "all" || v === "" ? "" : typeof v === "string" && KIT_VERSIONS.some((x) => x.ver === v) ? v : undefined;
const hiddenFor = (ver: string) => {
  const i = KIT_VERSIONS.findIndex((x) => x.ver === ver);
  return new Set(i < 0 ? [] : KIT_VERSIONS.slice(0, i).flatMap((x) => x.ledgers));
};
function readLs(): unknown {
  try {
    const v = localStorage.getItem(VER_LS);
    return v == null ? undefined : JSON.parse(v);
  } catch {
    return undefined;
  }
}
function writeLs(v: string) {
  try {
    localStorage.setItem(VER_LS, JSON.stringify(v || "all"));
  } catch {
    /* 無視 */
  }
}

let ver = "";
let hidden = new Set<string>();
(() => {
  if (IN_FRAME) {
    ver = norm(q.get("ver")) ?? "";
    hidden = q.has("hide") ? parse(q.get("hide")) : hiddenFor(ver);
    return;
  }
  if (!IN_KIT) return;
  const fromUrl = norm(q.get("ver"));
  if (fromUrl !== undefined) writeLs(fromUrl);
  ver = fromUrl ?? norm(readLs()) ?? DEFAULT_KIT_VER;
  hidden = q.has("hide") ? parse(q.get("hide")) : hiddenFor(ver);
})();

/** frameBridge の applyFlags から呼ぶ。ver も hide も無いとき、枠の中なら何も隠さない（プロトタイプはいまのまま） */
export function setLedgerFlags(flags: Record<string, unknown>) {
  const hasVer = "ver" in flags, hasHide = "hide" in flags;
  if (!hasVer && !hasHide) {
    if (IN_FRAME) {
      ver = "";
      hidden = new Set();
    }
    return;
  }
  if (hasVer) {
    const v = norm(flags.ver);
    if (v !== undefined) {
      ver = v;
      if (!IN_FRAME) writeLs(v);
    }
  }
  hidden = hasHide ? parse(typeof flags.hide === "string" ? flags.hide : "") : hiddenFor(ver);
}
/** いまの Ver（'' はすべて）。flags に入れて送り直すときは kitVerParam() */
export const getKitVer = () => ver;
export const kitVerParam = () => ver || "all";
/** プロトタイプの右下の「バージョン」から選ぶ。覚えてから読み込み直す（一覧の数などを読み込みのときに決めている画面があるため） */
export function chooseKitVer(v: string) {
  writeLs(v);
  window.location.reload();
}

export const isLedgerHidden = (slug: string | undefined | null) => !!slug && hidden.has(slug);

/** タイル・絞り込みに並べる帳票 */
export function visibleLedgerCategories(list: LedgerCategory[] = ledgerCategories): LedgerCategory[] {
  return hidden.size ? list.filter((c) => !hidden.has(c.slug)) : list;
}

/** ledgerSlug を持つ行の一覧から、隠す帳票の行を外す。同じ配列には同じ結果を返す（useMemo などの依存が毎回変わらないように） */
const cache = new WeakMap<object, { key: string; out: unknown[] }>();
export function withoutHiddenLedgers<T>(items: T[]): T[] {
  if (!hidden.size || !Array.isArray(items)) return items;
  const key = [...hidden].join(",");
  const c = cache.get(items);
  if (c && c.key === key) return c.out as T[];
  const out = items.filter((x) => !isLedgerHidden((x as { ledgerSlug?: string } | null)?.ledgerSlug));
  cache.set(items, { key, out });
  return out;
}

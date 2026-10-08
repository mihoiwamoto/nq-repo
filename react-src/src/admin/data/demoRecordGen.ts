/**
 * データ検索の見本の記録を増やすための小道具（2026-10-08）。
 *
 * 10 帳票のデータ検索の見本（各 data-search-* の mockRecords.ts）は、元の記録（f1 の id・中身は変えない）の後ろに
 * ここの道具で組み立てた記録を足している。乱数は使わず、番号から決める（開き直しても同じ見本になる）。
 * ほかの工場の見本は factoryDemo.ts の demoForFactory() がこの f1 の見本から作り直す。
 */
import type { ApprovalStatus } from "./approvals";

/** ㈱西原食品（f1）の職員。factoryDemo.ts の STAFF_BY_COMPANY と同じ */
export const NISHIHARA_STAFF = ["佐藤健一", "高橋美咲", "渡辺真由", "小林誠司", "吉田浩二", "山本拓海", "田村康平", "松本奈々"];

/** 2025 年の m 月 d 日（"2025-04-08"） */
export function ymd(m: number, d: number) {
  return `2025-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** "2025-04-08" → "2025/04/08" */
export function slash(date: string) {
  return date.replaceAll("-", "/");
}

/** 4 月の稼働日（日曜 6・13・20・27 日と、足した日を除く） */
export function aprilDays(from = 1, to = 30, off: number[] = []) {
  const out: number[] = [];
  for (let d = from; d <= to; d++) {
    if ([6, 13, 20, 27].includes(d) || off.includes(d)) continue;
    out.push(d);
  }
  return out;
}

/** 配列を順に回して取る */
export function at<T>(list: readonly T[], i: number): T {
  return list[((i % list.length) + list.length) % list.length];
}

/** 承認ステータスの並び（承認済みが多め、ときどき承認待ち・差し戻し） */
const STATUS_CYCLE: ApprovalStatus[] = ["approved", "approved", "pending", "approved", "rejected", "approved", "pending", "approved"];
export function statusAt(i: number): ApprovalStatus {
  return at(STATUS_CYCLE, i);
}

/** "1,250" + 単位 */
export function amount(n: number, unit: string) {
  return `${n.toLocaleString("en-US")}${unit}`;
}

/** "HH:MM" に分を足す */
export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** コメントの見本（承認者・確認者のやりとり） */
export function demoComments(id: string, date: string, lines: [string, string][]) {
  return lines.map(([author, text], i) => ({
    id: `${id}-c${i + 1}`,
    author,
    timestamp: `${date.replaceAll("-", ".")} ${addMinutes("16:20", i * 35)}`,
    text,
  }));
}

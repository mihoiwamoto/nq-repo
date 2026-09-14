import { useLocation } from "react-router-dom";
import type { ProgressStatus } from "../features/progress/mockData";

/**
 * 記録の入り具合。進捗一覧のステータス（未点検 / 点検中 / 点検済み / 確認完了）を
 * どの帳票の画面でも同じように扱えるようにした 3 段階。
 *
 *   none    … 記録なし（未点検）
 *   partial … 記録途中（点検中）
 *   full    … 点検が終わっている（点検済み・確認完了）
 */
export type RecordFill = "none" | "partial" | "full";

export function fillFromProgressStatus(status: ProgressStatus): RecordFill {
  if (status === "not_inspected") return "none";
  if (status === "inspecting") return "partial";
  return "full";
}

/**
 * 進捗一覧から遷移してきたときだけ RecordFill を返す（それ以外は null）。
 * 各帳票の画面は `useProgressRecordFill() ?? 自分のモックの status から求めた値` で
 * 記録の出し分けを決める。
 */
export function useProgressRecordFill(): RecordFill | null {
  const location = useLocation();
  const state = location.state as { progressStatus?: ProgressStatus } | null;
  return state?.progressStatus ? fillFromProgressStatus(state.progressStatus) : null;
}

/** 点検中は前半だけを残して「途中まで記録した」状態にする */
export function fillSlice<T>(items: T[], fill: RecordFill): T[] {
  if (fill === "none") return [];
  if (fill === "full") return items;
  return items.slice(0, Math.max(1, Math.floor(items.length / 2)));
}

/**
 * 記録の dict 版。`order` を渡すと画面の表示順で前半を残せる
 * （キーの定義順と表示順がずれている画面があるため）。
 */
export function fillRecordMap<T>(
  source: Record<string, T>,
  fill: RecordFill,
  order?: string[],
): Record<string, T> {
  if (fill === "none") return {};
  if (fill === "full") return { ...source };
  const keys = (order ?? Object.keys(source)).filter((key) => key in source);
  return Object.fromEntries(fillSlice(keys, fill).map((key) => [key, source[key]]));
}

/**
 * 進捗一覧の「確認完了」から遷移してきたかどうか。
 * 確認完了は確認まで通った記録なので、遷移先は「すべての項目が入り切った状態」で出す。
 */
export function useProgressConfirmed(): boolean {
  const location = useLocation();
  const state = location.state as { progressStatus?: ProgressStatus } | null;
  return state?.progressStatus === "confirmed";
}

import { recordTimestamp } from "./date";

/**
 * その項目が「未記録」かどうか。
 * 空文字・未選択（null / undefined）・チェックを外した状態（false）は未記録とみなす。
 * チェック系は on/off の boolean なので、off に戻す＝入力を取り消したということ。
 * 数値 0 は入力された値なので記録済み扱い。
 */
export function isUnrecorded(value: unknown) {
  if (value === null || value === undefined || value === false) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * 項目ごとの入力時刻テーブルを更新する。
 * 値が入っていれば時刻を打ち、入力を消して未記録に戻したらその項目の時刻も消す
 * （RecordTimestamp は timestamp が無いと何も描かないので、表示ごと消える）。
 *
 * `time` を渡すと「実施者名 + 時刻」のように独自書式の文字列も入れられる。
 */
export function stampTimestamps<T extends Record<string, string>>(
  prev: T,
  field: string,
  value: unknown,
  time: string = recordTimestamp()
): T {
  if (isUnrecorded(value)) {
    if (!(field in prev)) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
  }
  return { ...prev, [field]: time };
}

/**
 * 単独で持っている入力時刻（項目ごとに useState している画面向け）。
 * 未記録に戻したら undefined を返し、表示を消す。
 */
export function stampValue(value: unknown, time: string = recordTimestamp()) {
  return isUnrecorded(value) ? undefined : time;
}

/**
 * すでに記録済みのデータ（モックや確認待ちの記録）に後付けする入力時刻。
 * 過去に入力されたものなので、その記録の実施日から "YYYY/MM/DD HH:mm" を組み立てる。
 * 項目ごとの時刻はモックに無いので一律の時刻を使う。
 * 実施日が無い＝まだ記録が無いので空文字を返し、RecordTimestamp 側で表示ごと消える。
 */
export function seedTimestamp(date: string | undefined, time = "09:00") {
  const day = (date ?? "").trim();
  if (!day) return "";
  return `${day.replaceAll("-", "/")} ${time}`;
}

/**
 * 値が入っている項目にだけ入力時刻を付けたテーブルを作る。
 * 「記録がある項目には出す・記録が無い項目には出さない」の判定を 1 か所にまとめたもの。
 */
export function seedTimestamps(values: Record<string, unknown>, time: string): Record<string, string> {
  if (!time) return {};
  return Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => !isUnrecorded(value))
      .map(([field]) => [field, time])
  );
}

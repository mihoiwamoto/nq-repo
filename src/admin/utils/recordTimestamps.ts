/**
 * 管理画面の詳細画面に出す「実施者 + 入力時刻」まわり。
 *
 * 現場アプリの記録画面は、入力した項目ごとに時刻を打っている
 * （`src/app/utils/recordTimestamps.ts`）。管理画面の詳細画面は同じ記録を見る画面なので、
 * アプリで記録した項目には同じスタンプが出ていないといけない。
 *
 * ただし管理画面のモックには項目ごとの時刻が入っていないので、記録の実施日から
 * 組み立てて持たせる（実データが来たら、この seed を実際の入力時刻に差し替える）。
 */

/** "2025-04-01" / "2025/04/01" → "2025/04/01 09:00"。日付が無ければ空文字（＝出さない） */
export function seedTimestamp(date?: string, time = "09:00"): string {
  if (!date) return "";
  return `${date.replaceAll("-", "/")} ${time}`;
}

/**
 * 上から順に入力していったことにして、少しずつずらした時刻を返す。
 * 同じ記録の中の項目が全部まったく同じ時刻だと、かえって不自然なため。
 */
export function stepTimestamps(
  date: string | undefined,
  count: number,
  { start = "09:00", stepMinutes = 5 }: { start?: string; stepMinutes?: number } = {},
): string[] {
  if (!date) return Array.from({ length: count }, () => "");
  const [h, m] = start.split(":").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const total = h * 60 + m + i * stepMinutes;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return seedTimestamp(date, `${hh}:${mm}`);
  });
}

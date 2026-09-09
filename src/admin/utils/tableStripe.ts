/**
 * 一覧テーブルの行背景を、行インデックスではなく日付が変わるたびに
 * 白 / 薄緑で交互に切り替えるためのクラス列を返す。
 * 同じ日付の行はまとめて同じ背景色になる。
 */
export function getDateStripeClasses<T>(rows: readonly T[], getDate: (row: T) => string): string[] {
  let groupIndex = -1;
  let prevDate: string | undefined;
  return rows.map((row) => {
    const date = getDate(row);
    if (date !== prevDate) {
      groupIndex += 1;
      prevDate = date;
    }
    return groupIndex % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white";
  });
}

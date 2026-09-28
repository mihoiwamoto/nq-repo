/**
 * 記録項目の下に「実施者 + 入力時刻」を右寄せで添える小さな表示。
 * アプリの記録画面（使用水・金属探知機など）で見た目をそろえるために使う。
 * timestamp が無いうち（＝まだ入力していない項目）は何も出さない。
 */
export function RecordTimestamp({
  inspector,
  timestamp,
}: {
  inspector?: string;
  timestamp?: string;
}) {
  if (!timestamp) return null;
  return (
    <p className="text-sm font-normal text-[var(--semantic-text-secondary)] text-right w-full">
      {inspector ? `${inspector} ${timestamp}` : timestamp}
    </p>
  );
}

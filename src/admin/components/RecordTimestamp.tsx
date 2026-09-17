/**
 * 詳細画面で、記録した項目の下に出す「実施者 + 入力時刻」。
 *
 * 現場アプリが項目ごとに打った時刻を、管理画面の詳細画面でもそのまま見せるためのもの。
 * 見た目は先にこの形で入っていた金属/X線・使用水の詳細画面に合わせている。
 * `timestamp` が空なら何も描かない（未入力の項目にはスタンプを出さない）。
 */
export function RecordTimestamp({
  inspector,
  timestamp,
  className = "",
}: {
  inspector?: string;
  timestamp?: string;
  className?: string;
}) {
  if (!timestamp) return null;
  return (
    <p
      className={`text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal ${className}`}
    >
      {[inspector, timestamp].filter(Boolean).join(" ")}
    </p>
  );
}

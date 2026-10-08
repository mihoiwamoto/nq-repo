/**
 * 管理画面の一覧・表で、データが 1 件も無いときの表示。
 *
 * 確定デザイン（Ver.4.0 の 7873:55998。本番 stg のデータ検索 › データ一覧と同じ）に合わせた
 * 白い帯（角丸 8・上下 24／左右 8）に「データがありません。」を 18px の太字で中央に出す（2026-10-08）。
 * 表の見出しのすぐ下に置くときは、見出しとの間を 8px あける（className に "mt-2"。ユーザー指定）。
 */
export function AdminEmptyState({ className = "" }: { className?: string }) {
  return (
    <div
      data-nq-part="empty"
      className={`bg-white flex items-center justify-center px-2 py-6 rounded-lg w-full ${className}`}
    >
      <p className="text-lg leading-7 text-center text-black">データがありません。</p>
    </div>
  );
}

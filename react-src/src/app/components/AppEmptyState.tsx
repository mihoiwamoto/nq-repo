/**
 * アプリの帳票の一覧で、点検対象が 1 件も無いときの表示。
 *
 * 2026-10-07 から 3 パターン（文字だけ／説明文つき／白いカード）を試し、2026-10-08 に
 * 確定デザイン（Ver.4.0 の 8203:152445「進捗一覧_添加物管理表_データがない場合」）の
 * 白い帯に「データがありません。」の形に決めた。
 * 同じ日に、見た目を管理画面の AdminEmptyState（確定デザイン 7873:55998・本番のデータ一覧）と同じにした
 * （白い帯・角丸 8・上下 24／左右 8・18px の太字・黒で中央。ユーザー指定）。
 */
export function AppEmptyState() {
  return (
    <div
      data-nq-part="empty"
      className="bg-white flex items-center justify-center px-2 py-6 rounded-lg w-full"
    >
      <p className="text-lg leading-7 text-center text-black">データがありません。</p>
    </div>
  );
}

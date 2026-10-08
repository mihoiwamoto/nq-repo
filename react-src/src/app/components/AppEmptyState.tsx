/**
 * アプリの帳票の一覧で、点検対象が 1 件も無いときの表示。
 *
 * 2026-10-07 から 3 パターン（文字だけ／説明文つき／白いカード）を試し、2026-10-08 に
 * 確定デザイン（Ver.4.0 の 8203:152445「進捗一覧_添加物管理表_データがない場合」）の
 * 白い帯に「データがありません。」の形に決めた（幅いっぱい・高さ 68・角丸 8・文字 14px で中央）。
 */
export function AppEmptyState() {
  return (
    <div
      data-nq-part="empty"
      className="bg-white flex h-[68px] items-center justify-center rounded-lg w-full"
    >
      <p className="text-sm leading-5 text-center text-[var(--semantic-text-primary)]">データがありません。</p>
    </div>
  );
}

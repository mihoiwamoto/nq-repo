import type { ReactNode } from "react";

/**
 * 検体管理の画面上部に出る製品情報カード（製品名 / 賞味期限 / ロットNo.）。
 *
 * ロットNo. は管理画面で「記載する」と設定した製品だけに入る任意項目なので、
 * 値が無いときはその項目ごと出さない（賞味期限だけが並ぶ従来の見た目になる）。
 * 点検・確認・保管検体・確認待ちで同じ並びにするためここに共通化している。
 *
 * `trailing` は右端に置く要素（保管検体の「破棄対象」ラベルなど）。
 */
export function SampleProductInfo({
  productName,
  expiryDate,
  lotNumber,
  trailing,
}: {
  productName: string;
  expiryDate: string;
  lotNumber?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="bg-white flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
      <div className="flex-1 flex flex-wrap gap-x-10 gap-y-2 items-center min-w-0">
        <div className="flex gap-2 items-center w-full">
          <span className="text-base text-[var(--semantic-text-secondary)]">製品名</span>
          <span className="text-base text-[var(--semantic-text-primary)]">{productName}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
          <span className="text-base text-[var(--semantic-text-primary)]">
            {expiryDate.replaceAll("-", "/")}
          </span>
        </div>
        {lotNumber && (
          <div className="flex gap-2 items-center">
            <span className="text-base text-[var(--semantic-text-secondary)]">ロットNo.</span>
            <span className="text-base text-[var(--semantic-text-primary)]">{lotNumber}</span>
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}

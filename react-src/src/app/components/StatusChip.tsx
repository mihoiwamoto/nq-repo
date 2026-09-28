import type { ReactNode } from "react";

/**
 * 一覧行の右端に出すステータスチップ（未点検 / 点検中 / 点検済み / 確認完了 / 差し戻し など）。
 * 大きさは「確認待ち」一覧のチップ（高さ 32px・幅 80px・14px 文字）を基準にしており、
 * 帳票ごとにサイズがばらつかないよう、一覧のステータス表示はすべてこれを使うこと。
 */
export function StatusChip({ color, children, className = "" }: { color: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={`flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0 ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

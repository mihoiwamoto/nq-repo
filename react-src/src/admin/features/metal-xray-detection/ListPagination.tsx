import { useState } from "react";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

/**
 * 一覧のページ送り（2026-10-08。金属/X線探知機記録・保管場所管理で共通）。
 * 本番：1 ページ 10 件（AppConst::LIST_MAX_LENGTH = 10、各 Repository の paginate）。
 * 形は vendor/pagination/tailwind.blade.php：左の矢印は 1 ページ目へ（$paginator->url(1)）、右の矢印は最後のページへ（url(lastPage)）、
 * 間にページ番号。Laravel の既定（onEachSide 3）でページが 14 以上のときは前後を省くが、「…」の札は出さない（blade が文字の要素を飛ばす）。
 * 本番はページが 1 つだけなら出さない（hasPages()）。確定デザインで 1 ページでも出す画面（保管場所管理）は alwaysShow。
 */
export const LIST_PAGE_SIZE = 10;

export function usePagedList<T>(items: T[], pageSize = LIST_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const pageItems = items.slice(offset, offset + pageSize);
  return { page: currentPage, setPage, totalPages, pageItems, offset };
}

function pageNumbers(current: number, last: number): number[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (last < 14) return range(1, last);
  if (current <= 7) return [...range(1, 10), last - 1, last];
  if (current > last - 7) return [1, 2, ...range(last - 9, last)];
  return [1, 2, ...range(current - 3, current + 3), last - 1, last];
}

function Arrow({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-4 shrink-0"
      style={{
        WebkitMaskImage: `url("${icon}")`,
        maskImage: `url("${icon}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        backgroundColor: "var(--semantic-text-primary)",
      }}
    />
  );
}

export function ListPagination({
  currentPage,
  totalPages,
  onChange,
  alwaysShow = false,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  alwaysShow?: boolean;
}) {
  if (totalPages <= 1 && !alwaysShow) return null;
  return (
    <nav aria-label="ページ送り" data-nq-part="pagination" className="flex gap-2 items-center">
      <button
        type="button"
        aria-label="最初のページ"
        onClick={() => onChange(1)}
        disabled={currentPage === 1}
        className="bg-white size-8 rounded-lg flex items-center justify-center disabled:opacity-40"
      >
        <Arrow icon={iconArrowLeft} />
      </button>
      {pageNumbers(currentPage, totalPages).map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          aria-current={num === currentPage ? "page" : undefined}
          className={`size-8 rounded-lg flex items-center justify-center text-sm font-normal ${
            num === currentPage
              ? "bg-[var(--semantic-brand-primary)] text-white"
              : "bg-white text-[var(--semantic-text-primary)]"
          }`}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        aria-label="最後のページ"
        onClick={() => onChange(totalPages)}
        disabled={currentPage === totalPages}
        className="bg-white size-8 rounded-lg flex items-center justify-center disabled:opacity-40"
      >
        <Arrow icon={iconArrowRight} />
      </button>
    </nav>
  );
}

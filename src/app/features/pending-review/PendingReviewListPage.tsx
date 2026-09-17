import { useState } from "react";
import { Link } from "react-router-dom";
import iconXMarkGreen from "../../../assets/figma/icons/common/cancel-green.svg";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import iconSearch from "../../../assets/figma/icons/common/search.svg";
import { AppHeader } from "../../layout/AppHeader";
import { PENDING_REVIEWS } from "../../data/pendingReviews";
import { ledgerCategories } from "../../../data/ledgers";
import { StatusChip } from "../../components/StatusChip";
import { useDemoList } from "../../../components/demo/demoStore";

const FILTER_LEDGERS = ledgerCategories.filter(
  (c) => c.slug !== "chemical-management" && c.slug !== "additive-management"
);

function ledgerFor(slug: string) {
  return ledgerCategories.find((c) => c.slug === slug);
}

function groupByDate(reviews: typeof PENDING_REVIEWS) {
  const groups: { date: string; items: typeof PENDING_REVIEWS }[] = [];
  for (const review of reviews) {
    const group = groups.find((g) => g.date === review.date);
    if (group) {
      group.items.push(review);
    } else {
      groups.push({ date: review.date, items: [review] });
    }
  }
  return groups;
}

export function PendingReviewListPage() {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());

  // 動作デモの「データが無い」を試している間は、確認待ちが 1 件も無い状態にする
  const reviews = useDemoList(PENDING_REVIEWS);

  const filtered = reviews.filter(
    (review) => appliedFilters.size === 0 || appliedFilters.has(review.ledgerSlug)
  );
  const groups = groupByDate(filtered);

  function openFilterDialog() {
    setPickerSelected(new Set(appliedFilters));
    setFilterDialogOpen(true);
  }

  function toggleFilterLedger(slug: string) {
    setPickerSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function applyFilters() {
    setAppliedFilters(new Set(pickerSelected));
    setFilterDialogOpen(false);
  }

  function removeFilter(slug: string) {
    setAppliedFilters((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }

  return (
    <div className="flex flex-col h-full min-w-0">
      <AppHeader title="確認待ち" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg shrink-0">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            こちらは確認者専用の画面になります。実施者の方は操作不要です。
          </p>
        </div>

        <button
          type="button"
          onClick={openFilterDialog}
          className="bg-white flex gap-2 items-center justify-center p-4 rounded-lg shrink-0 text-base text-[var(--semantic-brand-primary)]"
        >
          絞り込み検索
          <span
            aria-hidden
            className="inline-block size-5 shrink-0"
            style={{
              WebkitMaskImage: `url("${iconSearch}")`,
              maskImage: `url("${iconSearch}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              backgroundColor: "currentColor",
            }}
          />
        </button>

        {appliedFilters.size > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-[var(--semantic-text-secondary)] shrink-0">絞り込み条件</span>
            {Array.from(appliedFilters).map((slug) => {
              const ledger = ledgerFor(slug);
              if (!ledger) return null;
              return (
                <span
                  key={slug}
                  className="bg-white border border-[#d0d0d0] h-10 rounded-lg flex items-center gap-2 px-3"
                >
                  <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />
                  <span className="text-sm text-[var(--semantic-text-primary)]">{ledger.appLabel}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(slug)}
                    className="text-[var(--semantic-brand-primary)] text-sm"
                  >
                    <img src={iconXMarkGreen} alt="削除" className="size-4" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {groups.length === 0 ? (
          <p className="text-base text-[var(--semantic-text-secondary)] text-center py-6">
            {reviews.length === 0
              ? "確認待ちの記録はまだありません"
              : "該当する確認待ちはありません"}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <div key={group.date} className="flex flex-col gap-4">
                <div className="border-b border-[#d0d0d0] py-4">
                  <p className="text-xl text-[var(--semantic-text-primary)]">{group.date}</p>
                </div>
                {group.items.map((review) => {
                  const ledger = ledgerCategories.find((c) => c.slug === review.ledgerSlug);
                  return (
                    <Link
                      key={review.id}
                      to={`/app/pending-review/${review.id}`}
                      className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex items-center gap-2 p-4"
                    >
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <p className="text-lg text-[var(--semantic-text-primary)]">{review.name}</p>
                        <div className="flex gap-1 items-center">
                          {ledger && (
                            <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />
                          )}
                          <p className="text-sm text-[var(--semantic-brand-primary)]">
                            {ledger?.appLabel ?? review.ledgerSlug}
                          </p>
                        </div>
                      </div>
                      <StatusChip
                        color={
                          review.status === "差し戻し"
                            ? "var(--semantic-brand-danger)"
                            : "var(--semantic-status-caution)"
                        }
                      >
                        {review.status}
                      </StatusChip>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {filterDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[90vw] h-[754px] max-h-[90vh]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">絞り込み条件</h2>
            <div className="grid grid-cols-3 gap-6 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
              {FILTER_LEDGERS.map((ledger) => {
                const selected = pickerSelected.has(ledger.slug);
                return (
                  <button
                    key={ledger.slug}
                    type="button"
                    onClick={() => toggleFilterLedger(ledger.slug)}
                    className={`flex flex-col items-center justify-center gap-2 h-28 rounded-lg shadow-[0px_2px_3px_rgba(51,51,51,0.24)] border-2 ${
                      selected ? "bg-white border-[var(--semantic-brand-primary)]" : "bg-white border-transparent"
                    }`}
                  >
                    <img src={ledger.appIcon} alt="" className="size-10" />
                    <span className="text-base text-[var(--semantic-text-primary)] text-center px-1">
                      {ledger.appLabel}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setFilterDialogOpen(false)}
                className="bg-white border-2 border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-lg text-[var(--semantic-text-primary)] font-semibold"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-lg text-white font-semibold"
              >
                絞り込み
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

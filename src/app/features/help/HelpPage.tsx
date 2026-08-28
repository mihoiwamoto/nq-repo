import { useMemo, useState } from "react";
import { AppHeader } from "../../layout/AppHeader";
import { HELP_CATEGORIES, HELP_FAQS } from "../../../admin/features/help/mockData";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

export function HelpPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const isFiltering = Boolean(appliedKeyword) || Boolean(selectedCategoryId);
  const selectedCategory = HELP_CATEGORIES.find((c) => c.id === selectedCategoryId);

  const filteredFaqs = useMemo(
    () =>
      HELP_FAQS.filter((faq) => {
        if (selectedCategoryId && faq.categoryId !== selectedCategoryId) return false;
        if (
          appliedKeyword &&
          !faq.question.includes(appliedKeyword) &&
          !faq.answer.includes(appliedKeyword)
        )
          return false;
        return true;
      }),
    [selectedCategoryId, appliedKeyword]
  );

  function toggleFaq(id: string) {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSearch() {
    setSelectedCategoryId("");
    setAppliedKeyword(keywordInput);
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setKeywordInput("");
    setAppliedKeyword("");
  }

  function clearFilters() {
    setSelectedCategoryId("");
    setKeywordInput("");
    setAppliedKeyword("");
  }

  return (
    <>
      <AppHeader
        title="ヘルプ"
        action={
          <button
            type="button"
            onClick={clearFilters}
            className="bg-white border border-[var(--semantic-brand-primary)] drop-shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg text-sm text-[var(--semantic-brand-primary)] shrink-0"
          >
            更新
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-10">
        {isFiltering && (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={clearFilters}
              className="text-[var(--semantic-brand-primary)]"
            >
              ヘルプTOP
            </button>
            {selectedCategory && (
              <>
                <span
                  aria-hidden
                  className="inline-block size-3 shrink-0 text-[var(--semantic-text-secondary)]"
                  style={{
                    WebkitMaskImage: `url("${iconArrowRight}")`,
                    maskImage: `url("${iconArrowRight}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "currentColor",
                  }}
                />
                <span className="text-[var(--semantic-text-primary)]">{selectedCategory.label}</span>
              </>
            )}
            {appliedKeyword && (
              <>
                <span
                  aria-hidden
                  className="inline-block size-3 shrink-0 text-[var(--semantic-text-secondary)]"
                  style={{
                    WebkitMaskImage: `url("${iconArrowRight}")`,
                    maskImage: `url("${iconArrowRight}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "currentColor",
                  }}
                />
                <span className="text-[var(--semantic-text-primary)]">検索結果一覧</span>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">どんなことにお困りですか？</p>
          <div className="bg-white flex items-center justify-between gap-6 p-4 rounded-lg w-full">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="キーワードで探す"
              className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-lg text-[var(--semantic-text-primary)] flex-1 max-w-[300px] placeholder:text-[var(--semantic-text-secondary)]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[var(--semantic-brand-primary)] drop-shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-base text-white shrink-0"
            >
              🔍 検索
            </button>
          </div>
        </div>

        {!isFiltering && (
          <div className="flex flex-col gap-4 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">カテゴリから探す</p>
            <div className="flex flex-wrap gap-4 w-full">
              {HELP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.id)}
                  className="bg-white flex-1 min-w-[300px] h-[100px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)] text-left"
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">
            {isFiltering ? `検索結果：${filteredFaqs.length}件見つかりました` : "よくあるご質問"}
          </p>
          <div className="flex flex-col gap-4 items-start w-full">
            {filteredFaqs.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                該当する質問が見つかりませんでした
              </p>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.has(faq.id);
                return (
                  <div key={faq.id} className="bg-white rounded-lg overflow-hidden w-full">
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="flex items-center justify-between gap-2 p-4 w-full text-left"
                    >
                      <span className="flex-1 flex items-start gap-2 min-w-0">
                        <span className="text-[var(--semantic-brand-primary)] text-lg font-bold shrink-0">
                          Q.
                        </span>
                        <span className="text-lg text-[var(--semantic-text-primary)]">{faq.question}</span>
                      </span>
                      <span className="text-[var(--semantic-brand-primary)] text-2xl shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="bg-[#f8f8f8] flex gap-2 items-start px-4 pt-2 pb-6">
                        <span className="text-[var(--semantic-text-secondary)] text-lg font-bold shrink-0">
                          A.
                        </span>
                        <p className="flex-1 text-base text-[var(--semantic-text-primary)] leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useMemo, useState } from "react";
import { PageTitleBar } from "../../components/PageTitleBar";
import { HelpAccordion } from "./HelpAccordion";
import { HELP_CATEGORIES, HELP_FAQS } from "./mockData";

export function HelpPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const isFiltering = Boolean(appliedKeyword) || Boolean(selectedCategoryId);

  const filteredFaqs = useMemo(
    () =>
      HELP_FAQS.filter((faq) => {
        if (selectedCategoryId && faq.categoryId !== selectedCategoryId) return false;
        if (appliedKeyword && !faq.question.includes(appliedKeyword) && !faq.answer.includes(appliedKeyword))
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
    setAppliedKeyword(keywordInput);
    setSelectedCategoryId("");
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setKeywordInput("");
    setAppliedKeyword("");
  }

  return (
    <div>
      <PageTitleBar title="ヘルプ" />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-2 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)]">どんなことにお困りですか？</h2>
          <div className="bg-white flex gap-6 items-center justify-end p-4 rounded-lg w-full">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="キーワードで探す"
              className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] flex-1 max-w-[300px] placeholder:text-[#808080]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg text-base text-white"
            >
              検索
            </button>
          </div>
        </div>

        {!isFiltering && (
          <div className="flex flex-col gap-2 items-start w-full">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">カテゴリから探す</h2>
            <div className="flex flex-wrap gap-6">
              {HELP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.id)}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)]">
            {isFiltering ? `検索結果：${filteredFaqs.length}件見つかりました` : "よくあるご質問"}
          </h2>
          <div className="flex flex-col gap-4 items-start w-full">
            {filteredFaqs.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                該当する質問が見つかりませんでした
              </p>
            ) : (
              filteredFaqs.map((faq) => (
                <HelpAccordion
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqIds.has(faq.id)}
                  onToggle={() => toggleFaq(faq.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

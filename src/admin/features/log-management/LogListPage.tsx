import { useMemo, useState } from "react";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES, getFactoryName } from "../../../data/factories";
import { ledgerCategories } from "../../../data/ledgers";
import { LOG_ENTRIES } from "./mockData";
import { SCREEN_TYPE_LABELS, SCREEN_TYPE_OPTIONS, type LogScreenType } from "./types";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

const PAGE_SIZE = 10;

type Filters = {
  dateFrom: string;
  dateTo: string;
  screenType: LogScreenType | "";
  factoryId: string;
  ledgerSlug: string;
  keyword: string;
};

const EMPTY_FILTERS: Filters = {
  dateFrom: "",
  dateTo: "",
  screenType: "",
  factoryId: "",
  ledgerSlug: "",
  keyword: "",
};

export function LogListPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      LOG_ENTRIES.filter((entry) => {
        const entryDate = entry.timestamp.slice(0, 10);
        if (applied.dateFrom && entryDate < applied.dateFrom) return false;
        if (applied.dateTo && entryDate > applied.dateTo) return false;
        if (applied.screenType && entry.screenType !== applied.screenType) return false;
        if (applied.factoryId && entry.factoryId !== applied.factoryId) return false;
        if (applied.ledgerSlug && entry.ledgerSlug !== applied.ledgerSlug) return false;
        if (
          applied.keyword &&
          !entry.action.includes(applied.keyword) &&
          !entry.staffName.includes(applied.keyword)
        )
          return false;
        return true;
      }),
    [applied]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch() {
    setApplied(form);
    setPage(1);
  }

  function handleReset() {
    setForm(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <div>
      <PageTitleBar title="ログ管理" />
      <div className="flex flex-col gap-6 items-end p-6">
        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
          </button>
          {filterOpen && (
            <div className="flex gap-4 items-center justify-end w-full flex-wrap">
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={form.dateFrom}
                  onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                />
                <span className="text-[var(--semantic-text-primary)]">〜</span>
                <input
                  type="date"
                  value={form.dateTo}
                  onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
                  className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                />
              </div>
              <Pulldown
                value={form.screenType}
                onChange={(value) => setForm((f) => ({ ...f, screenType: value as LogScreenType | "" }))}
                options={SCREEN_TYPE_OPTIONS.map((option) => ({ value: option, label: SCREEN_TYPE_LABELS[option] }))}
                placeholder="種別"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px]"
              />
              <Pulldown
                value={form.factoryId}
                onChange={(value) => setForm((f) => ({ ...f, factoryId: value }))}
                options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
                placeholder="工場選択"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[240px]"
              />
              <Pulldown
                value={form.ledgerSlug}
                onChange={(value) => setForm((f) => ({ ...f, ledgerSlug: value }))}
                options={ledgerCategories.map((category) => ({ value: category.slug, label: category.adminLabel }))}
                placeholder="帳票選択"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[240px]"
              />
              <input
                type="text"
                value={form.keyword}
                onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                placeholder="キーワードで探す"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[300px] placeholder:text-[#808080]"
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-[#808080] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg text-sm text-[#808080]"
                >
                  リセット
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg text-base text-white"
                >
                  検索
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start w-full rounded-lg overflow-hidden">
          <div className="bg-[#f6f6f6] flex h-10 items-center w-full">
            <div className="w-[186px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">記録日時</p>
            </div>
            <div className="w-32 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">画面種別</p>
            </div>
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">工場名</p>
            </div>
            <div className="w-40 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">職員名</p>
            </div>
            <div className="w-20 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">権限</p>
            </div>
            <div className="flex-[1.5] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">操作内容</p>
            </div>
          </div>
          {pageItems.length === 0 ? (
            <div className="bg-white flex h-14 items-center w-full px-2">
              <p className="text-sm text-[var(--semantic-text-secondary)]">該当するログがありません</p>
            </div>
          ) : (
            pageItems.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex h-14 items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="w-[186px] h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {entry.timestamp.replaceAll("-", "/")}
                  </p>
                </div>
                <div className="w-32 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {SCREEN_TYPE_LABELS[entry.screenType]}
                  </p>
                </div>
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {getFactoryName(entry.factoryId)}
                  </p>
                </div>
                <div className="w-40 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">{entry.staffName}</p>
                </div>
                <div className="w-20 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">{entry.role}</p>
                </div>
                <div className="flex-[1.5] h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">{entry.action}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-white size-8 rounded-lg flex items-center justify-center text-[var(--semantic-text-primary)] disabled:opacity-40"
            >
              <span
                aria-hidden
                className="inline-block size-4 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowLeft}")`,
                  maskImage: `url("${iconArrowLeft}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`size-8 rounded-lg flex items-center justify-center text-sm ${
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-white size-8 rounded-lg flex items-center justify-center text-[var(--semantic-text-primary)] disabled:opacity-40"
            >
              <span
                aria-hidden
                className="inline-block size-4 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowRight}")`,
                  maskImage: `url("${iconArrowRight}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

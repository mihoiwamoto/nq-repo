import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useCompanyManagement } from "./CompanyManagementContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

const PAGE_SIZE = 10;

export function CompanyListPage() {
  const { companies } = useCompanyManagement();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => companies.filter((company) => company.name.includes(appliedSearch)),
    [companies, appliedSearch]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch() {
    setAppliedSearch(searchInput);
    setPage(1);
  }

  function handleReset() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }

  return (
    <div>
      <PageTitleBar
        title="企業管理"
        action={
          <Link
            to="new"
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
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
            <div className="flex gap-6 items-center justify-end w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="企業名で探す"
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
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">企業名</p>
            </div>
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">住所</p>
            </div>
            <div className="w-[120px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">操作</p>
            </div>
          </div>
          {pageItems.length === 0 ? (
            <div className="bg-white flex h-14 items-center w-full px-2">
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                該当する企業がありません
              </p>
            </div>
          ) : (
            pageItems.map((company, index) => (
              <div
                key={company.id}
                className={`flex h-14 items-center w-full ${
                  index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"
                }`}
              >
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {company.name}
                  </p>
                </div>
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {company.address}
                  </p>
                </div>
                <div className="w-[120px] h-full flex items-center px-2">
                  <Link
                    to={company.id}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
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

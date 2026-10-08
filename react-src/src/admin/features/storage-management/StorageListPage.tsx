import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { storageOriginCrumbs, useStorageManagement } from "./StorageManagementContext";
import { useDemoList } from "../../../components/demo/demoStore";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

const PAGE_SIZE = 10;

/* ページ送り（確定デザイン 7139:162568。製品管理の一覧と同じ形。1 ページでも出す） */
function StoragePagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages: (number | string)[] =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, 4, 5, "..."];
  const arrow = (icon: string) => (
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
  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        aria-label="前のページ"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="bg-white size-8 rounded-lg flex items-center justify-center"
      >
        {arrow(iconArrowLeft)}
      </button>
      {pages.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => typeof num === "number" && onChange(num)}
          disabled={typeof num === "string"}
          className={`size-8 rounded-lg flex items-center justify-center text-sm ${
            num === currentPage
              ? "bg-[var(--semantic-brand-primary)] text-white"
              : "bg-white text-[var(--semantic-text-primary)]"
          } ${typeof num === "string" ? "cursor-default" : ""}`}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        aria-label="次のページ"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="bg-white size-8 rounded-lg flex items-center justify-center"
      >
        {arrow(iconArrowRight)}
      </button>
    </div>
  );
}

export function StorageListPage() {
  const { storageLocations: allLocations, origin } = useStorageManagement();
  const storageLocations = useDemoList(allLocations);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* 確定デザインの絞り込みは保管場所の名前だけ（工場のプルダウンは無い。2026-10-06） */
  const filtered = storageLocations.filter((location) => location.name.includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div>
      <PageTitleBar
        title="保管場所管理"
        showBack={Boolean(origin)}
        action={
          <Link
            to="new"
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      {/* 帳票管理 › 薬品管理／添加物管理 から入ったときだけ「←」とパンくずを出す（確定デザイン 7139:162568。サイドメニューからは 7139:163434 の形） */}
      {origin && (
        <Breadcrumb items={[...storageOriginCrumbs(origin), { label: "保管場所管理" }]} />
      )}
      <div className="flex flex-col gap-6 items-end p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
            >
              絞り込み検索 {filterOpen ? "−" : "+"}
            </button>
            {filterOpen && (
              <div className="flex gap-4 items-center w-full">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="保管場所で検索"
                  className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white border border-[var(--semantic-brand-primary)] h-10 px-6 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    リセット
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-[var(--semantic-brand-primary)] h-10 px-6 rounded-lg flex items-center justify-center gap-2 text-sm text-white"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    検索
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start w-full rounded-lg overflow-hidden">
            <div className="bg-[#f6f6f6] flex h-10 items-center w-full">
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  保管場所
                </p>
              </div>
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  工場
                </p>
              </div>
              <div className="w-[120px] h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  操作
                </p>
              </div>
            </div>
            {pageItems.length === 0 && (
              <div className="bg-white flex h-14 items-center w-full px-2">
                <p className="text-sm text-[var(--semantic-text-secondary)]">データがありません。</p>
              </div>
            )}
            {pageItems.map((location, index) => (
              <div
                key={location.id}
                className={`flex h-14 items-center w-full ${
                  index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"
                }`}
              >
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
                    {location.name}
                  </p>
                </div>
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
                    {getFactoryName(location.factoryId)}
                  </p>
                </div>
                <div className="w-[120px] h-full flex items-center px-2">
                  <Link
                    to={location.id}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <StoragePagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

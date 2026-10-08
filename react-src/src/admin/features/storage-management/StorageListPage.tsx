import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { FACTORIES, getFactoryName } from "../../../data/factories";
import { Pulldown } from "../../components/Pulldown";
import { storageOriginCrumbs, useStorageManagement } from "./StorageManagementContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { ListPagination, usePagedList } from "../metal-xray-detection/ListPagination";
import { FilterToggleLabel } from "../../components/FilterToggleLabel";
import { PlusIcon } from "../../components/PlusIcon";
import { AdminEmptyState } from "../../components/AdminEmptyState";

export function StorageListPage() {
  const { storageLocations: allLocations, origin } = useStorageManagement();
  const storageLocations = useDemoList(allLocations);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [factoryInput, setFactoryInput] = useState("");
  const [factory, setFactory] = useState("");

  /* 絞り込みは 保管場所の名前 と 工場選択（本番どおり全工場から選ぶ。確定デザイン 9310:36292。2026-10-08） */
  const filtered = storageLocations.filter(
    (location) => location.name.includes(search) && (!factory || location.factoryId === factory)
  );
  // 本番どおり 10 件ずつ（AppConst::LIST_MAX_LENGTH）
  const { page: currentPage, setPage, totalPages, pageItems } = usePagedList(filtered);

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setFactoryInput("");
    setFactory("");
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setFactory(factoryInput);
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
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            <PlusIcon />
            新規登録
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
              className="flex gap-2 items-center h-5 text-base text-[var(--semantic-brand-primary)]"
            >
              <FilterToggleLabel open={filterOpen} />
            </button>
            {filterOpen && (
              <div className="flex gap-4 items-center w-full">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="保管場所で検索"
                  className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <Pulldown
                  value={factoryInput}
                  onChange={setFactoryInput}
                  options={FACTORIES.map((f) => ({ value: f.id, label: f.name }))}
                  placeholder="工場選択"
                  className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] w-[240px]"
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
              <AdminEmptyState className="mt-2" />
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
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 確定デザイン 7139:163434：表からページ送りまで 16px（外の並びは 24px なので 8px 詰める。2026-10-08） */}
        <div className="-mt-2">
          {/* 確定デザイン 7139:162568 は 1 ページでも出す */}
          <ListPagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} alwaysShow />
        </div>
      </div>
    </div>
  );
}

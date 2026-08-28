import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES, getFactoryName } from "../../../data/factories";
import { HOST_PRODUCTS } from "../../../data/products";
import { useProductManagement } from "./ProductManagementContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

const PAGE_SIZE = 10;

type Tab = "host" | "nq";

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onChange(num)}
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
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
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
  );
}

export function ProductListPage() {
  const { nqProducts } = useProductManagement();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: Tab = searchParams.get("tab") === "nq" ? "nq" : "host";

  const [filterOpen, setFilterOpen] = useState(true);
  const [keywordInput, setKeywordInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [factoryInput, setFactoryInput] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ keyword: "", code: "", factoryId: "" });
  const [page, setPage] = useState(1);

  function setActiveTab(tab: Tab) {
    setSearchParams(tab === "host" ? {} : { tab });
    setKeywordInput("");
    setCodeInput("");
    setFactoryInput("");
    setAppliedFilters({ keyword: "", code: "", factoryId: "" });
    setPage(1);
  }

  function handleSearch() {
    setAppliedFilters({ keyword: keywordInput, code: codeInput, factoryId: factoryInput });
    setPage(1);
  }

  function handleReset() {
    setKeywordInput("");
    setCodeInput("");
    setFactoryInput("");
    setAppliedFilters({ keyword: "", code: "", factoryId: "" });
    setPage(1);
  }

  const filteredHost = useMemo(
    () =>
      HOST_PRODUCTS.filter((product) => {
        if (appliedFilters.keyword && !product.name.includes(appliedFilters.keyword)) return false;
        if (appliedFilters.code && !product.productCode.includes(appliedFilters.code)) return false;
        if (appliedFilters.factoryId && product.factoryId !== appliedFilters.factoryId) return false;
        return true;
      }),
    [appliedFilters]
  );

  const filteredNq = useMemo(
    () =>
      nqProducts.filter((product) => {
        if (appliedFilters.keyword && !product.name.includes(appliedFilters.keyword)) return false;
        if (appliedFilters.factoryId && product.factoryId !== appliedFilters.factoryId) return false;
        return true;
      }),
    [nqProducts, appliedFilters]
  );

  const filtered = activeTab === "host" ? filteredHost : filteredNq;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <PageTitleBar
        title="製品管理"
        action={
          activeTab === "nq" ? (
            <Link
              to="/admin/products/nq/new"
              className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
            >
              + 新規登録
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6 items-end p-6">
        <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
          {(
            [
              { tab: "host" as Tab, label: "基幹システム" },
              { tab: "nq" as Tab, label: "NQリポ" },
            ]
          ).map(({ tab, label }) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                  isActive
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
          </button>
          {filterOpen && (
            <div className="flex gap-6 items-center justify-end w-full flex-wrap">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="キーワード検索"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[300px] placeholder:text-[#808080]"
              />
              {activeTab === "host" && (
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="製品コード"
                  className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[300px] placeholder:text-[#808080]"
                />
              )}
              <Pulldown
                value={factoryInput}
                onChange={setFactoryInput}
                options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
                placeholder="工場を選択する"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[240px]"
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
            <div className="w-[104px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">操作</p>
            </div>
            {activeTab === "host" && (
              <div className="w-[114px] h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">製品コード</p>
              </div>
            )}
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">製品名</p>
            </div>
            {activeTab === "host" && (
              <>
                <div className="w-20 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">内容量</p>
                </div>
                <div className="w-20 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">内容量単位</p>
                </div>
              </>
            )}
            <div className="w-[220px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">工場名</p>
            </div>
            <div className="w-[100px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">賞味期限</p>
            </div>
          </div>
          {pageItems.length === 0 ? (
            <div className="bg-white flex h-14 items-center w-full px-2">
              <p className="text-sm text-[var(--semantic-text-secondary)]">該当する製品がありません</p>
            </div>
          ) : (
            pageItems.map((product, index) => (
              <div
                key={product.id}
                className={`flex h-14 items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="w-[104px] h-full flex items-center justify-center px-2">
                  <Link
                    to={activeTab === "host" ? `/admin/products/host/${product.id}` : `/admin/products/nq/${product.id}`}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
                {activeTab === "host" && "productCode" in product && (
                  <div className="w-[114px] h-full flex items-center px-2">
                    <p className="text-sm text-[var(--semantic-text-primary)] truncate">{product.productCode}</p>
                  </div>
                )}
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">{product.name}</p>
                </div>
                {activeTab === "host" && "quantity" in product && (
                  <>
                    <div className="w-20 h-full flex items-center px-2">
                      <p className="text-sm text-[var(--semantic-text-primary)] truncate">{product.quantity}</p>
                    </div>
                    <div className="w-20 h-full flex items-center px-2">
                      <p className="text-sm text-[var(--semantic-text-primary)] truncate">{product.quantityUnit}</p>
                    </div>
                  </>
                )}
                <div className="w-[220px] h-full flex items-center justify-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] text-center truncate">
                    {getFactoryName(product.factoryId)}
                  </p>
                </div>
                <div className="w-[100px] h-full flex items-center justify-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] text-center">{product.expiry}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

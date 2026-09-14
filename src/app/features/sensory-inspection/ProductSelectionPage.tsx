import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { ProductProgressPanel } from "./ProductProgressPanel";
import { ACTORS, CRITERIA, CRITERION_TAG_COLORS, PRODUCT_STATUS_COLORS, PRODUCT_STATUS_LABELS } from "./mockData";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import { StatusChip } from "../../components/StatusChip";

export function ProductSelectionPage() {
  const navigate = useNavigate();
  const { products } = useSensoryInspection();
  const [search, setSearch] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);

  const inspectedCount = products.filter((p) => p.status === "inspected").length;
  const inspectedProducts = products.filter((p) => p.status === "inspected");
  const filtered = products.filter((p) => p.name.includes(search));

  function handleProductClick(productId: string) {
    navigate(`/app/ledger-list/sensory-inspection/products/${productId}`, {
      state: { inspectorName: ACTORS[0].name },
    });
  }

  return (
    <>
      <AppHeader
        title="官能検査記録"
        action={
          <button
            type="button"
            onClick={() => setProgressOpen(true)}
            className="bg-[var(--semantic-brand-primary)] flex items-center rounded-lg overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0 mx-2 text-white"
              style={{
                WebkitMaskImage: `url("${iconArrowLeft}")`,
                maskImage: `url("${iconArrowLeft}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
            <span className="bg-white flex flex-col items-center justify-center gap-0 px-2 py-1">
              <span className="text-xs text-[var(--semantic-brand-primary)] font-semibold">点検済み</span>
              <span className="text-lg text-[var(--semantic-brand-primary)] leading-none font-bold">
                {inspectedCount}/{products.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-4 items-end w-full max-w-full">
          <div className="flex gap-4 items-start w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="商品名を入力"
              className="flex-1 bg-white border border-[#808080] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
            />
            <button
              type="button"
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              検索
            </button>
          </div>

          <div className="flex flex-col gap-6 items-start w-full">
            {filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                disabled={product.status !== "not_inspected"}
                onClick={() => handleProductClick(product.id)}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-6 h-20 items-center p-4 rounded-lg w-full text-left disabled:cursor-default"
              >
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <p className="text-lg text-[var(--semantic-text-primary)]">{product.name}</p>
                  <div className="flex gap-0.5 items-start">
                    {CRITERIA.map((criterion) => (
                      <span
                        key={criterion}
                        className="h-5 flex items-center justify-center px-1.5 rounded-full text-xs shrink-0"
                        style={{
                          backgroundColor: CRITERION_TAG_COLORS[criterion].bg,
                          color: CRITERION_TAG_COLORS[criterion].text,
                        }}
                      >
                        {criterion}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusChip color={PRODUCT_STATUS_COLORS[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</StatusChip>
              </button>
            ))}
          </div>
        </div>

        {/* 上の余白は親の gap(24px) + mt-4 = 40px */}
        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center mt-4 px-4 py-6 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressOpen && <ProductProgressPanel products={products} inspectedProducts={inspectedProducts} onClose={() => setProgressOpen(false)} />}
    </>
  );
}

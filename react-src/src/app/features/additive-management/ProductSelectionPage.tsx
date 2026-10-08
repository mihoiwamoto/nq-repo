import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, ADDITIVE_STATUS_LABELS, ADDITIVE_STATUS_COLORS } from "./mockData";
import { StatusChip } from "../../components/StatusChip";
import { AppEmptyState } from "../../components/AppEmptyState";

export function ProductSelectionPage() {
  const { additives } = useAdditiveManagement();
  const navigate = useNavigate();

  function navigateToProduct(productId: string) {
    navigate(`/app/ledger-list/additive-management/products/${productId}`, {
      state: { inspectorName: ACTORS[0].name },
    });
  }

  return (
    <>
      <AppHeader title="添加物管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full">
          {/* 点検対象が 1 件も無いとき（見せ方は AppEmptyState で 3 パターン試し中） */}
          {additives.length === 0 && <AppEmptyState />}
          {additives.map((additive) => (
            <button
              key={additive.id}
              type="button"
              onClick={() => navigateToProduct(additive.id)}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-6 h-20 items-center p-4 rounded-lg w-full text-left"
            >
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <p className="text-lg text-[var(--semantic-text-primary)]">{additive.name}</p>
              </div>
              {/* 薬品・添加物は毎日の点検ではないので「未点検」の札は出さない（確定デザイン 7139:234163・注記 7139:298922。2026-10-06） */}
              {additive.status !== "not_inspected" && (
                <StatusChip color={ADDITIVE_STATUS_COLORS[additive.status]}>{ADDITIVE_STATUS_LABELS[additive.status]}</StatusChip>
              )}
            </button>
          ))}
        </div>

        {/* 上の余白は親の gap(24px) + mt-4 = 40px */}
        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center mt-4 h-16 px-4 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>
    </>
  );
}

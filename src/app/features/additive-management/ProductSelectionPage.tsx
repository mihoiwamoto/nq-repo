import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, ADDITIVE_STATUS_LABELS, ADDITIVE_STATUS_COLORS } from "./mockData";

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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
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
              <span
                className="h-8 w-24 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
                style={{ backgroundColor: ADDITIVE_STATUS_COLORS[additive.status] }}
              >
                {ADDITIVE_STATUS_LABELS[additive.status]}
              </span>
            </button>
          ))}
        </div>

        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex h-16 items-center justify-center px-4 py-2 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>
    </>
  );
}

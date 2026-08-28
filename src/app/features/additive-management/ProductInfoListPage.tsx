import { Link, useLocation } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, ADDITIVE_STATUS_COLORS, ADDITIVE_STATUS_LABELS } from "./mockData";

export function ProductInfoListPage() {
  const { additives } = useAdditiveManagement();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;

  return (
    <>
      <AppHeader title="添加物管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {additives.map((additive) => (
            <Link
              key={additive.id}
              to={`/app/ledger-list/additive-management/products/${additive.id}`}
              state={{ inspectorName }}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
            >
              <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{additive.name}</p>
              {additive.status !== "not_inspected" && (
                <span
                  className="flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0"
                  style={{ backgroundColor: ADDITIVE_STATUS_COLORS[additive.status] }}
                >
                  {ADDITIVE_STATUS_LABELS[additive.status]}
                </span>
              )}
            </Link>
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

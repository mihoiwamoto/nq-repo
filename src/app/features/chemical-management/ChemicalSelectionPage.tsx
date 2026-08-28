import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { useLocation } from "react-router-dom";
import { CHEMICAL_STATUS_LABELS, CHEMICAL_STATUS_COLORS } from "./mockData";

export function ChemicalSelectionPage() {
  const { chemicals } = useChemicalManagement();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { inspectorName?: string } | null;
  const inspectorName = state?.inspectorName ?? "不明";

  function handleChemicalSelection(chemicalId: string) {
    navigate(`/app/ledger-list/chemical-management/${chemicalId}`, {
      state: { inspectorName },
    });
  }

  return (
    <>
      <AppHeader title="薬品管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {chemicals.map((chemical) => (
            <button
              key={chemical.id}
              type="button"
              onClick={() => handleChemicalSelection(chemical.id)}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-6 h-20 items-center p-4 rounded-lg w-full text-left"
            >
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <p className="text-lg text-[var(--semantic-text-primary)]">{chemical.name}</p>
              </div>
              <span
                className="h-8 w-24 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
                style={{ backgroundColor: CHEMICAL_STATUS_COLORS[chemical.status] }}
              >
                {CHEMICAL_STATUS_LABELS[chemical.status]}
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

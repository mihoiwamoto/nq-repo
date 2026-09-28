import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { useLocation } from "react-router-dom";
import { ACTORS, CHEMICAL_STATUS_LABELS, CHEMICAL_STATUS_COLORS } from "./mockData";
import { StatusChip } from "../../components/StatusChip";

export function ChemicalSelectionPage() {
  const { chemicals } = useChemicalManagement();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { inspectorName?: string } | null;
  // 帳票メニューから直接来たときは実施者が選ばれていないので、他の帳票と同じく先頭の実施者で補う
  // （"不明" のままだと記録のタイムスタンプに「不明 2026/09/11 12:53」と出てしまう）
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;

  function handleChemicalSelection(chemicalId: string) {
    navigate(`/app/ledger-list/chemical-management/${chemicalId}`, {
      state: { inspectorName },
    });
  }

  return (
    <>
      <AppHeader title="薬品管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full">
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
              <StatusChip color={CHEMICAL_STATUS_COLORS[chemical.status]}>{CHEMICAL_STATUS_LABELS[chemical.status]}</StatusChip>
            </button>
          ))}
        </div>

        {/* 上の余白は親の gap(24px) + mt-4 = 40px */}
        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center mt-4 px-4 py-6 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>
    </>
  );
}

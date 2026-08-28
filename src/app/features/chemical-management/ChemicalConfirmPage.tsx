import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { ACTORS } from "./mockData";

type ConfirmState = {
  chemicalId?: string;
  date: string;
  managementNumber: string;
  storageLocation: string;
  spec: string;
  currentQuantity: string;
  usedQuantity: string;
  purposeOfUse: string;
  inspectorName?: string;
};

const COLUMNS = [
  { key: "date", label: "実施日", width: 80 },
  { key: "managementNumber", label: "管理番号", width: 100 },
  { key: "storageLocation", label: "保管場所", width: 100 },
  { key: "usedQuantity", label: "使用数量", width: 80 },
  { key: "purposeOfUse", label: "使用目的", width: 150 },
  { key: "inspectorName", label: "実施者", width: 100 },
] as const;

export function ChemicalConfirmPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const navigate = useNavigate();
  const { chemicals, addRecord, updateChemicalStatus } = useChemicalManagement();
  const location = useLocation();
  const state = location.state as ConfirmState | null;

  const basePath = `/app/ledger-list/chemical-management`;
  const chemical = chemicals.find((c) => c.id === chemicalId);

  if (!state) {
    return (
      <>
        <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            入力内容が見つかりません。入力画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${chemicalId}`)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            入力画面に戻る
          </button>
        </div>
      </>
    );
  }

  function handleSubmit() {
    if (!state) return;
    const input = {
      chemicalId: chemicalId ?? state.chemicalId ?? "",
      date: state.date,
      managementNumber: state.managementNumber,
      storageLocation: state.storageLocation,
      usedQuantity: state.usedQuantity,
      purposeOfUse: state.purposeOfUse,
      actor: state.inspectorName ?? ACTORS[0].name,
    };
    addRecord(input);
    if (chemicalId) {
      updateChemicalStatus(chemicalId, "inspected");
    }
    navigate(`${basePath}/${chemicalId}/confirm/complete`);
  }

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full max-w-[480px] mx-40">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-[var(--semantic-brand-primary)]">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ minWidth: col.width }}
                    className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                  {state.date}
                </td>
                <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                  {state.managementNumber}
                </td>
                <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                  {state.storageLocation}
                </td>
                <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                  {state.usedQuantity}
                </td>
                <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">
                  {state.purposeOfUse}
                </td>
                <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                  {state.inspectorName}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { ACTORS } from "./mockData";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 168 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

export function ChemicalConfirmPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const navigate = useNavigate();
  const { chemicals, records, updateChemicalStatus } = useChemicalManagement();
  const location = useLocation();
  const state = location.state as { date?: string; inspectorName?: string } | null;
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;

  const basePath = `/app/ledger-list/chemical-management`;
  const chemical = chemicals.find((c) => c.id === chemicalId);
  const chemicalRecords = records.filter((record) => record.chemicalId === chemicalId);
  const displayDate = state?.date?.replaceAll("-", "/") ?? chemicalRecords[0]?.date ?? "";

  if (chemicalRecords.length === 0) {
    return (
      <>
        <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            提出できる記録がありません。記録を追加してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${chemicalId}`, { state: { inspectorName } })}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            入力画面に戻る
          </button>
        </div>
      </>
    );
  }

  function handleSubmit() {
    if (chemicalId) {
      updateChemicalStatus(chemicalId, "inspected");
    }
    navigate(`${basePath}/${chemicalId}/confirm/complete`, { state: { inspectorName } });
  }

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{displayDate}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full">
          <table className="border-collapse table-fixed w-full">
            <thead>
              <tr className="bg-[var(--semantic-brand-primary)] h-14">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.key === "remarks" ? "auto" : col.width }}
                    className="text-white text-sm font-semibold px-2 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chemicalRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={`h-12 ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <td className="px-2 py-2 text-center">
                    <Link
                      to={`${basePath}/${chemicalId}/records/${record.id}`}
                      className="bg-[var(--semantic-brand-primary)] h-8 w-14 rounded-lg text-xs text-white inline-flex items-center justify-center"
                    >
                      詳細
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.storageLocation}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.category}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.usedQuantity}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.currentStock}
                  </td>
                  <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">
                    {record.remarks}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                    {record.actor}
                  </td>
                </tr>
              ))}
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

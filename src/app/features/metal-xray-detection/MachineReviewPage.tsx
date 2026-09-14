import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import {
  MACHINES,
  MACHINE_INSPECTION_DATES,
  MACHINE_RECORDS,
  RESULT_COLORS,
  RESULT_LABELS,
} from "./mockData";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "category", label: "実施区分", width: 72 },
  { key: "time", label: "点検時間", width: 104 },
  { key: "content", label: "点検内容", width: 104 },
  { key: "passedProduct", label: "通過製品", width: 200 },
  { key: "result", label: "結果", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "inspectorName", label: "実施者", width: 112 },
] as const;

export function MachineReviewPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const machine = MACHINES.find((m) => m.id === machineId);
  const records = MACHINE_RECORDS[machineId ?? ""] ?? [];
  const inspectionDate = MACHINE_INSPECTION_DATES[machineId ?? ""] ?? "";
  const locked = (location.state as { locked?: boolean } | null)?.locked ?? false;

  if (!machine) return null;

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="flex justify-end w-full max-w-full">
          {!locked && (
            <Link
              to={`/app/ledger-list/metal-xray-detection/machines/${machineId}`}
              className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
            >
              <img src={iconEdit} alt="編集" className="size-5" />
              編集
            </Link>
          )}
        </div>

        <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full max-w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
          <p className="text-base text-[var(--semantic-text-primary)]">
            {inspectionDate ? inspectionDate.replaceAll("-", "/") : ""}
          </p>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full">
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
              {records.map((record, index) => (
                <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                  <td className="px-2 py-2 text-center">
                    <span className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white inline-flex items-center justify-center">
                      詳細
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.category}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.time}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {record.content}
                  </td>
                  <td
                    className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: 200 }}
                  >
                    {record.passedProduct}
                  </td>
                  <td className="px-2 py-2 text-center text-sm">
                    <span
                      className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
                      style={{ backgroundColor: RESULT_COLORS[record.result] }}
                    >
                      {RESULT_LABELS[record.result]}
                    </span>
                  </td>
                  <td
                    className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: 160 }}
                  >
                    {record.remarks}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                    {record.inspectorName}
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
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>
    </>
  );
}

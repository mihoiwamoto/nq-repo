import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { MACHINES, RESULT_COLORS, RESULT_LABELS, recordsForMachine, type MachineRecord } from "./mockData";
import type { EditReturn } from "./MachineDetailPage";

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

export function MachineConfirmPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    inspectionDate?: string;
    inspectorName?: string;
    hideAddButton?: boolean;
    fromProgress?: boolean;
    records?: MachineRecord[];
    /** 確認待ち（差し戻し）の「点検内容を修正する」から来たときの戻り先 */
    editReturn?: EditReturn;
  } | null;
  const inspectionDate = state?.inspectionDate ?? "";
  const hideAddButton = state?.hideAddButton ?? false;
  const machine = MACHINES.find((m) => m.id === machineId);
  // 点検画面から渡された記録をそのまま確認する。直接URLを開いたときだけモックを読む
  const records = state?.records ?? recordsForMachine(machineId);

  if (!machine) return null;

  const basePath = "/app/ledger-list/metal-xray-detection";
  const detailPath = `${basePath}/machines/${machineId}`;
  const completePath = `${basePath}/machines/${machineId}/complete`;

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
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
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`${basePath}/machines/${machineId}/confirm/${record.id}`, {
                          state: { inspectionDate, inspectorName: state?.inspectorName, fromProgress: state?.fromProgress },
                        })
                      }
                      className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white inline-flex items-center justify-center"
                    >
                      詳細
                    </button>
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
                    className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]"
                    style={{ maxWidth: 160 }}
                  >
                    <div className="flex flex-col gap-1">
                      {record.remarks && (
                        <p className="whitespace-nowrap overflow-hidden text-ellipsis">{record.remarks}</p>
                      )}
                      {record.result === "NG" && record.abnormalCauseNote && (
                        <p className="text-xs text-[var(--semantic-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">
                          原因: {record.abnormalCauseNote}
                        </p>
                      )}
                      {record.result === "NG" && record.abnormalActionNote && (
                        <p className="text-xs text-[var(--semantic-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">
                          対応: {record.abnormalActionNote}
                        </p>
                      )}
                    </div>
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
          onClick={() =>
            navigate(detailPath, {
              state: { inspectorName: state?.inspectorName, fromProgress: state?.fromProgress, editReturn: state?.editReturn },
            })
          }
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={() => navigate(completePath, { state: { fromProgress: state?.fromProgress, editReturn: state?.editReturn } })}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}

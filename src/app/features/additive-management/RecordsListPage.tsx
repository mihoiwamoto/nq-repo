import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS } from "./mockData";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

export function RecordsListPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const { additives, records } = useAdditiveManagement();

  const additive = additives.find((a) => a.id === productId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const additiveFill: RecordFill =
    additive?.status === "not_inspected" ? "none" : additive?.status === "in_progress" ? "partial" : "full";
  const fill = progressFill ?? additiveFill;
  const productRecords = fillSlice(
    records.filter((record) => record.additiveId === productId),
    fill,
  );
  const [date, setDate] = useState(
    () => productRecords[0]?.date.replaceAll("/", "-") ?? todayString(),
  );
  const hasRecords = productRecords.length > 0;
  const basePath = `/app/ledger-list/additive-management/products/${productId}`;

  return (
    <>
      <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <DateFilterInput value={date} onChange={setDate} />
        </div>

        <div className="bg-white rounded-lg overflow-x-auto">
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
              {!hasRecords ? (
                <tr>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="bg-white px-2 py-4" />
                  ))}
                </tr>
              ) : (
                productRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                    <td className="px-2 py-2 text-center">
                      <Link
                        to={`${basePath}/records/${record.id}`}
                        className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white inline-flex items-center justify-center"
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
                      {record.quantity}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.currentStock}
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">{record.remarks}</td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                      {record.actor}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Link
          to={`${basePath}/new`}
          state={{ date, inspectorName }}
          className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center gap-2 text-xl text-[var(--semantic-brand-primary)]"
        >
          <span className="text-2xl leading-none">＋</span>
          記録を追加
        </Link>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <Link
          to="/app/ledger-list/additive-management"
          state={{ inspectorName }}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </Link>
        {hasRecords ? (
          <Link
            to={`${basePath}/confirm`}
            state={{ date, inspectorName }}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            確認画面へ
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="bg-[#d0d0d0] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            確認画面へ
          </button>
        )}
      </div>
    </>
  );
}

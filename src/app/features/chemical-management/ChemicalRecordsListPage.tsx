import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
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

export function ChemicalRecordsListPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const location = useLocation();
  const state = location.state as { date?: string; inspectorName?: string } | null;
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;
  const { chemicals, records } = useChemicalManagement();

  const chemical = chemicals.find((c) => c.id === chemicalId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const chemicalFill: RecordFill =
    chemical?.status === "not_inspected" ? "none" : chemical?.status === "in_progress" ? "partial" : "full";
  const fill = progressFill ?? chemicalFill;
  const chemicalRecords = fillSlice(
    records.filter((record) => record.chemicalId === chemicalId),
    fill,
  );
  const [date, setDate] = useState(
    () => state?.date ?? chemicalRecords[0]?.date.replaceAll("/", "-") ?? todayString(),
  );
  const hasRecords = chemicalRecords.length > 0;
  const basePath = `/app/ledger-list/chemical-management/${chemicalId}`;

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4">
        <div className="flex h-12 items-center justify-between">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <DateFilterInput value={date} onChange={setDate} />
        </div>

        <div className="border-t border-[#d0d0d0] w-full" />

        <div className="bg-white rounded-lg overflow-x-auto">
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
              {!hasRecords ? (
                <tr className="h-12">
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="bg-white px-2" />
                  ))}
                </tr>
              ) : (
                chemicalRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`h-12 ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                  >
                    <td className="px-2 py-2 text-center">
                      <Link
                        to={`${basePath}/records/${record.id}`}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <Link
          to={`${basePath}/new`}
          state={{ date, inspectorName }}
          className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-full rounded-lg flex items-center justify-center gap-1 text-lg text-[var(--semantic-brand-primary)]"
        >
          <img src={iconPlus} alt="" className="size-5 shrink-0" />
          記録を追加
        </Link>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
        <Link
          to="/app/ledger-list/chemical-management"
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
